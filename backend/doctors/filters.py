"""
Filters for doctor search with specialty, city, and availability.
"""

import django_filters
from django.db.models import Q
from django.utils import timezone
from .models import DoctorProfile


class DoctorFilter(django_filters.FilterSet):
    """Filter doctors by specialty slug, city, and availability."""

    specialty = django_filters.CharFilter(
        field_name='specialty__slug',
        lookup_expr='exact',
    )
    city = django_filters.CharFilter(
        field_name='city',
        lookup_expr='icontains',
    )
    available = django_filters.BooleanFilter(
        method='filter_available',
        label='Has available slots',
    )
    search = django_filters.CharFilter(
        method='filter_search',
        label='Search by name',
    )

    class Meta:
        model = DoctorProfile
        fields = ['specialty', 'city', 'available', 'search']

    def filter_available(self, queryset, name, value):
        """Filter to only doctors with future open time slots."""
        if value:
            now = timezone.now()
            return queryset.filter(
                time_slots__is_booked=False,
                time_slots__date__gte=now.date(),
            ).distinct()
        return queryset

    def filter_search(self, queryset, name, value):
        """Search doctors by first name, last name, or username."""
        return queryset.filter(
            Q(user__first_name__icontains=value) |
            Q(user__last_name__icontains=value) |
            Q(user__username__icontains=value)
        )
