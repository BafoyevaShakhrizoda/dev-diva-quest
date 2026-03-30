from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile


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


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name']  # Email optional but included

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Auto-verify email since it's optional
        user.email_verified = True
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    # Support both email and username for login
    email_or_username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        email_or_username = data.get('email_or_username')
        password = data.get('password')

        if email_or_username and password:
            # Try login with email first
            user = authenticate(username=email_or_username, password=password)
            if not user:
                # Try login with username
                user = authenticate(username=email_or_username, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            
            # Email verification check removed since email is optional
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include email/username and password')
        return data
