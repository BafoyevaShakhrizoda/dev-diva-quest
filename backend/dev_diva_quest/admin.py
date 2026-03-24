from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin, GroupAdmin

class DevDivaQuestAdminSite(AdminSite):
    site_header = "Dev Diva Quest Admin"
    site_title = "Dev Diva Quest Administration"
    index_title = "Welcome to Dev Diva Quest Admin"
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.enable_nav_sidebar = True

# Custom admin site
dev_diva_admin = DevDivaQuestAdminSite(name='dev-diva-admin')

# Register default models
dev_diva_admin.register(User, UserAdmin)
dev_diva_admin.register(Group, GroupAdmin)

# Import and register your models
from users.models import UserProfile
from users.admin import UserAdmin as CustomUserAdmin, UserProfileAdmin
from jobs.models import Job, JobApplication, JobMatch
from jobs.admin import JobAdmin, JobApplicationAdmin, JobMatchAdmin
from skills.models import SkillTest, Question
from skills.admin import SkillTestAdmin, QuestionAdmin
from cv.models import CV, CVTemplate
from cv.admin import CVAdmin, CVTemplateAdmin

# Register models with custom admin site
dev_diva_admin.register(UserProfile, UserProfileAdmin)
dev_diva_admin.register(Job, JobAdmin)
dev_diva_admin.register(JobApplication, JobApplicationAdmin)
dev_diva_admin.register(JobMatch, JobMatchAdmin)
dev_diva_admin.register(SkillTest, SkillTestAdmin)
dev_diva_admin.register(Question, QuestionAdmin)
dev_diva_admin.register(CV, CVAdmin)
dev_diva_admin.register(CVTemplate, CVTemplateAdmin)
