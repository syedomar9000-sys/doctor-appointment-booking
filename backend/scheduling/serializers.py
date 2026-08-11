"""
Serializers for scheduling: Availability, TimeSlot, Appointment.
"""

from rest_framework import serializers
from .models import Availability, TimeSlot, Appointment
from .services import generate_slots_for_doctor


class AvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for doctor availability with auto slot generation."""

    day_of_week_display = serializers.CharField(
        source='get_day_of_week_display', read_only=True
    )

    class Meta:
        model = Availability
        fields = [
            'id', 'doctor', 'day_of_week', 'day_of_week_display',
            'start_time', 'end_time', 'slot_duration_minutes',
        ]
        read_only_fields = ['id', 'doctor']

    def validate(self, attrs):
        if attrs.get('start_time') and attrs.get('end_time'):
            if attrs['start_time'] >= attrs['end_time']:
                raise serializers.ValidationError(
                    {"end_time": "End time must be after start time."}
                )
        duration = attrs.get('slot_duration_minutes', 30)
        if duration < 10 or duration > 120:
            raise serializers.ValidationError(
                {"slot_duration_minutes": "Duration must be between 10 and 120 minutes."}
            )
        return attrs

    def create(self, validated_data):
        instance = super().create(validated_data)
        # Generate slots synchronously after creating availability
        generate_slots_for_doctor(instance.doctor)
        return instance

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        # Regenerate slots after updating availability
        generate_slots_for_doctor(instance.doctor)
        return instance


class TimeSlotSerializer(serializers.ModelSerializer):
    """Serializer for individual time slots."""

    class Meta:
        model = TimeSlot
        fields = ['id', 'doctor', 'date', 'start_time', 'end_time', 'is_booked']
        read_only_fields = ['id', 'doctor', 'date', 'start_time', 'end_time']


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for appointments with slot and doctor details."""

    doctor_name = serializers.SerializerMethodField()
    doctor_id = serializers.SerializerMethodField()
    specialty = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    slot_date = serializers.DateField(source='time_slot.date', read_only=True)
    slot_start_time = serializers.TimeField(source='time_slot.start_time', read_only=True)
    slot_end_time = serializers.TimeField(source='time_slot.end_time', read_only=True)
    can_cancel = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'time_slot', 'status', 'created_at',
            'doctor_name', 'doctor_id', 'specialty', 'patient_name',
            'slot_date', 'slot_start_time', 'slot_end_time', 'can_cancel',
        ]
        read_only_fields = ['id', 'patient', 'status', 'created_at']

    def get_doctor_name(self, obj):
        doctor = obj.time_slot.doctor
        return doctor.user.get_full_name() or doctor.user.username

    def get_doctor_id(self, obj):
        return obj.time_slot.doctor.id

    def get_specialty(self, obj):
        specialty = obj.time_slot.doctor.specialty
        return specialty.name if specialty else None

    def get_patient_name(self, obj):
        return obj.patient.full_name or obj.patient.user.get_full_name()

    def get_can_cancel(self, obj):
        """Check if the appointment can still be cancelled (2h cutoff for patients)."""
        if obj.status != Appointment.Status.BOOKED:
            return False
        from django.utils import timezone
        from datetime import datetime, timedelta
        now = timezone.now()
        slot_dt = timezone.make_aware(
            datetime.combine(obj.time_slot.date, obj.time_slot.start_time)
        )
        return now < slot_dt - timedelta(hours=2)


class BookAppointmentSerializer(serializers.Serializer):
    """Serializer for booking an appointment."""
    time_slot_id = serializers.IntegerField()
