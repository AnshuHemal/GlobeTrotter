import os
import secrets
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings
from mongoengine import Document, StringField, DateTimeField, EmailField

class PasswordResetToken(Document):
    """Model to store password reset tokens"""
    email = EmailField(required=True)
    token = StringField(required=True, unique=True)
    created_at = DateTimeField(default=datetime.utcnow)
    expires_at = DateTimeField(required=True)
    used = DateTimeField()
    
    meta = {
        'indexes': [
            {'fields': ['email', 'token'], 'unique': True},
            {'fields': ['expires_at'], 'expireAfterSeconds': 0}
        ]
    }

def generate_reset_token():
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)

def send_password_reset_email(email, reset_url):
    """Send password reset email to user"""
    subject = 'Password Reset Request'
    message = f'''
    You're receiving this email because you requested a password reset for your account.
    
    Please click the link below to reset your password:
    {reset_url}
    
    If you didn't request this, please ignore this email.
    
    This link will expire in 24 hours.
    '''
    
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    send_mail(
        subject=subject,
        message=message.strip(),
        from_email=from_email,
        recipient_list=recipient_list,
        fail_silently=False,
    )
