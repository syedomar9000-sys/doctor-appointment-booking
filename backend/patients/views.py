"""
Views for patient profile management.
"""

from rest_framework import generics, permissions
from .models import PatientProfile
from .serializers import PatientProfileSerializer


class IsPatient(permissions.BasePermission):
    """Allow only users with patient role."""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role == 'patient')


class PatientOwnProfileView(generics.RetrieveUpdateAPIView):
    """Patient views/edits their own profile."""
    permission_classes = [IsPatient]
    serializer_class = PatientProfileSerializer

    def get_object(self):
        profile, _ = PatientProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'full_name': self.request.user.get_full_name()},
        )
        return profile
