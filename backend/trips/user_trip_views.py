from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist, ValidationError
from .user_trip_models import UserTrip
from .package_models import TravelPackage


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_trips(request):
    """Get all trips for the authenticated user"""
    try:
        user = request.user
        trips = UserTrip.objects(user=user).order_by('-created_at')
        
        return Response({
            'success': True,
            'trips': [trip.to_dict() for trip in trips]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch user trips',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_trip_package(request):
    """Book a travel package for the authenticated user"""
    try:
        user = request.user
        package_id = request.data.get('package_id')
        
        if not package_id:
            return Response({
                'success': False,
                'message': 'Package ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the travel package
        try:
            package = TravelPackage.objects.get(id=package_id)
        except DoesNotExist:
            return Response({
                'success': False,
                'message': 'Travel package not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create a user trip from the package
        user_trip = UserTrip(
            user=user,
            title=package.title,
            location=package.subtitle or package.title,
            stay=package.duration,
            price=package.current_price,
            old_price=package.old_price,
            save_amount=package.save_amount,
            image_url=package.image_url,
            status='upcoming'
        )
        user_trip.save()
        
        return Response({
            'success': True,
            'message': 'Trip booked successfully',
            'trip': user_trip.to_dict()
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to book trip',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user_trip(request):
    """Create a custom trip for the authenticated user"""
    try:
        user = request.user
        data = request.data
        
        # Validate required fields
        required_fields = ['title', 'location', 'stay', 'price']
        for field in required_fields:
            if not data.get(field):
                return Response({
                    'success': False,
                    'message': f'{field} is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user trip
        user_trip = UserTrip(
            user=user,
            title=data['title'],
            location=data['location'],
            stay=data['stay'],
            price=float(data['price']),
            old_price=float(data.get('old_price', data['price'])),
            save_amount=float(data.get('save_amount', 0)),
            image_url=data.get('image_url', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'),
            status=data.get('status', 'upcoming')
        )
        user_trip.save()
        
        return Response({
            'success': True,
            'message': 'Trip created successfully',
            'trip': user_trip.to_dict()
        }, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response({
            'success': False,
            'message': 'Invalid price format'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to create trip',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recent_user_trips(request):
    """Get recent trips for dashboard"""
    try:
        user = request.user
        trips = UserTrip.objects(user=user).order_by('-created_at')[:5]
        
        return Response({
            'success': True,
            'trips': [trip.to_dict() for trip in trips]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch recent trips'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_trip(request, trip_id):
    """Delete a user trip"""
    try:
        user = request.user
        trip = UserTrip.objects.get(id=trip_id, user=user)
        trip.delete()
        
        return Response({
            'success': True,
            'message': 'Trip deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except DoesNotExist:
        return Response({
            'success': False,
            'message': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to delete trip',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
