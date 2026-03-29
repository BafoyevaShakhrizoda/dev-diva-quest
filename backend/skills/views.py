import json
import logging
import random
from django.conf import settings

logger = logging.getLogger(__name__)
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import SkillTest, Question
from .serializers import (
    QuestionSerializer, SkillTestSerializer, 
    SkillTestCreateSerializer, SkillEvaluationSerializer
)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_questions(request):
    """Get questions for a specific role"""
    role = request.query_params.get('role')
    if not role:
        return Response(
            {'error': 'Role parameter is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    questions = Question.objects.filter(role=role)
    
    # Get all available questions for this role
    all_questions = list(questions)
    
    if not all_questions:
        return Response(
            {'error': f'No questions found for role: {role}'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Return all questions (frontend will select which ones to use)
    serializer = QuestionSerializer(all_questions, many=True)
    return Response({
        'questions': serializer.data,
        'total': len(all_questions),
        'role': role
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Changed to AllowAny for testing
def generate_questions(request):
    """Generate AI-powered questions for skill tests"""
    role = request.data.get('role')
    count = request.data.get('count', 10)
    
    if not role:
        return Response(
            {'error': 'Role is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from dev_diva_quest.gemini_service import generate_json

        prompt = f"""Generate {count} multiple-choice questions for a {role} skill assessment test.

Requirements:
- Each question must have 4 options (A, B, C, D)
- Only one correct answer
- Questions should test practical knowledge
- Include a mix of theory and practical scenarios
- Difficulty should be appropriate for junior to middle level

Return JSON with this exact shape:
{{
  "questions": [
    {{
      "question_text": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "difficulty": "easy"
    }}
  ]
}}
Use difficulty one of: easy, medium, hard."""

        data = generate_json(
            prompt,
            system_instruction='You write technical interview questions. Output only valid JSON.',
        )
        if not data:
            return Response(
                {'error': 'AI is unavailable or returned empty. Check GOOGLE_AI_API_KEY and GEMINI_MODEL.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if isinstance(data, list):
            questions = data
        elif isinstance(data, dict) and 'questions' in data:
            questions = data['questions']
        else:
            return Response(
                {'error': 'Unexpected AI response shape'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        saved_questions = []
        for q in questions:
            question = Question.objects.create(
                role=role,
                question_text=q['question_text'],
                options=q['options'],
                correct_answer=q['correct_answer'],
                difficulty=q.get('difficulty', 'medium'),
            )
            saved_questions.append(QuestionSerializer(question).data)

        return Response({
            'questions': saved_questions,
            'message': f'Generated {len(saved_questions)} questions for {role}',
        })

    except Exception as e:
        logger.exception("Question generation failed")
        return Response(
            {'error': f'Failed to generate questions: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _normalize_skill_role(role_id: str) -> str:
    valid = {c[0] for c in SkillTest.ROLE_CHOICES}
    if role_id in valid:
        return role_id
    aliases = {
        'qa': 'testing',
        'data': 'python',
        'designer': 'designer',
    }
    return aliases.get(role_id, 'frontend')


def _normalize_level(level_raw: str) -> str:
    mapping = {
        'Beginner': 'beginner',
        'Junior': 'junior',
        'Middle': 'middle',
        'Senior': 'senior',
        'beginner': 'beginner',
        'junior': 'junior',
        'middle': 'middle',
        'senior': 'senior',
    }
    return mapping.get(level_raw, 'junior')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_skill_result(request):
    """Store a skill test result from the SPA (after client-side / edge evaluation)."""
    role_raw = request.data.get('role') or 'frontend'
    role = _normalize_skill_role(str(role_raw))
    language = request.data.get('language')
    tier = request.data.get('tier') or ''
    level_raw = request.data.get('level') or 'Junior'
    feedback = request.data.get('feedback') or ''
    score_str = str(request.data.get('score') or '0')
    questions_data = request.data.get('questions') or []
    answers_data = request.data.get('answers') or {}

    try:
        if '/' in score_str:
            score_int = int(score_str.split('/')[0].strip())
        else:
            score_int = int(float(score_str))
    except (ValueError, TypeError):
        score_int = 0

    questions_payload = {
        'items': questions_data,
        'language': language,
        'tier': tier,
    }
    answers_payload = answers_data if isinstance(answers_data, dict) else {'raw': answers_data}
    result_level = _normalize_level(str(level_raw))

    test = SkillTest.objects.create(
        user=request.user,
        role=role,
        questions=questions_payload,
        answers=answers_payload,
        result_level=result_level,
        feedback=feedback,
        score=score_int,
        score_percentage=0.0,
    )
    serializer = SkillTestSerializer(test)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


def _ai_skill_evaluation_extras(
    role,
    questions,
    answers,
    correct_count,
    total_questions,
    score_percentage,
    level,
):
    """Personalized mentor feedback via one JSON Gemini call."""
    from dev_diva_quest.gemini_service import generate_json

    wrong = []
    for i, answer in enumerate(answers):
        if i >= len(questions):
            break
        q = questions[i]
        correct_idx = q.get('correct_answer', 0)
        if answer != correct_idx:
            wrong.append({
                'question': (q.get('question_text') or '')[:500],
                'difficulty': q.get('difficulty', 'medium'),
            })

    payload = {
        'role': role,
        'score': f'{correct_count}/{total_questions}',
        'percentage': round(score_percentage, 1),
        'level': level,
        'missed_items': wrong,
    }
    prompt = f"""Test result summary: {json.dumps(payload)}

Return JSON with keys:
- feedback: string (2-5 sentences, friendly mentor tone, concrete study advice)
- weak_topics: array of short strings (areas to improve)
- next_steps: array of short actionable steps"""

    data = generate_json(
        prompt,
        system_instruction='You are a supportive coding mentor. Output only valid JSON.',
    )
    if not data or not isinstance(data, dict):
        return None
    wt = data.get('weak_topics')
    ns = data.get('next_steps')
    return {
        'feedback': data.get('feedback') or '',
        'weak_topics': wt if isinstance(wt, list) else [],
        'next_steps': ns if isinstance(ns, list) else [],
    }


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Changed to AllowAny for testing
def evaluate_skill(request):
    serializer = SkillEvaluationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    role = serializer.validated_data['role']
    questions = serializer.validated_data['questions']
    answers = serializer.validated_data['answers']
    
    try:
        total_questions = len(questions)
        if total_questions == 0:
            return Response(
                {'error': 'No questions provided'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        correct_count = 0

        for i, answer in enumerate(answers):
            # Get the correct answer from question data
            question_data = questions[i]
            correct_answer_index = question_data.get('correct_answer', 0)  # Default to 0 if not specified
            
            if answer == correct_answer_index:
                correct_count += 1
        
        # Calculate percentage
        score_percentage = (correct_count / total_questions) * 100
        
        # Determine level based on percentage
        if score_percentage <= 20:
            level = 'beginner'
        elif score_percentage <= 40:
            level = 'junior'
        elif score_percentage <= 70:
            level = 'middle'
        else:
            level = 'senior'

        feedback = (
            f"You scored {correct_count}/{total_questions} ({score_percentage:.1f}%). "
            f"Your level: {level.title()}."
        )
        weak_topics: list = []
        next_steps: list = []

        if settings.GOOGLE_AI_API_KEY:
            extras = _ai_skill_evaluation_extras(
                role=role,
                questions=questions,
                answers=answers,
                correct_count=correct_count,
                total_questions=total_questions,
                score_percentage=score_percentage,
                level=level,
            )
            if extras:
                feedback = extras.get('feedback') or feedback
                weak_topics = extras.get('weak_topics') or []
                next_steps = extras.get('next_steps') or []

        return Response({
            'score': correct_count,
            'total_questions': total_questions,
            'percentage': score_percentage,
            'level': level,
            'feedback': feedback,
            'weak_topics': weak_topics,
            'next_steps': next_steps,
            'role': role,
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to evaluate skills: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_tests(request):
    tests = SkillTest.objects.filter(user=request.user)
    serializer = SkillTestSerializer(tests, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def test_detail(request, test_id):
    try:
        test = SkillTest.objects.get(id=test_id, user=request.user)
        serializer = SkillTestSerializer(test)
        return Response(serializer.data)
    except SkillTest.DoesNotExist:
        return Response(
            {'error': 'Test not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
