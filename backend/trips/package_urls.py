from django.urls import path
from .package_views import get_travel_packages, get_trip_details

urlpatterns = [
    path('packages', get_travel_packages, name='get_travel_packages'),
    path('packages/<str:trip_id>', get_trip_details, name='trip-details'),
]
