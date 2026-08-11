"""
PatientProfile model linked to User.
"""

from django.conf import settings
from django.db import models


class PatientProfile(models.Model):
    """Patient's personal profile."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_profile',
    )
    full_name = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return self.full_name or self.user.username
