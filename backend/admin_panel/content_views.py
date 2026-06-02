from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from events.models import Community, Event, NewsArticle
from events.serializers import (
    CommunityAdminSerializer,
    EventAdminSerializer,
    NewsArticleAdminSerializer,
)

from .permissions import IsStaffUser


def _list_create(request, model, serializer_class):
    if request.method == 'GET':
        qs = model.objects.all().order_by('sort_order', '-id')
        return Response(serializer_class(qs, many=True).data)
    serializer = serializer_class(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _detail(request, pk, model, serializer_class):
    try:
        obj = model.objects.get(pk=pk)
    except model.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(serializer_class(obj).data)
    if request.method == 'PATCH':
        serializer = serializer_class(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response({'error': 'Method not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST'])
@permission_classes([IsStaffUser])
def admin_events(request):
    return _list_create(request, Event, EventAdminSerializer)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsStaffUser])
def admin_event_detail(request, pk):
    return _detail(request, pk, Event, EventAdminSerializer)


@api_view(['GET', 'POST'])
@permission_classes([IsStaffUser])
def admin_news(request):
    return _list_create(request, NewsArticle, NewsArticleAdminSerializer)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsStaffUser])
def admin_news_detail(request, pk):
    return _detail(request, pk, NewsArticle, NewsArticleAdminSerializer)


@api_view(['GET', 'POST'])
@permission_classes([IsStaffUser])
def admin_communities(request):
    return _list_create(request, Community, CommunityAdminSerializer)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsStaffUser])
def admin_community_detail(request, pk):
    return _detail(request, pk, Community, CommunityAdminSerializer)
