"""
Views for doctor profiles: public search/detail and doctor's own profile management.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import DoctorProfile
from .serializers import DoctorProfileSerializer, DoctorProfileUpdateSerializer
from .filters import DoctorFilter


class IsDoctor(permissions.BasePermission):
    """Allow only users with doctor role."""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role == 'doctor')


class DoctorSearchView(generics.ListAPIView):
    """
    Public search endpoint for doctors.
    Supports filtering by specialty, city, availability and ordering.
    """
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = DoctorFilter
    ordering_fields = ['rating', 'experience_years', 'city', 'consultation_fee']
    ordering = ['-rating']

    def get_queryset(self):
        return DoctorProfile.objects.select_related(
            'user', 'specialty'
        ).all()


class DoctorDetailView(generics.RetrieveAPIView):
    """Public view of a single doctor's profile."""
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.AllowAny]
    queryset = DoctorProfile.objects.select_related('user', 'specialty')


class DoctorOwnProfileView(generics.RetrieveUpdateAPIView):
    """Doctor views/edits their own profile."""
    permission_classes = [IsDoctor]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return DoctorProfileUpdateSerializer
        return DoctorProfileSerializer

    def get_object(self):
        profile, _ = DoctorProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile
