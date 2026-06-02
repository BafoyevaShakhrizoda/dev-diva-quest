from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from django.http import JsonResponse

from dev_diva_quest.admin import dev_diva_admin

def _health(_request):
    return JsonResponse({'status': 'ok', 'message': 'DevGirlzz API is running'})


urlpatterns = [
    path('', _health),
    path('api/health/', _health),

    # Django admin (frontend staff panel lives at /admin in the SPA)
    path('django-admin/', dev_diva_admin.urls),
    
    # DRF browsable API login/logout (DEBUG=True da ishlaydi)
    path('api-auth/', include('rest_framework.urls')),
    
    # Token authentication endpoint
    path('api/token/', obtain_auth_token, name='api_token'),
    
    # Sizning app'lar
    path('api/users/', include('users.urls')),
    path('api/skills/', include('skills.urls')),
    path('api/cv/', include('cv.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/events/', include('events.urls')),
    path('api/admin/', include('admin_panel.urls')),
]

# Static files for production
if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)