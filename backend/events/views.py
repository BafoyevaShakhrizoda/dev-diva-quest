from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Event
from .serializers import EventSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def event_list(_request):
    qs = Event.objects.filter(is_active=True).order_by('sort_order', '-starts_at', '-id')[:48]
    return Response(EventSerializer(qs, many=True).data)
