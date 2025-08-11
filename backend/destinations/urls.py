from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_all_destinations, name='list_all_destinations'),
    path('popular', views.get_popular_destinations, name='get_popular_destinations'),
    path('all-places', views.get_all_places, name='get_all_places'),
    path('search', views.search_destinations, name='search_destinations'),
    path('activities', views.search_activities, name='search_activities'),
    path('<str:destination_id>', views.get_destination, name='get_destination'),
]
