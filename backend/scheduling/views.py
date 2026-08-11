"""
Views for scheduling: availability management, slot viewing, booking, cancellation.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import Availability, TimeSlot, Appointment
from .serializers import (
    AvailabilitySerializer, TimeSlotSerializer,
    AppointmentSerializer, BookAppointmentSerializer,
)
from .services import (
    generate_slots_for_doctor, book_appointment,
    cancel_appointment_by_patient, cancel_appointment_by_doctor,
)
from doctors.models import DoctorProfile
from patients.models import PatientProfile


class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'doctor'


class IsPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'patient'


# ── Doctor Availability ──────────────────────────────────────────────

class AvailabilityListCreateView(generics.ListCreateAPIView):
    """Doctor lists or creates availability blocks."""
    serializer_class = AvailabilitySerializer
    permission_classes = [IsDoctor]

    def get_queryset(self):
        doctor = DoctorProfile.objects.get(user=self.request.user)
        return Availability.objects.filter(doctor=doctor)

    def perform_create(self, serializer):
        doctor, _ = DoctorProfile.objects.get_or_create(user=self.request.user)
        serializer.save(doctor=doctor)


class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Doctor updates or deletes an availability block."""
    serializer_class = AvailabilitySerializer
    permission_classes = [IsDoctor]

    def get_queryset(self):
        doctor = DoctorProfile.objects.get(user=self.request.user)
        return Availability.objects.filter(doctor=doctor)

    def perform_destroy(self, instance):
        doctor = instance.doctor
        instance.delete()
        # Regenerate slots after deleting an availability
        generate_slots_for_doctor(doctor)


# ── Time Slots (Public) ─────────────────────────────────────────────

class DoctorTimeSlotsView(generics.ListAPIView):
    """Public view of a doctor's available (non-booked) time slots."""
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        doctor_id = self.kwargs['doctor_id']
        now = timezone.now()
        return TimeSlot.objects.filter(
            doctor_id=doctor_id,
            is_booked=False,
            date__gte=now.date(),
        ).exclude(
            date=now.date(),
            start_time__lt=now.time(),
        ).order_by('date', 'start_time')


# ── Booking ──────────────────────────────────────────────────────────

class BookAppointmentView(APIView):
    """Patient books an available time slot."""
    permission_classes = [IsPatient]

    def post(self, request):
        serializer = BookAppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        patient, _ = PatientProfile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.get_full_name()},
        )

        appointment = book_appointment(
            patient_profile=patient,
            time_slot_id=serializer.validated_data['time_slot_id'],
        )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )


# ── Patient Appointments ────────────────────────────────────────────

class PatientAppointmentsView(generics.ListAPIView):
    """Patient views their own appointments."""
    serializer_class = AppointmentSerializer
    permission_classes = [IsPatient]

    def get_queryset(self):
        patient, _ = PatientProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'full_name': self.request.user.get_full_name()},
        )
        return Appointment.objects.filter(
            patient=patient
        ).select_related('time_slot', 'time_slot__doctor', 'time_slot__doctor__user',
                         'time_slot__doctor__specialty')


class PatientCancelAppointmentView(APIView):
    """Patient cancels an appointment (2-hour cutoff enforced)."""
    permission_classes = [IsPatient]

    def post(self, request, appointment_id):
        patient = PatientProfile.objects.get(user=request.user)
        appointment = cancel_appointment_by_patient(patient, appointment_id)
        return Response(AppointmentSerializer(appointment).data)


# ── Doctor Appointments ──────────────────────────────────────────────

class DoctorAppointmentsView(generics.ListAPIView):
    """Doctor views their upcoming appointments."""
    serializer_class = AppointmentSerializer
    permission_classes = [IsDoctor]

    def get_queryset(self):
        doctor = DoctorProfile.objects.get(user=self.request.user)
        return Appointment.objects.filter(
            time_slot__doctor=doctor,
        ).select_related('time_slot', 'patient', 'patient__user')


class DoctorCancelAppointmentView(APIView):
    """Doctor cancels an appointment (no time restriction)."""
    permission_classes = [IsDoctor]

    def post(self, request, appointment_id):
        doctor = DoctorProfile.objects.get(user=request.user)
        appointment = cancel_appointment_by_doctor(doctor, appointment_id)
        return Response(AppointmentSerializer(appointment).data)
