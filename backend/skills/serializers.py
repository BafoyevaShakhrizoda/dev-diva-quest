from rest_framework import serializers
from .models import SkillTest, Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'role', 'question_text', 'options', 'difficulty']


class SkillTestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    language = serializers.SerializerMethodField()
    tier = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()

    class Meta:
        model = SkillTest
        fields = [
            'id', 'user_email', 'role', 'language', 'tier', 'level',
            'result_level', 'feedback', 'score', 'created_at',
        ]
        read_only_fields = [
            'id', 'user_email', 'language', 'tier', 'level',
            'result_level', 'feedback', 'score', 'created_at',
        ]

    def get_language(self, obj):
        q = obj.questions or {}
        return q.get('language')

    def get_tier(self, obj):
        q = obj.questions or {}
        return q.get('tier')

    def get_level(self, obj):
        mapping = {
            'beginner': 'Beginner',
            'junior': 'Junior',
            'middle': 'Middle',
            'senior': 'Senior',
        }
        return mapping.get(obj.result_level, obj.result_level.title() if obj.result_level else '')


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
    """role: SkillTest role key (e.g. backend, frontend) or career id mapped client-side."""
    role = serializers.CharField(max_length=40)
    tier = serializers.CharField(required=False, allow_blank=True, default="")
    questions = serializers.ListField(child=serializers.DictField())
    answers = serializers.ListField(child=serializers.IntegerField())

    def validate(self, attrs):
        questions = attrs.get("questions", [])
        answers = attrs.get("answers", [])

        if len(questions) != len(answers):
            raise serializers.ValidationError(
                "Number of questions must match number of answers",
            )

        return attrs
