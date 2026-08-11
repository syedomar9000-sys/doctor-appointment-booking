from django.contrib import admin
from .models import PatientProfile


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'city', 'phone']
    search_fields = ['user__email', 'full_name']
