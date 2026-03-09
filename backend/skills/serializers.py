from rest_framework import serializers
from .models import SkillTest, Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'role', 'question_text', 'options', 'difficulty']


class SkillTestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = SkillTest
        fields = ['id', 'user_email', 'role', 'result_level', 'feedback', 
                 'score', 'created_at']
        read_only_fields = ['id', 'user_email', 'result_level', 'feedback', 
                           'score', 'created_at']


class SkillTestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillTest
        fields = ['role', 'questions', 'answers']

    def validate(self, attrs):
        questions = attrs.get('questions', [])
        answers = attrs.get('answers', [])
        
        if len(questions) != len(answers):
            raise serializers.ValidationError(
                "Number of questions must match number of answers"
            )
        
        for i, answer in enumerate(answers):
            if not isinstance(answer, int) or answer < 0 or answer >= len(questions[i]['options']):
                raise serializers.ValidationError(
                    f"Invalid answer at index {i}: {answer}"
                )
        
        return attrs


class SkillEvaluationSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=SkillTest.ROLE_CHOICES)
    questions = serializers.ListField()
    answers = serializers.ListField()

    def validate(self, attrs):
        questions = attrs.get('questions', [])
        answers = attrs.get('answers', [])
        
        if len(questions) != len(answers):
            raise serializers.ValidationError(
                "Number of questions must match number of answers"
            )
        
        return attrs
