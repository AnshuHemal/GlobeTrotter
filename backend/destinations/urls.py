from django.urls import path
from . import views

urlpatterns = [
    path('popular', views.get_popular_destinations, name='get_popular_destinations'),
    path('search', views.search_destinations, name='search_destinations'),
    path('cities', views.search_cities, name='search_cities'),
    path('activities', views.search_activities, name='search_activities'),
    path('<str:destination_id>', views.get_destination, name='get_destination'),
]
