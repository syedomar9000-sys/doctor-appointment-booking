"""
Serializers for doctor profiles (public and owner views).
"""

from rest_framework import serializers
from .models import DoctorProfile
from specialties.serializers import SpecialtySerializer
from scheduling.models import TimeSlot
from django.utils import timezone


class DoctorProfileSerializer(serializers.ModelSerializer):
    """Full doctor profile serializer with specialty details."""

    specialty = SpecialtySerializer(read_only=True)
    specialty_id = serializers.IntegerField(write_only=True, required=False)
    full_name = serializers.SerializerMethodField()
    next_available_slot = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'full_name', 'specialty', 'specialty_id',
            'bio', 'clinic_address', 'city', 'experience_years',
            'consultation_fee', 'rating', 'next_available_slot',
        ]
        read_only_fields = ['id', 'user', 'rating']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_next_available_slot(self, obj):
        """Get the earliest available (non-booked) slot for this doctor."""
        now = timezone.now()
        slot = TimeSlot.objects.filter(
            doctor=obj,
            is_booked=False,
            date__gte=now.date(),
        ).exclude(
            date=now.date(),
            start_time__lt=now.time(),
        ).order_by('date', 'start_time').first()

        if slot:
            return {
                'date': slot.date.isoformat(),
                'start_time': slot.start_time.strftime('%H:%M'),
            }
        return None


class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for doctors to update their own profile."""

    specialty_id = serializers.IntegerField(required=False)

    class Meta:
        model = DoctorProfile
        fields = [
            'specialty_id', 'bio', 'clinic_address', 'city',
            'experience_years', 'consultation_fee',
        ]

    def update(self, instance, validated_data):
        specialty_id = validated_data.pop('specialty_id', None)
        if specialty_id is not None:
            instance.specialty_id = specialty_id
        return super().update(instance, validated_data)
