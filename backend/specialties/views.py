from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Specialty
from .serializers import SpecialtySerializer


class SpecialtyListView(generics.ListAPIView):
    """List all medical specialties (read-only, public)."""
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Return all specialties without pagination
