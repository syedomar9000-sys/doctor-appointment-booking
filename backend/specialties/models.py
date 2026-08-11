"""
Specialty model for medical specializations.
"""

from django.db import models


class Specialty(models.Model):
    """Medical specialty (e.g. Cardiology, Dermatology)."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = 'specialties'
        ordering = ['name']

    def __str__(self):
        return self.name
