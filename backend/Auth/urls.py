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
    
    # Profile management endpoints
    path("profile/photo/", views.get_profile_photo, name="get-profile-photo"),
    path("profile/update/", views.update_profile, name="update-profile"),
    path("profile/photo/delete/", views.delete_profile_photo, name="delete-profile-photo"),
]