import json
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import CV, CVTemplate
from .serializers import CVSerializer, CVCreateSerializer, CVGenerationSerializer, CVTemplateSerializer


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_cv(request):
    serializer = CVGenerationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    cv_data = serializer.validated_data

    if not settings.GOOGLE_AI_API_KEY:
        return Response(
            {
                'error': 'GOOGLE_AI_API_KEY is not configured on the server — AI CV generation is unavailable.',
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    email = (cv_data.get('email') or '').strip() or getattr(request.user, 'email', '') or ''
    if not email:
        return Response(
            {'error': 'No email was provided and the authenticated user has no email on file.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    location = (cv_data.get('location') or '').strip() or '—'

    user_data = {
        'name': cv_data.get('name', ''),
        'target_role': cv_data.get('role', ''),
        'email': email,
        'phone': (cv_data.get('phone') or '').strip(),
        'location': location,
        'github': (cv_data.get('github') or '').strip(),
        'linkedin': (cv_data.get('linkedin') or '').strip(),
        'telegram': (cv_data.get('telegram') or '').strip(),
        'website': (cv_data.get('website') or '').strip(),
        'user_written_summary': (cv_data.get('summary') or '').strip(),
        'experience': cv_data.get('experience') or [],
        'education': cv_data.get('education') or [],
        'projects': cv_data.get('projects') or [],
        'certifications': cv_data.get('certifications') or [],
        'skills': cv_data.get('skills') or [],
        'languages': cv_data.get('languages') or [],
    }

    system_instruction = (
        'You are a senior IT recruiter and professional resume writer. '
        'Output plain text only — no markdown code fences, no JSON. '
        'Use clear section titles (e.g. CONTACT, PROFESSIONAL SUMMARY, EXPERIENCE). '
        'Be truthful: never invent employers, degrees, or dates not implied by the facts.'
    )

    prompt = f"""Build one complete ATS-friendly CV in **professional English** from the raw facts below.

Raw facts (may be informal, short, or in Uzbek/Russian — use only as source of truth):
{json.dumps(user_data, ensure_ascii=False, indent=2)}

Rules:
1. **PROFESSIONAL SUMMARY** (3–4 lines): Do NOT paste casual wording. Rewrite in polished, confident business English. If `user_written_summary` is empty or only a few words, **infer** a strong summary from target_role, skills, education, and projects. If the user wrote something informal, **replace** it with equivalent professional phrasing (same meaning, better tone).
2. **EXPERIENCE**: Bullet points with strong verbs (Developed, Implemented, Led, Improved…). Quantify where reasonable; if unknown, stay factual.
3. **PROJECTS / EDUCATION / CERTIFICATIONS**: Concise, scannable lines.
4. **SKILLS**: Group or comma-list relevant technical keywords for ATS.
5. **CONTACT** block at top: name, role title, email, phone, location, LinkedIn/GitHub/website if provided.
6. Omit empty sections entirely.

Generate the full CV text now."""

    from dev_diva_quest.gemini_service import GeminiError, generate_text

    try:
        generated = generate_text(prompt, system_instruction=system_instruction)
    except GeminiError as e:
        return Response({'error': str(e), 'code': e.code}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response(
            {'error': f'AI xatosi: {str(e)}', 'code': 'GEMINI_ERROR'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if not generated:
        return Response(
            {'error': 'AI javob bermadi. GEMINI_MODEL va API kalitini tekshiring.', 'code': 'EMPTY_RESPONSE'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    def _as_list(v):
        return v if isinstance(v, list) else []

    exp = _as_list(cv_data.get('experience'))
    edu = _as_list(cv_data.get('education'))

    cv = CV.objects.create(
        user=request.user,
        name=cv_data.get('name', 'Professional CV'),
        role=cv_data.get('role', ''),
        email=email,
        phone=cv_data.get('phone', '') or '',
        location=location,
        github=cv_data.get('github', '') or '',
        linkedin=cv_data.get('linkedin', '') or '',
        telegram=cv_data.get('telegram', '') or '',
        website=cv_data.get('website', '') or '',
        summary=cv_data.get('summary', '') or '',
        experience=exp,
        education=edu,
        projects=_as_list(cv_data.get('projects')),
        certifications=_as_list(cv_data.get('certifications')),
        skills=_as_list(cv_data.get('skills')),
        languages=_as_list(cv_data.get('languages')),
        generated_cv=generated,
    )

    return Response(
        {
            'cv': CVSerializer(cv).data,
            'message': 'CV generated successfully!',
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_cv(request):
    serializer = CVCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    cv = serializer.save(user=request.user)
    return Response(CVSerializer(cv).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_cvs(request):
    cvs = CV.objects.filter(user=request.user)
    serializer = CVSerializer(cvs, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def cv_detail(request, pk):
    try:
        cv = CV.objects.get(pk=pk, user=request.user)
    except CV.DoesNotExist:
        return Response({'error': 'CV not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CVSerializer(cv)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = CVCreateSerializer(cv, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(CVSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        cv.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_templates(request):
    templates = CVTemplate.objects.all()
    serializer = CVTemplateSerializer(templates, many=True)
    return Response(serializer.data)


