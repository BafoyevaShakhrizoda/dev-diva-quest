import json
import google.generativeai as genai
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Avg
from .models import Job, JobMatch, JobApplication
from skills.models import SkillTest
from .serializers import JobSerializer, JobMatchSerializer, JobApplicationSerializer, JobApplicationCreateSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recommended_jobs(request):
    user = request.user
    
    # Get user's latest skill test results
    latest_tests = SkillTest.objects.filter(user=user).order_by('-created_at')
    
    if not latest_tests.exists():
        return Response({
            'message': 'No skill tests found. Take a skill test first to get job recommendations.',
            'jobs': []
        })
    
    # Get user's best level for each role
    user_levels = {}
    for test in latest_tests:
        role = test.role
        if role not in user_levels or get_level_num(test.result_level) > get_level_num(user_levels[role]):
            user_levels[role] = test.result_level
    
    # Find matching jobs
    recommended_jobs = []
    
    for role, user_level in user_levels.items():
        # Find jobs matching user's role and level
        matching_jobs = Job.objects.filter(
            Q(role=role) | Q(role='fullstack'),
            active=True
        )
        
        for job in matching_jobs:
            # Calculate match score
            match_score = calculate_match_score(job, role, user_level)
            
            if match_score >= 60:  # Only recommend jobs with 60%+ match
                # Create or update job match
                job_match, created = JobMatch.objects.get_or_create(
                    user=user,
                    job=job,
                    defaults={
                        'match_score': match_score,
                        'skill_level': user_level,
                        'is_recommended': match_score >= 75
                    }
                )
                
                if not created:
                    job_match.match_score = match_score
                    job_match.skill_level = user_level
                    job_match.is_recommended = match_score >= 75
                    job_match.save()
                
                recommended_jobs.append(job_match)
    
    # Sort by match score
    recommended_jobs.sort(key=lambda x: x.match_score, reverse=True)
    
    # Limit to top 20 recommendations
    recommended_jobs = recommended_jobs[:20]
    
    serializer = JobMatchSerializer(recommended_jobs, many=True)
    return Response({
        'user_levels': user_levels,
        'total_matches': len(recommended_jobs),
        'jobs': serializer.data
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def all_jobs(request):
    role = request.query_params.get('role')
    level = request.query_params.get('level')
    location = request.query_params.get('location')
    search = request.query_params.get('search', '')
    
    jobs = Job.objects.filter(active=True)
    
    if role:
        jobs = jobs.filter(Q(role=role) | Q(role='fullstack'))
    if level:
        jobs = jobs.filter(experience_level=level)
    if location:
        jobs = jobs.filter(location__icontains=location)
    if search:
        jobs = jobs.filter(
            Q(title__icontains=search) |
            Q(company__icontains=search) |
            Q(description__icontains=search) |
            Q(requirements__icontains=search)
        )
    
    # Add context for has_applied field
    serializer = JobSerializer(jobs[:50], many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def apply_job(request, job_id):
    try:
        job = Job.objects.get(id=job_id, active=True)
        user = request.user
        
        serializer = JobApplicationCreateSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            application = serializer.save(user=user, job=job)
            
            # Send notification email to company (optional)
            try:
                send_application_notification(user, job, application)
            except Exception as e:
                print(f"Failed to send notification: {e}")
            
            response_serializer = JobApplicationSerializer(application)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found or not active'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_applications(request):
    applications = JobApplication.objects.filter(user=request.user)
    serializer = JobApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def job_applications(request, job_id):
    try:
        job = Job.objects.get(id=job_id)
        # Only job owner or admin can see applications
        if job.company != request.user.email and not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = JobApplication.objects.filter(job=job)
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)
        
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_application_status(request, application_id):
    try:
        application = JobApplication.objects.get(id=application_id)
        job = application.job
        
        # Only job owner can update status
        if job.company != request.user.email and not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        if new_status in dict(JobApplication.STATUS_CHOICES):
            application.status = new_status
            application.save()
            
            # Send status update email to user (optional)
            try:
                send_status_update_email(application)
            except Exception as e:
                print(f"Failed to send status update: {e}")
            
            serializer = JobApplicationSerializer(application)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except JobApplication.DoesNotExist:
        return Response(
            {'error': 'Application not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_job_match(request, job_id):
    try:
        job = Job.objects.get(id=job_id, active=True)
        user = request.user
        
        # Get user's latest test result for this role
        latest_test = SkillTest.objects.filter(
            user=user,
            role__in=[job.role, 'fullstack']
        ).first()
        
        if not latest_test:
            return Response(
                {'error': 'No skill test found for this role'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        match_score = calculate_match_score(job, latest_test.role, latest_test.result_level)
        
        job_match, created = JobMatch.objects.get_or_create(
            user=user,
            job=job,
            defaults={
                'match_score': match_score,
                'skill_level': latest_test.result_level,
                'is_recommended': match_score >= 75
            }
        )
        
        serializer = JobMatchSerializer(job_match)
        return Response(serializer.data)
        
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found'},
            status=status.HTTP_404_NOT_FOUND
        )


def calculate_match_score(job, user_role, user_level):
    """Calculate match score between user and job"""
    score = 0
    
    # Role matching (40 points)
    if job.role == user_role:
        score += 40
    elif job.role == 'fullstack' or user_role == 'fullstack':
        score += 30
    else:
        score += 10
    
    # Level matching (30 points)
    level_match = get_level_match(job.experience_level, user_level)
    score += level_match * 30
    
    # AI-powered requirements matching (30 points)
    if settings.GOOGLE_AI_API_KEY:
        try:
            ai_score = get_ai_match_score(job, user_role, user_level)
            score += ai_score * 30
        except:
            score += 15  # Default middle score if AI fails
    else:
        score += 15
    
    return min(100, score)


def get_level_match(job_level, user_level):
    """Get level match score (0-1)"""
    job_num = get_level_num(job_level)
    user_num = get_level_num(user_level)
    
    if user_num >= job_num:
        # User is qualified or overqualified
        return 1.0
    elif user_num == job_num - 1:
        # User is one level below
        return 0.7
    else:
        # User is significantly below requirements
        return 0.3


def get_ai_match_score(job, user_role, user_level):
    """Use AI to analyze job requirements and user skills"""
    try:
        # Configure Gemini
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""Analyze how well a {user_level} {user_role} developer matches this job:

Job Title: {job.title}
Company: {job.company}
Requirements: {job.requirements}
Experience Level: {job.experience_level}

User Profile:
- Role: {user_role}
- Level: {user_level}

Rate the match from 0.0 to 1.0 based on:
1. Role alignment (40%)
2. Experience level match (30%)
3. Requirements compatibility (30%)

Respond with only a number between 0.0 and 1.0."""

        response = model.generate_content(prompt)
        score_text = response.text.strip()
        
        # Extract numeric score
        import re
        score_match = re.search(r'0\.\d+|1\.0|0|1', score_text)
        if score_match:
            return float(score_match.group())
        else:
            return 0.5  # Default middle score
            
    except Exception as e:
        print(f"AI match score error: {e}")
        return 0.5


def get_level_num(level):
    level_map = {'beginner': 0, 'junior': 1, 'middle': 2, 'senior': 3}
    return level_map.get(level, 0)
