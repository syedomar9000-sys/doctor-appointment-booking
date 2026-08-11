"""
Business logic for slot generation and booking.
Keeps views thin by encapsulating complex operations here.
"""

from datetime import datetime, timedelta, date, time
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .models import TimeSlot, Appointment, Availability


def generate_slots_for_doctor(doctor):
    """
    Generate TimeSlot rows for a rolling 14-day window
    based on the doctor's Availability records.

    Called synchronously whenever Availability is created or updated.
    Existing unbooked slots outside the new availability are cleaned up.
    Booked slots are never deleted.
    """
    today = timezone.now().date()
    end_date = today + timedelta(days=14)

    availabilities = Availability.objects.filter(doctor=doctor)

    # Delete future unbooked slots so we can regenerate them cleanly
    TimeSlot.objects.filter(
        doctor=doctor,
        date__gte=today,
        is_booked=False,
    ).delete()

    slots_to_create = []
    current_date = today

    while current_date <= end_date:
        day_of_week = current_date.weekday()

        for avail in availabilities:
            if avail.day_of_week != day_of_week:
                continue

            slot_start = datetime.combine(current_date, avail.start_time)
            slot_end_boundary = datetime.combine(current_date, avail.end_time)
            duration = timedelta(minutes=avail.slot_duration_minutes)

            while slot_start + duration <= slot_end_boundary:
                slot_end = slot_start + duration

                # Skip slots in the past
                if timezone.is_naive(slot_start):
                    aware_start = timezone.make_aware(slot_start)
                else:
                    aware_start = slot_start

                if aware_start > timezone.now():
                    # Check if a booked slot already exists at this time
                    existing = TimeSlot.objects.filter(
                        doctor=doctor,
                        date=current_date,
                        start_time=slot_start.time(),
                        is_booked=True,
                    ).exists()

                    if not existing:
                        slots_to_create.append(TimeSlot(
                            doctor=doctor,
                            date=current_date,
                            start_time=slot_start.time(),
                            end_time=slot_end.time(),
                            is_booked=False,
                        ))

                slot_start = slot_end

        current_date += timedelta(days=1)

    if slots_to_create:
        TimeSlot.objects.bulk_create(slots_to_create, ignore_conflicts=True)

    return len(slots_to_create)


def book_appointment(patient_profile, time_slot_id):
    """
    Book a time slot for a patient.
    Uses select_for_update() to prevent double-booking.

    Rules:
    - Patient can have only one active (non-cancelled) appointment per doctor
    - Slot must not already be booked
    - Slot must be in the future
    """
    with transaction.atomic():
        try:
            slot = TimeSlot.objects.select_for_update().get(id=time_slot_id)
        except TimeSlot.DoesNotExist:
            raise ValidationError({"detail": "Time slot not found."})

        if slot.is_booked:
            raise ValidationError({"detail": "This time slot is already booked."})

        # Check slot is in the future
        now = timezone.now()
        slot_datetime = timezone.make_aware(
            datetime.combine(slot.date, slot.start_time)
        )
        if slot_datetime <= now:
            raise ValidationError({"detail": "Cannot book a slot in the past."})

        # Check one active appointment per doctor limit
        active_with_doctor = Appointment.objects.filter(
            patient=patient_profile,
            time_slot__doctor=slot.doctor,
            status=Appointment.Status.BOOKED,
        ).exists()

        if active_with_doctor:
            raise ValidationError({
                "detail": "You already have an active appointment with this doctor. "
                          "Cancel it first before booking a new one."
            })

        # Mark slot as booked
        slot.is_booked = True
        slot.save()

        # Create appointment
        appointment = Appointment.objects.create(
            patient=patient_profile,
            time_slot=slot,
            status=Appointment.Status.BOOKED,
        )

        return appointment


def cancel_appointment_by_patient(patient_profile, appointment_id):
    """
    Cancel an appointment by the patient.
    Enforces the 2-hour cancellation cutoff.
    """
    try:
        appointment = Appointment.objects.select_related('time_slot').get(
            id=appointment_id,
            patient=patient_profile,
            status=Appointment.Status.BOOKED,
        )
    except Appointment.DoesNotExist:
        raise ValidationError({"detail": "Active appointment not found."})

    now = timezone.now()
    slot_datetime = timezone.make_aware(
        datetime.combine(appointment.time_slot.date, appointment.time_slot.start_time)
    )
    cutoff = slot_datetime - timedelta(hours=2)

    if now > cutoff:
        raise ValidationError({
            "detail": "Cannot cancel within 2 hours of the appointment time."
        })

    appointment.status = Appointment.Status.CANCELLED
    appointment.save()

    # Free the slot
    appointment.time_slot.is_booked = False
    appointment.time_slot.save()

    return appointment


def cancel_appointment_by_doctor(doctor_profile, appointment_id):
    """
    Cancel an appointment by the doctor.
    Doctors can cancel at any time.
    """
    try:
        appointment = Appointment.objects.select_related('time_slot').get(
            id=appointment_id,
            time_slot__doctor=doctor_profile,
            status=Appointment.Status.BOOKED,
        )
    except Appointment.DoesNotExist:
        raise ValidationError({"detail": "Active appointment not found."})

    appointment.status = Appointment.Status.CANCELLED
    appointment.save()

    # Free the slot
    appointment.time_slot.is_booked = False
    appointment.time_slot.save()

    return appointment
