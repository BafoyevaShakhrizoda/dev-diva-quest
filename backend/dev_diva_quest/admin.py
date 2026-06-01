from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import GroupAdmin, UserAdmin as DjangoUserAdmin
from django.contrib.auth.models import Group


class DevDivaQuestAdminSite(AdminSite):
    site_header = "Dev Diva Quest Admin"
    site_title = "Dev Diva Quest Administration"
    index_title = "Welcome to Dev Diva Quest Admin"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.enable_nav_sidebar = True


dev_diva_admin = DevDivaQuestAdminSite(name="dev-diva-admin")

User = get_user_model()


class CustomUserAdmin(DjangoUserAdmin):
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "email_verified",
        "role",
        "created_at",
    )
    list_filter = ("is_staff", "is_superuser", "is_active", "email_verified", "role")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at", "last_login", "date_joined")

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2"),
            },
        ),
    )

    def get_fieldsets(self, request, obj=None):
        fs = list(super().get_fieldsets(request, obj))
        fs.append(("DevGirlzz", {"fields": ("role", "email_verified")}))
        fs.append(("Timestamps", {"fields": ("created_at", "updated_at")}))
        return fs


dev_diva_admin.register(User, CustomUserAdmin)
dev_diva_admin.register(Group, GroupAdmin)

from users.models import UserProfile
from users.admin import UserProfileAdmin
from jobs.models import Job, JobApplication, JobMatch
from jobs.admin import JobAdmin, JobApplicationAdmin, JobMatchAdmin
from skills.models import SkillTest, Question
from skills.admin import SkillTestAdmin, QuestionAdmin
from cv.models import CV, CVTemplate
from cv.admin import CVAdmin, CVTemplateAdmin
from events.models import Event
from events.admin import EventAdmin

dev_diva_admin.register(UserProfile, UserProfileAdmin)
dev_diva_admin.register(Job, JobAdmin)
dev_diva_admin.register(JobApplication, JobApplicationAdmin)
dev_diva_admin.register(JobMatch, JobMatchAdmin)
dev_diva_admin.register(SkillTest, SkillTestAdmin)
dev_diva_admin.register(Question, QuestionAdmin)
dev_diva_admin.register(CV, CVAdmin)
dev_diva_admin.register(CVTemplate, CVTemplateAdmin)
dev_diva_admin.register(Event, EventAdmin)
