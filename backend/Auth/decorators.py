from functools import wraps
import jwt
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from Auth.models import User 

def verify_token(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        token = request.COOKIES.get('access_token')

        if not token:
            return Response({'message': 'Authentication required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded.get('userId')
            user = User.objects.filter(id=user_id).first()

            if not user:
                return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

            request.user = user
            return view_func(request, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return Response({'message': 'Token expired.'}, status=status.HTTP_403_FORBIDDEN)
        except jwt.InvalidTokenError:
            return Response({'message': 'Invalid token.'}, status=status.HTTP_403_FORBIDDEN)

    return _wrapped_view
