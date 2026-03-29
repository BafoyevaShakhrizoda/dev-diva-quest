import json
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

    latest_tests = SkillTest.objects.filter(user=user).order_by('-created_at')

    if not latest_tests.exists():
        return Response({
            'message': 'No skill tests found. Take a skill test first to get job recommendations.',
            'jobs': []
        })

    user_levels = {}
    for test in latest_tests:
        role = test.role
        if role not in user_levels or get_level_num(test.result_level) > get_level_num(user_levels[role]):
            user_levels[role] = test.result_level

    roles = list(user_levels.keys())
    matching_jobs = Job.objects.filter(
        Q(role__in=roles) | Q(role='fullstack'),
        active=True,
    ).distinct()

    jobs_list = list(matching_jobs[:50])
    if not jobs_list:
        return Response({
            'user_levels': user_levels,
            'total_matches': 0,
            'jobs': [],
        })

    ai_scores = {}
    if settings.GOOGLE_AI_API_KEY:
        ai_scores = batch_job_match_scores(user_levels, jobs_list)

    recommended = []
    seen_job_ids = set()

    for job in jobs_list:
        if job.id in seen_job_ids:
            continue
        seen_job_ids.add(job.id)
        role, user_level = pick_role_level_for_job(job, user_levels)
        if job.id in ai_scores:
            match_score = ai_scores[job.id]
        else:
            match_score = calculate_match_score_rule_only(job, role, user_level)

        if match_score >= 60:
            job_match, created = JobMatch.objects.get_or_create(
                user=user,
                job=job,
                defaults={
                    'match_score': match_score,
                    'skill_level': user_level,
                    'is_recommended': match_score >= 75,
                },
            )
            if not created:
                job_match.match_score = match_score
                job_match.skill_level = user_level
                job_match.is_recommended = match_score >= 75
                job_match.save()
            recommended.append(job_match)

    recommended.sort(key=lambda x: x.match_score, reverse=True)
    recommended = recommended[:20]

    serializer = JobMatchSerializer(recommended, many=True)
    return Response({
        'user_levels': user_levels,
        'total_matches': len(recommended),
        'jobs': serializer.data,
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


def pick_role_level_for_job(job, user_levels):
    """Pick the user role/level row that best fits this job (for storing JobMatch)."""
    if job.role in user_levels:
        return job.role, user_levels[job.role]
    if job.role == 'fullstack':
        best_role = max(user_levels.keys(), key=lambda r: get_level_num(user_levels[r]))
        return best_role, user_levels[best_role]
    best_role = max(user_levels.keys(), key=lambda r: get_level_num(user_levels[r]))
    return best_role, user_levels[best_role]


def calculate_match_score_rule_only(job, user_role, user_level):
    """Heuristic 0–100 score without AI (fallback when batch/single AI fails)."""
    score = 0
    if job.role == user_role:
        score += 40
    elif job.role == 'fullstack' or user_role == 'fullstack':
        score += 30
    else:
        score += 10
    level_match = get_level_match(job.experience_level, user_level)
    score += level_match * 30
    score += 15
    return min(100, int(round(score)))


def batch_job_match_scores(user_levels, jobs):
    """
    One Gemini request for up to len(jobs) vacancies.
    Returns dict job_id -> 0–100; empty dict if API missing or parse fails.
    """
    from dev_diva_quest.gemini_service import generate_json

    jobs_payload = [
        {
            'id': j.id,
            'title': j.title,
            'company': j.company,
            'role': j.role,
            'experience_level': j.experience_level,
            'requirements': (j.requirements or '')[:4000],
        }
        for j in jobs
    ]
    profile = {'role_levels': user_levels}
    prompt = f"""User skill test results (role -> level): {json.dumps(profile)}

Jobs to score (each row is independent): {json.dumps(jobs_payload)}

Return JSON with this exact shape:
{{"matches": [{{"job_id": <int>, "match_score": <0-100 integer>, "reason": "<one short sentence>"}}]}}

Rules:
- Include every job id from the input exactly once.
- match_score reflects role fit, experience level, and requirements."""

    data = generate_json(
        prompt,
        system_instruction='You are an IT recruiting analyst. Output only valid JSON.',
    )
    if not data or not isinstance(data, dict):
        return {}
    matches = data.get('matches') or data.get('results')
    if not isinstance(matches, list):
        return {}
    out = {}
    for m in matches:
        if not isinstance(m, dict):
            continue
        jid = m.get('job_id') if m.get('job_id') is not None else m.get('id')
        if jid is None:
            continue
        try:
            jid = int(jid)
        except (TypeError, ValueError):
            continue
        raw = m.get('match_score') if m.get('match_score') is not None else m.get('score')
        if raw is None:
            continue
        try:
            score = int(round(float(raw)))
        except (TypeError, ValueError):
            continue
        out[jid] = max(0, min(100, score))
    return out


def calculate_match_score(job, user_role, user_level):
    """Calculate match score between user and job (single job; one AI JSON call for the 30pt slice)."""
    score = 0

    if job.role == user_role:
        score += 40
    elif job.role == 'fullstack' or user_role == 'fullstack':
        score += 30
    else:
        score += 10

    level_match = get_level_match(job.experience_level, user_level)
    score += level_match * 30

    if settings.GOOGLE_AI_API_KEY:
        try:
            ai_score = get_ai_match_score(job, user_role, user_level)
            score += ai_score * 30
        except Exception:
            score += 15
    else:
        score += 15

    return min(100, int(round(score)))


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
    """0.0–1.0 fit for requirements slice; JSON response via shared Gemini helper."""
    from dev_diva_quest.gemini_service import generate_json

    prompt = f"""Job:
Title: {job.title}
Company: {job.company}
Requirements: {(job.requirements or '')[:8000]}
Role: {job.role}
Experience level required: {job.experience_level}

User profile:
Role: {user_role}
Level: {user_level}

Return JSON: {{"score": <number from 0.0 to 1.0>}}"""

    data = generate_json(
        prompt,
        system_instruction='You are an IT recruiter. Compare the user profile to the job. Return only JSON.',
    )
    if not data or not isinstance(data, dict):
        return 0.5
    raw = data.get('score')
    if raw is None:
        return 0.5
    try:
        return float(max(0.0, min(1.0, float(raw))))
    except (TypeError, ValueError):
        return 0.5


def get_level_num(level):
    level_map = {'beginner': 0, 'junior': 1, 'middle': 2, 'senior': 3}
    return level_map.get(level, 0)
