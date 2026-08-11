"""
Scheduling models: Availability, TimeSlot, and Appointment.
"""

from django.db import models
from doctors.models import DoctorProfile
from patients.models import PatientProfile


class Availability(models.Model):
    """
    Doctor's weekly availability schedule.
    Defines recurring time blocks for each day of the week.
    """

    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, 'Monday'
        TUESDAY = 1, 'Tuesday'
        WEDNESDAY = 2, 'Wednesday'
        THURSDAY = 3, 'Thursday'
        FRIDAY = 4, 'Friday'
        SATURDAY = 5, 'Saturday'
        SUNDAY = 6, 'Sunday'

    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='availabilities',
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration_minutes = models.PositiveIntegerField(default=30)

    class Meta:
        verbose_name_plural = 'availabilities'
        unique_together = ['doctor', 'day_of_week', 'start_time']
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return (f"{self.get_day_of_week_display()} "
                f"{self.start_time}-{self.end_time} "
                f"({self.slot_duration_minutes}min)")


class TimeSlot(models.Model):
    """
    Individual bookable time slot generated from Availability.
    Generated for a rolling 14-day window.
    """

    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='time_slots',
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        unique_together = ['doctor', 'date', 'start_time']
        ordering = ['date', 'start_time']

    def __str__(self):
        status = 'Booked' if self.is_booked else 'Open'
        return f"{self.date} {self.start_time}-{self.end_time} [{status}]"


class Appointment(models.Model):
    """
    A booking linking a patient to a specific time slot.
    """

    class Status(models.TextChoices):
        BOOKED = 'booked', 'Booked'
        CANCELLED = 'cancelled', 'Cancelled'
        COMPLETED = 'completed', 'Completed'

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='appointments',
    )
    time_slot = models.OneToOneField(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='appointment',
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.BOOKED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return (f"Appointment: {self.patient} with "
                f"Dr. {self.time_slot.doctor} on {self.time_slot.date}")
