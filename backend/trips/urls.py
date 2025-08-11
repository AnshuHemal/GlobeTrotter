from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_trips, name='get_trips'),
    path('create', views.create_trip, name='create_trip'),
    path('recent', views.get_recent_trips, name='get_recent_trips'),
    path('<str:trip_id>', views.get_trip, name='get_trip'),
    path('<str:trip_id>/update', views.update_trip, name='update_trip'),
    path('<str:trip_id>/delete', views.delete_trip, name='delete_trip'),
    path('<str:trip_id>/activities', views.manage_activities, name='manage_activities'),
    path('<str:trip_id>/budget', views.manage_budget, name='manage_budget'),
    path('<str:trip_id>/stops', views.get_trip_stops, name='get_trip_stops'),
]
