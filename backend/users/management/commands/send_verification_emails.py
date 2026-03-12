from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.conf import settings
import secrets

User = get_user_model()

class Command(BaseCommand):
    help = 'Send verification emails to unverified users'

    def handle(self, *args, **options):
        unverified_users = User.objects.filter(email_verified=False, is_active=True)
        
        for user in unverified_users:
            # Generate verification token
            token = secrets.token_urlsafe(32)
            user.email_verification_token = token
            user.save()
            
            # Send verification email
            verification_url = f"https://devgirlzz.com.uz/verify-email/{token}"
            
            subject = "Verify your Dev Diva Quest account"
            message = f"""
Hello {user.first_name or user.email}!

Thank you for registering on Dev Diva Quest! 

Please verify your email address by clicking the link below:
{verification_url}

This link will expire in 24 hours.

Best regards,
Dev Diva Quest Team
"""
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Verification email sent to {user.email}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to send email to {user.email}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Processed {unverified_users.count()} users')
        )
