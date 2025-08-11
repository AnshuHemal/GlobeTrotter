from django.urls import path
from .package_views import get_travel_packages

urlpatterns = [
    path('packages', get_travel_packages, name='get_travel_packages'),
]
