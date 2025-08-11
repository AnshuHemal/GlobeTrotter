from datetime import datetime, timedelta
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
    print("Get user trips endpoint hit")  # Debug log
    
    try:
        user = request.user
        print(f"Fetching trips for user: {user.id}")  # Debug log
        
        # Get query parameters for filtering/sorting
        status_filter = request.query_params.get('status')
        sort_by = request.query_params.get('sort_by', '-created_at')
        
        # Build query
        query = {'user': user.id}
        if status_filter and status_filter.lower() != 'all':
            query['status'] = status_filter.lower()
        
        print(f"Querying trips with: {query}")  # Debug log
        
        # Execute query
        trips = UserTrip.objects(**query).order_by(sort_by)
        trips_list = [trip.to_dict() for trip in trips]
        
        print(f"Found {len(trips_list)} trips")  # Debug log
        
        return Response({
            'success': True,
            'count': len(trips_list),
            'trips': trips_list
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in get_user_trips: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full traceback to console
        
        return Response({
            'success': False,
            'message': 'Failed to fetch user trips',
            'error': str(e),
            'details': 'An error occurred while retrieving your trips. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_trip_package(request):
    """Book a travel package for the authenticated user"""
    print("Book trip package endpoint hit")  # Debug log
    print(f"Request data: {request.data}")  # Debug log
    
    try:
        user = request.user
        print(f"Authenticated user: {user.id}")  # Debug log
        
        package_id = request.data.get('package_id')
        print(f"Package ID from request: {package_id}")  # Debug log
        
        if not package_id:
            print("Error: Package ID is missing")  # Debug log
            return Response({
                'success': False,
                'message': 'Package ID is required',
                'error': 'MISSING_PACKAGE_ID'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the travel package
        try:
            print(f"Looking for package with ID: {package_id}")  # Debug log
            package = TravelPackage.objects.get(id=package_id)
            print(f"Found package: {package.title}")  # Debug log
        except (DoesNotExist, ValidationError) as e:
            print(f"Package not found or invalid ID: {str(e)}")  # Debug log
            return Response({
                'success': False,
                'message': 'Travel package not found',
                'error': 'PACKAGE_NOT_FOUND',
                'details': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            # Get trip details from request or use package defaults
            title = request.data.get('title', package.title)
            description = request.data.get('description', package.description or '')
            destination = request.data.get('destination', package.subtitle or package.title)
            start_date = request.data.get('start_date', datetime.utcnow())
            end_date = request.data.get('end_date')
            
            # Ensure we have valid dates
            if not end_date and package.duration:
                # Try to parse duration string like '7 Days 6 Nights'
                try:
                    days = int(package.duration.split()[0])
                    end_date = start_date + timedelta(days=days)
                except (ValueError, IndexError, AttributeError):
                    end_date = start_date + timedelta(days=7)  # Default to 7 days if can't parse
            
            total_budget = float(request.data.get('total_budget', package.current_price or 0))
            
            print(f"Creating trip with data: {{\n  title: {title},\n  destination: {destination},\n  start_date: {start_date},\n  end_date: {end_date},\n  price: {total_budget}\n}}")  # Debug log
            
            # Create a user trip from the package
            user_trip = UserTrip(
                user=user.id,  # Store user ID as reference
                title=title,
                location=destination,  # Using location as required by the model
                stay=package.duration or 'Custom',
                price=total_budget,
                old_price=float(package.old_price) if package.old_price is not None else total_budget,
                save_amount=float(package.save_amount) if package.save_amount is not None else 0,
                image_url=package.image_url or '',
                status='upcoming'
            )
            
            print("Saving trip to database...")  # Debug log
            user_trip.save()
            print(f"Trip saved with ID: {user_trip.id}")  # Debug log
            
        except ValidationError as ve:
            print(f"Validation error: {str(ve)}")  # Debug log
            return Response({
                'success': False,
                'message': 'Invalid trip data',
                'error': 'VALIDATION_ERROR',
                'details': str(ve)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error creating trip: {str(e)}")  # Debug log
            return Response({
                'success': False,
                'message': 'Failed to create trip',
                'error': 'TRIP_CREATION_FAILED',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Convert trip to dict including all required fields for frontend
        trip_data = user_trip.to_dict()
        
        # Ensure all required fields are present for frontend
        trip_data.update({
            'startDate': trip_data.get('startDate') or start_date.isoformat() if hasattr(start_date, 'isoformat') else str(start_date),
            'endDate': trip_data.get('endDate') or (end_date.isoformat() if hasattr(end_date, 'isoformat') else str(end_date) if end_date else None),
            'budget': trip_data.get('budget') or total_budget,
            'coverImage': trip_data.get('coverImage') or package.image_url or ''
        })
        
        print(f"Trip created successfully: {trip_data}")  # Debug log
        
        return Response({
            'success': True,
            'message': 'Trip booked successfully',
            'trip': trip_data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Unexpected error in book_trip_package: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full traceback to console
        
        return Response({
            'success': False,
            'message': 'An unexpected error occurred while booking your trip',
            'error': 'INTERNAL_SERVER_ERROR',
            'details': str(e)
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
