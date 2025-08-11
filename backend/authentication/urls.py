from django.urls import path
from . import views
from . import dashboard_views

urlpatterns = [
    path('signup', views.signup, name='signup'),
    path('login', views.login, name='login'),
    path('me', views.me, name='me'),
]
