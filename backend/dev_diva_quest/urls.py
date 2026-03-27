from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
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