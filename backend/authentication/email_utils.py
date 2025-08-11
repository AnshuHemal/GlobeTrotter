from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

def send_verification_email(user, request=None):
    """
    Send an email with a verification link to the user.
    
    Args:
        user: The user instance
        request: The request object (optional, used to build absolute URLs)
    """
    try:
        # Generate verification URL that points to the backend endpoint
        verification_url = f"{settings.BACKEND_URL}/api/auth/verify-email?token={user.verification_token}"
        
        # Email subject and content
        subject = 'Verify your email address'
        
        # Render HTML email template
        html_message = render_to_string('emails/email_verification.html', {
            'user': user,
            'verification_url': verification_url,
            'expiry_hours': 24  # Token expires in 24 hours
        })
        
        # Plain text version of the email
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Verification email sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending verification email to {user.email}: {str(e)}")
        return False
