import json
import google.generativeai as genai
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
        # Configure Gemini
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        # Build structured user data for AI
        user_data = {
            'name': cv_data.get('name', ''),
            'role': cv_data.get('role', ''),
            'email': cv_data.get('email', ''),
            'phone': cv_data.get('phone', ''),
            'location': cv_data.get('location', ''),
            'github': cv_data.get('github', ''),
            'linkedin': cv_data.get('linkedin', ''),
            'telegram': cv_data.get('telegram', ''),
            'website': cv_data.get('website', ''),
            'summary': cv_data.get('summary', ''),
            'experience': cv_data.get('experience', []),
            'education': cv_data.get('education', []),
            'projects': cv_data.get('projects', []),
            'certifications': cv_data.get('certifications', []),
            'skills': cv_data.get('skills', []),
            'languages': cv_data.get('languages', [])
        }
        
        prompt = f"""You are a professional CV writer and career expert. Generate a professional, ATS-friendly CV based on this user data:

User Information:
{json.dumps(user_data, indent=2)}

Requirements:
1. Create a professional, modern CV format
2. Use strong action verbs and quantifiable achievements
3. Organize into clear sections: Contact, Summary, Experience, Education, Skills, Projects
4. Make it impressive but truthful to the provided data
5. Use professional formatting with clear headings
6. Include relevant keywords for ATS optimization
7. Format dates consistently
8. Keep it concise but comprehensive

Generate the complete CV content in a clean, professional format that can be directly used as a CV document."""

        response = model.generate_content(prompt)
        
        # Create CV with AI-generated content
        cv = CV.objects.create(
            user=request.user,
            name=cv_data.get('name', 'Professional CV'),
            role=cv_data.get('role', ''),
            email=cv_data.get('email', ''),
            phone=cv_data.get('phone', ''),
            location=cv_data.get('location', ''),
            github=cv_data.get('github', ''),
            linkedin=cv_data.get('linkedin', ''),
            telegram=cv_data.get('telegram', ''),
            website=cv_data.get('website', ''),
            summary=cv_data.get('summary', ''),
            experience=cv_data.get('experience', []),
            education=cv_data.get('education', []),
            projects=cv_data.get('projects', []),
            certifications=cv_data.get('certifications', []),
            skills=cv_data.get('skills', []),
            languages=cv_data.get('languages', []),
            generated_cv=response.text,
            is_active=True
        )
        
        return Response({
            'cv': CVSerializer(cv).data,
            'message': 'CV generated successfully!'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to generate CV: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            serializer.save()
            return Response(serializer.data)
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
