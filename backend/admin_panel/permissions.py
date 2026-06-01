from rest_framework.permissions import BasePermission


class IsStaffUser(BasePermission):
    """Allow access only to Django staff accounts."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )
