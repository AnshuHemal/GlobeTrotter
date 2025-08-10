from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.signup),
    path("login/", views.login),
    path("logout/", views.logout),
    path("verify/", views.verify_view),
    path('current-user/', views.current_user),
    path("send-otp/", views.send_otp, name="send-otp"),
    path("verify-otp/", views.verify_otp, name="verify-otp"),
]