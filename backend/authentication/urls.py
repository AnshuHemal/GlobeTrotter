from django.urls import path
from . import views
from . import dashboard_views

urlpatterns = [
    # Authentication
    path('signup', views.signup, name='signup'),
    path('login', views.login, name='login'),
    path('me', views.me, name='me'),
    
    # Email Verification
    path('verify-email', views.verify_email, name='verify_email'),
    path('resend-verification', views.resend_verification_email, name='resend_verification'),
    
    # Password Reset
    path('forgot-password', views.forgot_password, name='forgot_password'),
    path('reset-password', views.reset_password, name='reset_password'),
]
