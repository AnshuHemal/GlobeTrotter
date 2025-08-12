from django.urls import path
from .package_views import get_travel_packages, get_trip_details
from .mytrip_views import book_user_trip, get_user_trips, get_user_trips_safe

urlpatterns = [
    path('packages', get_travel_packages, name='get_travel_packages'),
    path('packages/<str:trip_id>', get_trip_details, name='trip-details'),
    # MyTrips endpoints
    path('trips/user/book', book_user_trip, name='book-user-trip'),
    path('trips/user', get_user_trips, name='get-user-trips'),
    path('trips/user/safe', get_user_trips_safe, name='get-user-trips-safe'),
]
