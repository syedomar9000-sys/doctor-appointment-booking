from django.urls import path
from .views import PatientOwnProfileView

urlpatterns = [
    path('me/', PatientOwnProfileView.as_view(), name='patient-own-profile'),
]
