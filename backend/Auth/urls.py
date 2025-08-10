from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.signup),
    path("login/", views.login),
    path("logout/", views.logout),
    path("verify/", views.verify_view),
    path('current-user/', views.current_user)
]