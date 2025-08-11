from django.core.mail import EmailMessage
from django.conf import settings

def send_otp_email(to_email, otp_code):
    subject = "Verify your email - GlobeTrotter"
    body = f"<h3>Your OTP code is: <b>{otp_code}</b></h3><p>This code will expire in 5 minutes.</p>"

    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=f'GlobeTrotter <{settings.EMAIL_HOST_USER}>',
        to=[to_email],
    )
    email.content_subtype = "html"

    try:
        email.send(fail_silently=False)
        print("OTP email sent successfully")
    except Exception as e:
        print("Error sending OTP email:", e)
