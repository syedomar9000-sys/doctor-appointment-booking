from django.contrib import admin
from .models import DoctorProfile


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'specialty', 'city', 'experience_years',
                    'consultation_fee', 'rating']
    list_filter = ['specialty', 'city']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
