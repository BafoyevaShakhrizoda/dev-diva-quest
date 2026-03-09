import json
import openai
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
    
    try:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Build links string
        links = [
            cv_data.get('github') and f"GitHub: {cv_data['github']}" or '',
            cv_data.get('linkedin') and f"LinkedIn: {cv_data['linkedin']}" or '',
            cv_data.get('telegram') and f"Telegram: {cv_data['telegram']}" or '',
            cv_data.get('website') and f"Website: {cv_data['website']}" or '',
        ]
        links = ' | '.join(filter(None, links))
        
        # Build experience text
        experience_text = '\n\n'.join([
            f"- {e.get('title', '')} at {e.get('company', '')} ({e.get('duration', '')}):\n  {e.get('description', '')}"
            for e in cv_data.get('experience', [])
        ])
        
        # Build education text
        education_text = '\n'.join([
            f"- {e.get('degree', '')} at {e.get('school', '')} ({e.get('year', '')})"
            for e in cv_data.get('education', [])
        ])
        
        # Build projects text
        projects_list = []
        for p in cv_data.get('projects', []):
            if p.get('name'):
                project_text = f"- {p.get('name', '')} [{p.get('tech', '')}]: {p.get('description', '')}"
                if p.get('link'):
                    project_text += f' | {p["link"]}'
                projects_list.append(project_text)
        projects_text = '\n'.join(projects_list)
        
        # Build certifications text
        certifications_list = []
        for c in cv_data.get('certifications', []):
            if c.get('name'):
                cert_text = f"- {c.get('name', '')} — {c.get('platform', '')}"
                if c.get('link'):
                    cert_text += f' ({c["link"]})'
                certifications_list.append(cert_text)
        certifications_text = '\n'.join(certifications_list)
        
        # Build skills text
        skills_text = ', '.join(filter(None, cv_data.get('skills', [])))
        
        # Build languages text
        languages_list = cv_data.get('languages', [])
        languages_text = ' | '.join([
            isinstance(l, str) and l or f"{l.get('language', '')} – {l.get('level', '')}"
            for l in languages_list if l
        ])
        
        prompt = f"""You are a professional CV writer specializing in IT careers. Create a polished, ATS-friendly CV styled like a real professional resume. Use clear section headings in UPPERCASE. Be professional and highlight uniqueness. Make the summary compelling and achievement-focused.

Candidate data:
Name: {cv_data['name']}
Role: {cv_data['role']}
Email: {cv_data['email']} | Phone: {cv_data.get('phone', '')} | Location: {cv_data['location']}
{links}

Summary: {cv_data['summary']}

Work Experience:
{experience_text}

Education:
{education_text}

Projects:
{projects_text}

Certifications:
{certifications_text}

Technical Skills: {skills_text}

Languages: {languages_text}

Generate a complete, professional CV in plain text format with these sections in order:
1. Header (Name, Role, Contact, Links)
2. SUMMARY
3. WORK EXPERIENCE
4. EDUCATION
5. PROJECTS (if any)
6. CERTIFICATES (if any)
7. SKILLS AND INSTRUMENTS
8. LANGUAGES

Make it clean, readable, and ATS-friendly. Use bullet points with "-" for experience and project details."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        
        generated_cv = response.choices[0].message.content
        
        # Save CV to database
        cv = CV.objects.create(
            user=request.user,
            generated_cv=generated_cv,
            **cv_data
        )
        
        return Response({
            'cv_id': cv.id,
            'generated_cv': generated_cv
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_cvs(request):
    cvs = CV.objects.filter(user=request.user)
    serializer = CVSerializer(cvs, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def cv_detail(request, cv_id):
    try:
        cv = CV.objects.get(id=cv_id, user=request.user)
    except CV.DoesNotExist:
        return Response(
            {'error': 'CV not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = CVSerializer(cv)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = CVCreateSerializer(cv, data=request.data, partial=True)
        if serializer.is_valid():
            updated_cv = serializer.save()
            # Regenerate CV if data changed
            # You might want to add logic here to regenerate the CV
            return Response(CVSerializer(updated_cv).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        cv.delete()
        return Response({'message': 'CV deleted successfully'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def templates(request):
    templates = CVTemplate.objects.filter(is_active=True)
    serializer = CVTemplateSerializer(templates, many=True)
    return Response(serializer.data)
