from datetime import timedelta

from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from cv.models import CV, CVTemplate
from events.models import Event
from jobs.models import Job, JobApplication, JobMatch
from skills.models import Question, SkillTest

from .permissions import IsStaffUser

User = get_user_model()

ADMIN_CAPABILITIES = [
    {
        'id': 'users',
        'title': 'Users & profiles',
        'description': 'View and edit registered accounts, verify emails, and manage user profiles.',
        'django_section': 'Users',
    },
    {
        'id': 'jobs',
        'title': 'Jobs & applications',
        'description': 'Publish job listings, review applications, and manage match scores.',
        'django_section': 'Jobs',
    },
    {
        'id': 'skills',
        'title': 'Skill assessments',
        'description': 'Maintain question banks, review completed tests, and monitor assessment trends.',
        'django_section': 'Skills',
    },
    {
        'id': 'cv',
        'title': 'CV builder',
        'description': 'Manage CV templates and review stored CV drafts when needed for support.',
        'django_section': 'CV',
    },
    {
        'id': 'events',
        'title': 'Events calendar',
        'description': 'Curate Uzbekistan IT events shown on the dashboard.',
        'django_section': 'Events',
    },
    {
        'id': 'stats',
        'title': 'Platform statistics',
        'description': 'View live counts of users, jobs, tests, and applications in this admin dashboard.',
        'django_section': None,
    },
    {
        'id': 'django_admin',
        'title': 'Django admin (full CRUD)',
        'description': 'Access the full Django admin for advanced database operations and bulk edits.',
        'django_section': 'Django Admin',
    },
]


def _staff_user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email or '',
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    }


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def admin_login(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)
    if user is None and '@' in username:
        try:
            u = User.objects.get(email__iexact=username)
            user = authenticate(request, username=u.username, password=password)
        except User.DoesNotExist:
            user = None
    if user is None:
        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_staff:
        return Response(
            {'error': 'This account does not have staff access.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': _staff_user_payload(user),
    })


@api_view(['POST'])
@permission_classes([IsStaffUser])
def admin_logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response({'message': 'Logged out.'})


@api_view(['GET'])
@permission_classes([IsStaffUser])
def admin_me(request):
    return Response({'user': _staff_user_payload(request.user)})


@api_view(['GET'])
@permission_classes([IsStaffUser])
def admin_stats(request):
    now = timezone.now()
    week_ago = now - timedelta(days=7)

    users_total = User.objects.count()
    users_verified = User.objects.filter(email_verified=True).count()
    users_new_week = User.objects.filter(created_at__gte=week_ago).count()

    jobs_active = Job.objects.filter(active=True).count()
    jobs_total = Job.objects.count()
    applications_total = JobApplication.objects.count()
    applications_pending = JobApplication.objects.filter(status='pending').count()
    matches_total = JobMatch.objects.count()

    tests_total = SkillTest.objects.count()
    tests_week = SkillTest.objects.filter(created_at__gte=week_ago).count()
    questions_total = Question.objects.count()

    cvs_total = CV.objects.count()
    templates_total = CVTemplate.objects.filter(is_active=True).count()

    events_active = Event.objects.filter(is_active=True).count()
    events_total = Event.objects.count()

    tests_by_role = list(
        SkillTest.objects.values('role')
        .annotate(count=Count('id'))
        .order_by('-count')[:6]
    )

    applications_by_status = list(
        JobApplication.objects.values('status')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    return Response({
        'generated_at': now.isoformat(),
        'users': {
            'total': users_total,
            'verified': users_verified,
            'new_this_week': users_new_week,
        },
        'jobs': {
            'total': jobs_total,
            'active': jobs_active,
            'applications': applications_total,
            'applications_pending': applications_pending,
            'matches': matches_total,
        },
        'skills': {
            'tests_total': tests_total,
            'tests_this_week': tests_week,
            'questions': questions_total,
            'by_role': tests_by_role,
        },
        'cv': {
            'total': cvs_total,
            'active_templates': templates_total,
        },
        'events': {
            'total': events_total,
            'active': events_active,
        },
        'applications_by_status': applications_by_status,
    })


@api_view(['GET'])
@permission_classes([IsStaffUser])
def admin_permissions(request):
    user = request.user
    capabilities = []
    for cap in ADMIN_CAPABILITIES:
        entry = dict(cap)
        if cap['id'] == 'django_admin' and not user.is_superuser:
            entry['access'] = 'read_only_note'
            entry['note'] = 'Superuser accounts have full Django admin access.'
        else:
            entry['access'] = 'granted'
        capabilities.append(entry)

    return Response({
        'role': 'superuser' if user.is_superuser else 'staff',
        'capabilities': capabilities,
    })
