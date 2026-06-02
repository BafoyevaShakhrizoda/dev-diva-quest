from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Community, Event, NewsArticle
from .serializers import CommunitySerializer, EventSerializer, NewsArticleSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def event_list(_request):
    qs = Event.objects.filter(is_active=True).order_by('sort_order', '-starts_at', '-id')[:48]
    return Response(EventSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def news_list(_request):
    qs = NewsArticle.objects.filter(is_active=True).order_by('sort_order', '-published_at', '-id')[:48]
    return Response(NewsArticleSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def community_list(_request):
    qs = Community.objects.filter(is_active=True).order_by('sort_order', 'name')[:48]
    return Response(CommunitySerializer(qs, many=True).data)
