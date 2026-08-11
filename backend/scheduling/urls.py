from django.urls import path
from .views import (
    AvailabilityListCreateView,
    AvailabilityDetailView,
    DoctorTimeSlotsView,
    BookAppointmentView,
    PatientAppointmentsView,
    PatientCancelAppointmentView,
    DoctorAppointmentsView,
    DoctorCancelAppointmentView,
)

urlpatterns = [
    # Doctor availability management
    path('availability/', AvailabilityListCreateView.as_view(),
         name='availability-list-create'),
    path('availability/<int:pk>/', AvailabilityDetailView.as_view(),
         name='availability-detail'),

    # Public: view a doctor's available slots
    path('doctors/<int:doctor_id>/slots/', DoctorTimeSlotsView.as_view(),
         name='doctor-time-slots'),

    # Patient: book and manage appointments
    path('book/', BookAppointmentView.as_view(), name='book-appointment'),
    path('my-appointments/', PatientAppointmentsView.as_view(),
         name='patient-appointments'),
    path('my-appointments/<int:appointment_id>/cancel/',
         PatientCancelAppointmentView.as_view(), name='patient-cancel-appointment'),

    # Doctor: view and manage appointments
    path('doctor-appointments/', DoctorAppointmentsView.as_view(),
         name='doctor-appointments'),
    path('doctor-appointments/<int:appointment_id>/cancel/',
         DoctorCancelAppointmentView.as_view(), name='doctor-cancel-appointment'),
]
