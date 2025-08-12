from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.conf import settings
from django.core.cache import cache
from mongoengine.errors import NotUniqueError, DoesNotExist, ValidationError as MongoValidationError
from .models import User, OTP
from .authentication import generate_jwt_token
from .password_reset import PasswordResetToken, generate_reset_token, send_password_reset_email
from .email_utils import send_verification_email, send_otp_email
import re
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """User registration endpoint"""
    try:
        data = request.data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validation
        if not name:
            return Response({
                'success': False,
                'message': 'Name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not email or not validate_email(email):
            return Response({
                'success': False,
                'message': 'Valid email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not password or len(password) < 6:
            return Response({
                'success': False,
                'message': 'Password must be at least 6 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists but is unverified
        try:
            existing_user = User.objects.get(email=email)
            if not existing_user.is_verified:
                # Generate and send OTP
                otp = OTP.create_otp(
                    email=email,
                    ip_address=request.META.get('REMOTE_ADDR')
                )
                send_otp_email(email, otp.otp)
                
                return Response({
                    'success': True,
                    'message': 'An OTP has been sent to your email address. Please check your inbox to complete verification.',
                    'email': email
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Email already registered. Please log in instead.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except DoesNotExist:
            # Create new unverified user
            user = User(
                name=name,
                email=email,
                is_active=False,
                is_verified=False
            )
            user.set_password(password)
            user.save()
            
            # Generate and send OTP
            otp = OTP.create_otp(
                email=email,
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            # Send OTP via email
            send_otp_email(email, otp.otp)
            
            return Response({
                'success': True,
                'message': 'An OTP has been sent to your email address. Please check your inbox to complete registration.',
                'email': email
            }, status=status.HTTP_201_CREATED)
        
    except NotUniqueError:
        return Response({
            'success': False,
            'message': 'Email already registered. Please check your email for the verification link or try resetting your password.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Registration failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint"""
    try:
        data = request.data
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return Response({
                'success': False,
                'message': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.check_password(password):
            return Response({
                'success': False,
                'message': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        if not user.is_verified:
            # Generate and send OTP for verification
            otp = OTP.create_otp(
                email=email,
                ip_address=request.META.get('REMOTE_ADDR')
            )
            send_otp_email(email, otp.otp)
            
            return Response({
                'success': False,
                'message': 'Please verify your email address with the OTP sent to your email.',
                'requires_otp_verification': True,
                'email': email
            }, status=status.HTTP_403_FORBIDDEN)
            
        if not user.is_active:
            return Response({
                'success': False,
                'message': 'Account is deactivated. Please contact support.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Generate token
        token = generate_jwt_token(user)
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in login: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'An error occurred during login. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Get current user information"""
    try:
        user = request.user
        user_data = user.to_dict()
        # Don't expose sensitive information
        user_data.pop('verification_token', None)
        user_data.pop('verification_token_expires', None)
        user_data.pop('password_hash', None)
        return Response({
            'success': True,
            'user': user_data
        })
    except Exception as e:
        logger.error(f"Error in me endpoint: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'An error occurred while fetching user data.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """Send OTP to user's email for verification"""
    email = request.data.get('email', '').strip().lower()
    
    if not email or not validate_email(email):
        return Response({
            'success': False,
            'message': 'Valid email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Rate limiting: Check if user has requested OTP recently
    cache_key = f'otp_send_{email}'
    if cache.get(cache_key):
        return Response({
            'success': False,
            'message': 'Please wait before requesting another OTP'
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    try:
        # Create and send OTP
        otp = OTP.create_otp(
            email=email,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Send OTP via email
        send_otp_email(email, otp.otp)
        
        # Set rate limit (1 minute cooldown)
        cache.set(cache_key, True, 60)
        
        return Response({
            'success': True,
            'message': 'OTP sent successfully',
            'expires_in': 600  # 10 minutes in seconds
        })
        
    except Exception as e:
        logger.error(f'Error sending OTP: {str(e)}')
        return Response({
            'success': False,
            'message': 'Failed to send OTP. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and mark email as verified"""
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()
    
    if not email or not validate_email(email):
        return Response({
            'success': False,
            'message': 'Valid email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not otp or not otp.isdigit() or len(otp) != 6:
        return Response({
            'success': False,
            'message': 'Valid 6-digit OTP is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find user by email
        user = User.objects.get(email=email)
        
        # Verify OTP
        if not OTP.verify_otp(email, otp):
            return Response({
                'success': False,
                'message': 'Invalid or expired OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark email as verified
        user.is_verified = True
        user.is_active = True
        user.save()
        
        # Generate JWT token
        token = generate_jwt_token(user)
        
        return Response({
            'success': True,
            'message': 'Email verified successfully',
            'token': token,
            'user': user.to_dict()
        })
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error verifying OTP: {str(e)}')
        return Response({
            'success': False,
            'message': 'Failed to verify OTP. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request):
    """Verify user's email using the verification token and redirect to frontend with JWT"""
    token = request.query_params.get('token')
    
    if not token:
        return Response({
            'success': False,
            'message': 'Verification token is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find user by verification token
        user = User.objects.get(verification_token=token)
        
        # Verify the token
        if user.verify_email(token):
            # Generate JWT token for the user
            jwt_token = generate_jwt_token(user)
            
            # Get frontend URL from settings
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            redirect_url = f"{frontend_url}/login?token={jwt_token}&verified=true"
            
            # Redirect to frontend with token
            from django.http import HttpResponseRedirect
            return HttpResponseRedirect(redirect_url)
            
    except DoesNotExist:
        # If token is invalid, redirect to login with error message
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/login?error=invalid_token"
        from django.http import HttpResponseRedirect
        return HttpResponseRedirect(redirect_url)
        
    except Exception as e:
        logger.error(f"Error in verify_email: {str(e)}", exc_info=True)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/login?error=verification_failed"
        from django.http import HttpResponseRedirect
        return HttpResponseRedirect(redirect_url)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_otp(request):
    """Resend OTP to user's email"""
    try:
        user = request.user
        
        if user.is_verified:
            return Response({
                'success': False,
                'message': 'Email is already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Generate and send new OTP
        otp = OTP.create_otp(
            email=user.email,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Send OTP via email
        send_otp_email(user.email, otp.otp)
        
        return Response({
            'success': True,
            'message': 'A new OTP has been sent to your email address.'
        })
        
    except Exception as e:
        logger.error(f'Error resending OTP: {str(e)}')
        return Response({
            'success': False,
            'message': 'Failed to resend OTP. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Handle forgot password request"""
    try:
        email = request.data.get('email', '').strip().lower()
        
        if not email or not validate_email(email):
            return Response({
                'success': False,
                'message': 'Please provide a valid email address'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except DoesNotExist:
            # For security, don't reveal if email exists or not
            return Response({
                'success': True,
                'message': 'If an account exists with this email, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)
        
        # Generate and save reset token
        token = generate_reset_token()
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        # Invalidate any existing tokens
        PasswordResetToken.objects(email=email, used__exists=False).update(set__used=datetime.utcnow())
        
        # Create new token
        reset_token = PasswordResetToken(
            email=email,
            token=token,
            expires_at=expires_at
        )
        reset_token.save()
        
        # Send reset email
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        send_password_reset_email(email, reset_url)
        
        return Response({
            'success': True,
            'message': 'If an account exists with this email, a password reset link has been sent.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in forgot_password: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred while processing your request.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset user password using token"""
    try:
        token = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '').strip()
        
        if not token or not new_password:
            return Response({
                'success': False,
                'message': 'Token and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if len(new_password) < 6:
            return Response({
                'success': False,
                'message': 'Password must be at least 6 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find valid token
        try:
            reset_token = PasswordResetToken.objects.get(
                token=token,
                used__exists=False,
                expires_at__gt=datetime.utcnow()
            )
        except DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid or expired token. Please request a new password reset.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find user and update password
        try:
            user = User.objects.get(email=reset_token.email)
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.used = datetime.utcnow()
            reset_token.save()
            
            return Response({
                'success': True,
                'message': 'Password has been reset successfully. You can now log in with your new password.'
            }, status=status.HTTP_200_OK)
            
        except DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"Error in reset_password: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred while resetting your password.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
