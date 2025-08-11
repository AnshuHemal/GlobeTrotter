from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from mongoengine.errors import NotUniqueError, DoesNotExist
from .models import User
from .authentication import generate_jwt_token
import re


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
        
        # Create user
        user = User(name=name, email=email)
        user.set_password(password)
        user.save()
        
        # Generate token
        token = generate_jwt_token(user)
        
        return Response({
            'success': True,
            'message': 'User created successfully',
            'token': token,
            'user': user.to_dict()
        }, status=status.HTTP_201_CREATED)
        
    except NotUniqueError:
        return Response({
            'success': False,
            'message': 'Email already exists'
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
        
        # Find user
        try:
            user = User.objects.get(email=email)
        except DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check password
        if not user.check_password(password):
            return Response({
                'success': False,
                'message': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'success': False,
                'message': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate token
        token = generate_jwt_token(user)
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Login failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Get current user information"""
    try:
        user = request.user
        return Response({
            'success': True,
            'user': user.to_dict()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to get user information'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
