from rest_framework import serializers
from .models import PatientProfile


class PatientProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'email', 'full_name', 'city', 'phone']
        read_only_fields = ['id', 'user']
