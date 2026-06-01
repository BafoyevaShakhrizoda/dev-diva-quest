from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile

AVATAR_MAX_BYTES = 2 * 1024 * 1024


def _optional_http_url(value: str) -> str:
    v = (value or '').strip()
    if not v:
        return ''
    if v.startswith(('http://', 'https://')):
        return v
    return f'https://{v.lstrip("/")}'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'email_verified', 'created_at']
        read_only_fields = ['id', 'email_verified', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'avatar_url', 'bio', 'location', 'github_url',
                  'linkedin_url', 'telegram', 'phone', 'skills', 'experience_years',
                  'education', 'resume_url']
        read_only_fields = ['id', 'user']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.avatar and instance.avatar.name:
            url = instance.avatar.url
            ret['avatar_url'] = request.build_absolute_uri(url) if request else url
        return ret


class ProfileUpdateSerializer(serializers.Serializer):
    """Multipart or JSON profile + linked user fields."""

    first_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    role = serializers.CharField(required=False, allow_blank=True, max_length=20)
    bio = serializers.CharField(required=False, allow_blank=True, max_length=500)
    location = serializers.CharField(required=False, allow_blank=True, max_length=100)
    github_url = serializers.CharField(required=False, allow_blank=True, max_length=200)
    linkedin_url = serializers.CharField(required=False, allow_blank=True, max_length=200)
    telegram = serializers.CharField(required=False, allow_blank=True, max_length=50)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    experience_years = serializers.IntegerField(required=False, allow_null=True, min_value=0, max_value=80)
    resume_url = serializers.CharField(required=False, allow_blank=True, max_length=200)
    avatar_url = serializers.CharField(required=False, allow_blank=True, max_length=200)
    avatar = serializers.ImageField(required=False, allow_empty_file=False)
    clear_avatar = serializers.BooleanField(required=False, default=False)

    def validate_avatar(self, value):
        if value and value.size > AVATAR_MAX_BYTES:
            raise serializers.ValidationError('Image must be 2 MB or smaller.')
        return value

    def validate_role(self, value):
        if value in (None, ''):
            return None
        allowed = {c[0] for c in User.ROLE_CHOICES}
        if value not in allowed:
            raise serializers.ValidationError('Invalid role.')
        return value

    def update(self, profile, validated_data):
        user = profile.user
        clear_avatar = validated_data.pop('clear_avatar', False)
        avatar_file = validated_data.pop('avatar', None)

        for key in ('first_name', 'last_name', 'role'):
            if key in validated_data:
                val = validated_data.pop(key)
                if key == 'role':
                    user.role = val
                else:
                    setattr(user, key, val or '')
        user.save()

        if clear_avatar and profile.avatar:
            profile.avatar.delete(save=False)
            profile.avatar = None

        if avatar_file is not None:
            if profile.avatar:
                profile.avatar.delete(save=False)
            profile.avatar = avatar_file

        for attr, value in validated_data.items():
            if attr in ('github_url', 'linkedin_url', 'resume_url', 'avatar_url'):
                value = _optional_http_url(str(value or ''))
            setattr(profile, attr, value)
        profile.save()
        return profile


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': "Passwords don't match."})
        return data

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate_new_password(self, value):
        validate_password(value, user=self.context['request'].user)
        return value


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm',
                  'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Accepts email_or_username (API) or email (SPA) plus password."""

    email_or_username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField()

    def validate(self, data):
        identifier = (data.get('email_or_username') or data.get('email') or '').strip()
        password = data.get('password')

        if not identifier or not password:
            raise serializers.ValidationError('Must include email (or username) and password')

        user = authenticate(username=identifier, password=password)
        if not user and '@' in identifier:
            try:
                u = User.objects.get(email__iexact=identifier)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            raise serializers.ValidationError('Invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled')

        data['user'] = user
        return data
