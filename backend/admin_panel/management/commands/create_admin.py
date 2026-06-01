import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = 'Create or update a staff admin account (username/password from args or env).'

    def add_arguments(self, parser):
        parser.add_argument('--username', default=os.environ.get('ADMIN_USERNAME', 'admin'))
        parser.add_argument('--password', default=os.environ.get('ADMIN_PASSWORD', 'DevGirlzz@Admin2026'))
        parser.add_argument('--email', default=os.environ.get('ADMIN_EMAIL', 'admin@devgirlzz.local'))

    def handle(self, *args, **options):
        username = options['username'].strip()
        password = options['password']
        email = options['email'].strip()

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': True,
                'is_superuser': True,
                'email_verified': True,
            },
        )

        user.email = email or user.email
        user.is_staff = True
        user.is_superuser = True
        user.email_verified = True
        user.set_password(password)
        user.save()

        verb = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(
            f'{verb} admin user "{username}" (staff + superuser). '
            f'Log in at /admin or the frontend admin panel.'
        ))
