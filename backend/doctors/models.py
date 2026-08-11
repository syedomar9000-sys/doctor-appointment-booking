"""
DoctorProfile model linked to User with specialty and practice details.
"""

from django.conf import settings
from django.db import models


class DoctorProfile(models.Model):
    """Doctor's professional profile."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile',
    )
    specialty = models.ForeignKey(
        'specialties.Specialty',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctors',
    )
    bio = models.TextField(blank=True, default='')
    clinic_address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    experience_years = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['-rating']

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"
