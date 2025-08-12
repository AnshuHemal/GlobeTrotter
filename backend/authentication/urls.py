from django.urls import path
from . import views
from . import dashboard_views

urlpatterns = [
    # Authentication
    path('signup', views.signup, name='signup'),
    path('login', views.login, name='login'),
    path('me', views.me, name='me'),
    
    # Password Reset
    path('forgot-password', views.forgot_password, name='forgot_password'),
    path('reset-password', views.reset_password, name='reset_password'),
    
    # OTP Verification
    path('send-otp', views.send_otp, name='send_otp'),
    path('verify-otp', views.verify_otp, name='verify_otp'),
    path('resend-otp', views.resend_otp, name='resend_otp'),
]
