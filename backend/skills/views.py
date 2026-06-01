import json
import logging
import random
from django.conf import settings

logger = logging.getLogger(__name__)

TIER_LEVEL_ORDER = ["beginner", "junior", "middle", "senior"]
TIER_LEVEL_BAND = {
    "junior": (0, 1),
    "middle": (1, 2),
    "senior": (2, 3),
}

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import SkillTest, Question
from .serializers import (
    QuestionSerializer, SkillTestSerializer, 
    SkillTestCreateSerializer, SkillEvaluationSerializer
)

def _shuffle_mcq_options(opts: list, correct_idx: int) -> tuple:
    """Randomize four options; return (shuffled_options, new_correct_index)."""
    if len(opts) < 4:
        return opts, correct_idx
    perm = list(range(4))
    random.shuffle(perm)
    shuffled = [opts[i] for i in perm]
    try:
        ca = int(correct_idx)
    except (TypeError, ValueError):
        ca = 0
    ca = max(0, min(3, ca))
    new_correct = perm.index(ca)
    return shuffled, new_correct


def _normalize_question_for_eval(q: dict) -> dict:
    text = (q.get("q") or q.get("question_text") or "").strip()
    options = q.get("options") or []
    ca = q.get("correct_answer")
    if ca is None:
        ca = q.get("correct", 0)
    try:
        ca = int(ca)
    except (TypeError, ValueError):
        ca = 0
    return {
        "question_text": text,
        "options": options,
        "correct_answer": ca,
        "difficulty": q.get("difficulty", "medium"),
    }


def _cap_level_by_tier(level: str, tier: str) -> str:
    tier = (tier or "").lower()
    band = TIER_LEVEL_BAND.get(tier)
    if not band or level not in TIER_LEVEL_ORDER:
        return level
    lo, hi = band
    idx = TIER_LEVEL_ORDER.index(level)
    idx = max(lo, min(idx, hi))
    return TIER_LEVEL_ORDER[idx]


def _level_display(level: str) -> str:
    return {
        "beginner": "Beginner",
        "junior": "Junior",
        "middle": "Middle",
        "senior": "Senior",
    }.get(level, (level or "junior").title())


def career_id_to_job_role(career_id: str) -> str:
    """Map SPA career id to Job.role / SkillTest.role for recommendations."""
    cid = (career_id or "").lower().strip()
    return {
        "frontend": "frontend",
        "backend": "backend",
        "fullstack": "fullstack",
        "mobile": "mobile",
        "devops": "devops",
        "designer": "designer",
        "data": "backend",
        "qa": "frontend",
        "cybersecurity": "devops",
        "management": "fullstack",
        "cloud": "devops",
        "ai_ml": "backend",
        "blockchain": "backend",
    }.get(cid, "fullstack")


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def generate_test_session(request):
    """
    Return fresh MCQ for one test session (JSON only, not saved to DB).
    Requires GOOGLE_AI_API_KEY.
    """
    role = (request.data.get("role") or "").strip()
    tier = (request.data.get("tier") or "junior").lower()
    language = (request.data.get("language") or "").strip()
    career_title = (request.data.get("career_title") or role).strip()
    try:
        count = int(request.data.get("count", 10))
    except (TypeError, ValueError):
        count = 10
    count = max(5, min(count, 15))

    if not role:
        return Response({"error": "role is required"}, status=status.HTTP_400_BAD_REQUEST)

    tier_hints = {
        "junior": "Entry-level: syntax, basics, simple scenarios. No architecture.",
        "middle": "Intermediate: APIs, debugging, patterns, tooling.",
        "senior": "Advanced: scalability, tradeoffs, performance, system design light.",
    }
    tier_desc = tier_hints.get(tier, tier_hints["junior"])

    stack_line = f"Primary stack / language: {language}." if language else ""

    prompt = f"""You write technical skill assessment questions for women in tech (clear, respectful tone).

Context:
- Career track: {career_title}
- Difficulty tier: {tier.upper()} — {tier_desc}
- {stack_line}

Generate exactly {count} multiple-choice questions. Each question:
- 4 options as strings (A–D content only, not prefixed with letters)
- Exactly one correct answer; put the correct index in correct_answer (0–3)
- Practical or conceptual, appropriate for the tier

Return JSON with this exact shape:
{{
  "questions": [
    {{
      "question_text": "string",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correct_answer": 0
    }}
  ]
}}"""

    from dev_diva_quest.gemini_service import GeminiError, generate_json

    try:
        data = generate_json(
            prompt,
            system_instruction="Output only valid JSON. No markdown.",
        )
    except GeminiError as e:
        return Response(
            {"error": str(e), "code": e.code},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    if not data:
        return Response(
            {
                "error": "AI is unavailable. Set GOOGLE_AI_API_KEY and GEMINI_MODEL in backend/.env.",
                "code": "NO_AI",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    raw_list = data.get("questions") if isinstance(data, dict) else None
    if isinstance(data, list):
        raw_list = data
    if not isinstance(raw_list, list) or not raw_list:
        return Response(
            {"error": "Unexpected AI response shape", "code": "BAD_AI_SHAPE"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    out = []
    for item in raw_list:
        if not isinstance(item, dict):
            continue
        text = (item.get("question_text") or item.get("q") or "").strip()
        opts = item.get("options") or []
        if len(opts) < 4:
            continue
        try:
            ca = int(item.get("correct_answer", item.get("correct", 0)))
        except (TypeError, ValueError):
            ca = 0
        ca = max(0, min(3, ca))
        shuffled_opts, new_ca = _shuffle_mcq_options(opts[:4], ca)
        out.append({"q": text, "options": shuffled_opts, "correct": new_ca})

    if len(out) < 5:
        return Response(
            {"error": "AI returned too few valid questions", "code": "SHORT_AI"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"questions": out, "source": "ai", "tier": tier, "role": role})


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
    
    all_questions = list(questions)
    
    if not all_questions:
        return Response(
            {'error': f'No questions found for role: {role}'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = QuestionSerializer(all_questions, many=True)
    return Response({
        'questions': serializer.data,
        'total': len(all_questions),
        'role': role
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  
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
    career_id = request.data.get('career_id')
    if career_id:
        role = career_id_to_job_role(str(career_id))
    else:
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
        'career_id': str(career_id) if career_id else None,
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
@permission_classes([permissions.AllowAny])
def evaluate_skill(request):
    serializer = SkillEvaluationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    role = serializer.validated_data['role']
    tier = serializer.validated_data.get('tier') or ''
    raw_questions = serializer.validated_data['questions']
    answers = serializer.validated_data['answers']

    try:
        questions = [_normalize_question_for_eval(q) for q in raw_questions]
        total_questions = len(questions)
        if total_questions == 0:
            return Response(
                {'error': 'No questions provided'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        correct_count = 0
        for i, answer in enumerate(answers):
            qn = questions[i]
            correct_answer_index = qn.get('correct_answer', 0)
            if answer == correct_answer_index:
                correct_count += 1

        score_percentage = (correct_count / total_questions) * 100

        if score_percentage <= 20:
            level = 'beginner'
        elif score_percentage <= 40:
            level = 'junior'
        elif score_percentage <= 70:
            level = 'middle'
        else:
            level = 'senior'

        level = _cap_level_by_tier(level, tier)

        feedback = (
            f"You scored {correct_count}/{total_questions} ({score_percentage:.1f}%). "
            f"Your assessed level for this tier: {_level_display(level)}."
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
            'percentage': round(score_percentage, 1),
            'level': level,
            'level_display': _level_display(level),
            'feedback': feedback,
            'weak_topics': weak_topics,
            'next_steps': next_steps,
            'role': role,
        })

    except Exception as e:
        logger.exception("evaluate_skill failed")
        return Response(
            {'error': f'Failed to evaluate skills: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
