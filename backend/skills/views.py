import json
import random
import openai
from django.conf import settings
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
    role = request.query_params.get('role')
    if not role:
        return Response(
            {'error': 'Role parameter is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    questions = Question.objects.filter(role=role)
    
    # Get all available questions for this role
    question_list = list(questions)
    
    # Shuffle options for each question
    for question in question_list:
        options = question.options.copy()
        random.shuffle(options)
        question.options = options
    
    serializer = QuestionSerializer(question_list, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def evaluate_skill(request):
    serializer = SkillEvaluationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    role = serializer.validated_data['role']
    questions = serializer.validated_data['questions']
    answers = serializer.validated_data['answers']
    
    try:
        # Calculate score based on total questions
        total_questions = len(questions)
        correct_count = 0
        
        for i, answer in enumerate(answers):
            if answer == 0:  # First option is always correct
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
        
        # Generate AI feedback
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
        answers_text = '\n\n'.join([
            f"Q{i+1}: {q['question_text']}\nSelected answer: {q['options'][answers[i]]}"
            for i, q in enumerate(questions)
        ])
        
        prompt = f"""You are an expert IT career evaluator. A user just took a skill test for the role of "{role}".

Here are their answers:
{answers_text}

The correct answers are always the FIRST option (index 0) for each question.

Test Results:
- Total Questions: {total_questions}
- Correct Answers: {correct_count}
- Score: {score_percentage:.1f}%

Based on their performance, evaluate their skill level:
- 0-20% correct: Beginner (just starting out)
- 21-40% correct: Junior (basic knowledge)
- 41-70% correct: Middle (solid understanding)
- 71-100% correct: Senior (expert-level mastery)

Current assessment: {level} ({score_percentage:.1f}%)

Respond with a JSON object exactly like this:
{{
  "level": "{level}",
  "feedback": "2-3 sentences of personalized, encouraging feedback explaining their {score_percentage:.1f}% score and {level} level. Include specific advice for improvement and what to focus on next. Be warm and supportive like a mentor to a young woman starting her career."
}}"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        ai_response = json.loads(response.choices[0].message.content)
        feedback = ai_response.get('feedback', 'Great job on completing the skill test!')
        
        # Save test result
        skill_test = SkillTest.objects.create(
            user=request.user,
            role=role,
            questions=questions,
            answers=answers,
            result_level=level,
            feedback=feedback,
            score=correct_count
        )
        
        return Response({
            'level': level,
            'feedback': feedback,
            'score': score_percentage,
            'correct_answers': correct_count,
            'total_questions': total_questions,
            'test_id': skill_test.id
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
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
