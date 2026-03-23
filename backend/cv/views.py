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
        model = genai.GenerativeModel('gemini-pro')
        
        # Build CV content
        cv_content = f"""
        Name: {cv_data.get('personal_info', {}).get('full_name', '')}
        Email: {cv_data.get('personal_info', {}).get('email', '')}
        Phone: {cv_data.get('personal_info', {}).get('phone', '')}
        
        Summary: {cv_data.get('summary', '')}
        
        Experience:
        {json.dumps(cv_data.get('experience', []), indent=2)}
        
        Education:
        {json.dumps(cv_data.get('education', []), indent=2)}
        
        Skills:
        {json.dumps(cv_data.get('skills', []), indent=2)}
        
        Projects:
        {json.dumps(cv_data.get('projects', []), indent=2)}
        """
        
        prompt = f"""Generate a professional CV based on this information:
        
        {cv_content}
        
        Format the CV with proper sections:
        1. Contact Information
        2. Professional Summary
        3. Experience
        4. Education
        5. Skills
        6. Projects
        
        Use professional language and format. Make it impressive but truthful.
        Respond with the complete CV content in a clean, readable format."""

        response = model.generate_content(prompt)
        
        # Create CV with AI-generated content
        cv = CV.objects.create(
            user=request.user,
            title=cv_data.get('title', 'Professional CV'),
            content=response.text,
            template=cv_data.get('template', 'modern'),
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
