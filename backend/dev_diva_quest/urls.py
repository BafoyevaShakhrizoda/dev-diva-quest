from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework.authtoken.views import obtain_auth_token
from .admin import dev_diva_admin

# Root URL uchun view
def home_view(request):
    return JsonResponse({
        "status": "success",
        "message": "DevGirlzz API is running",
        "version": "1.0.0",
        "environment": "production" if not settings.DEBUG else "development",
        "endpoints": {
            "admin": "/admin/",
            "api_root": {
                "users": "/api/users/",
                "skills": "/api/skills/",
                "cv": "/api/cv/",
                "jobs": "/api/jobs/",
                "auth_token": "/api/token/",
                "api_auth": "/api-auth/",
            }
        },
        "documentation": "Visit /api/ for browsable API (if DEBUG=True)"
    })

urlpatterns = [
    # Root URL
    path('', home_view, name='home'),
    
    # Admin panel - production uchun
    path('admin/', admin.site.urls),
    
    # DRF browsable API login/logout (DEBUG=True da ishlaydi)
    path('api-auth/', include('rest_framework.urls')),
    
    # Token authentication endpoint
    path('api/token/', obtain_auth_token, name='api_token'),
    
    # Sizning app'lar
    path('api/users/', include('users.urls')),
    path('api/skills/', include('skills.urls')),
    path('api/cv/', include('cv.urls')),
    path('api/jobs/', include('jobs.urls')),
]

# Static files for production
if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)