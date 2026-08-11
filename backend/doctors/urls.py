from django.urls import path
from .views import DoctorSearchView, DoctorDetailView, DoctorOwnProfileView

urlpatterns = [
    path('', DoctorSearchView.as_view(), name='doctor-search'),
    path('me/', DoctorOwnProfileView.as_view(), name='doctor-own-profile'),
    path('<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
]
