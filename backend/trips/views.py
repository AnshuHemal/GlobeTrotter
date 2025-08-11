from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from mongoengine.errors import DoesNotExist, ValidationError
import os
import traceback
from datetime import datetime, timedelta
from .models import Trip, Activity, BudgetItem
import uuid


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_trip_stops(request, trip_id):
    """Get all stops for a specific trip"""
    try:
        user = request.user
        trip = Trip.objects.get(id=trip_id, user=user)
        
        # Return empty stops array since the model doesn't have a stops field yet
        return Response({
            'success': True,
            'stops': []
        }, status=status.HTTP_200_OK)
        
    except DoesNotExist:
        return Response({
            'success': False,
            'message': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch trip stops',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_trips(request):
    """Get all trips for the authenticated user"""
    try:
        user = request.user
        trips = Trip.objects(user=user).order_by('-created_at')
        
        return Response({
            'success': True,
            'trips': [trip.to_dict() for trip in trips]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"ERROR in get_trips: {str(e)}")
        print(f"Traceback:\n{traceback.format_exc()}")
        return Response({
            'success': False,
            'message': 'Failed to fetch trips',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recent_trips(request):
    """Get recent trips for dashboard"""
    try:
        user = request.user
        trips = Trip.objects(user=user).order_by('-created_at')[:5]
        
        return Response({
            'success': True,
            'trips': [trip.to_dict() for trip in trips]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch recent trips'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def create_trip(request):
    """Create a new trip"""
    try:
        print(f"DEBUG: create_trip called with method: {request.method}")
        print(f"DEBUG: request.content_type: {request.content_type}")
        print(f"DEBUG: request.user: {request.user}")
        print(f"DEBUG: request.user.is_authenticated: {request.user.is_authenticated}")
        
        user = request.user
        
        # Now that we have proper parsers, we can use request.data directly
        data = request.data
            
        print(f"DEBUG: request.data type: {type(data)}")
        print(f"DEBUG: request.data content: {data}")
        
        # Validation - map frontend field names to backend field names
        field_mapping = {
            'name': 'title',
            'startDate': 'start_date', 
            'endDate': 'end_date'
        }
        
        # Convert frontend field names to backend field names
        mapped_data = {}
        for frontend_field, backend_field in field_mapping.items():
            if frontend_field in data:
                mapped_data[backend_field] = data[frontend_field]
        
        # Add other fields directly
        for field in ['description']:
            if field in data:
                mapped_data[field] = data[field]
        
        # Set destination to the same as title for now (since frontend doesn't send destination)
        if 'title' in mapped_data:
            mapped_data['destination'] = mapped_data['title']
        
        print(f"DEBUG: mapped_data: {mapped_data}")
        
        required_fields = ['title', 'destination', 'start_date', 'end_date']
        for field in required_fields:
            if not mapped_data.get(field):
                return Response({
                    'success': False,
                    'message': f'{field} is required (mapped from frontend)'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Use mapped data for further processing
        data = mapped_data
        
        # Parse dates
        try:
            print(f"DEBUG: Parsing start_date: {data['start_date']}")
            print(f"DEBUG: Parsing end_date: {data['end_date']}")
            
            # Handle different date formats from frontend
            start_date_str = data['start_date']
            end_date_str = data['end_date']
            
            # If the date is in YYYY-MM-DD format (from HTML date input), parse it directly
            if 'T' not in start_date_str and 'Z' not in start_date_str:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            else:
                # Handle ISO format dates
                start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                
            print(f"DEBUG: Parsed start_date: {start_date}")
            print(f"DEBUG: Parsed end_date: {end_date}")
            
        except ValueError as e:
            print(f"DEBUG: Date parsing error: {e}")
            print(f"DEBUG: start_date_str: {data['start_date']}")
            print(f"DEBUG: end_date_str: {data['end_date']}")
            return Response({
                'success': False,
                'message': f'Invalid date format: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if start_date >= end_date:
            return Response({
                'success': False,
                'message': 'End date must be after start date'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create trip
        trip = Trip(
            title=data['title'],
            description=data.get('description', ''),
            destination=data['destination'],
            start_date=start_date,
            end_date=end_date,
            user=user,
            total_budget=data.get('total_budget', 0.0),
            shared_link=str(uuid.uuid4())[:8]
        )
        trip.save()
        
        return Response({
            'success': True,
            'message': 'Trip created successfully',
            'trip': trip.to_dict()
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR in create_trip: {str(e)}")
        print(f"Traceback:\n{error_trace}")
        return Response({
            'success': False,
            'message': 'Failed to create trip',
            'error': str(e),
            'traceback': error_trace if 'DEBUG' in os.environ else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_trip(request, trip_id):
    """Get a specific trip"""
    try:
        user = request.user
        trip = Trip.objects.get(id=trip_id, user=user)
        
        return Response({
            'success': True,
            'trip': trip.to_dict()
        }, status=status.HTTP_200_OK)
        
    except DoesNotExist:
        return Response({
            'success': False,
            'message': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch trip'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_trip(request, trip_id):
    """Update a trip"""
    try:
        user = request.user
        trip = Trip.objects.get(id=trip_id, user=user)
        data = request.data
        
        # Update fields
        if 'title' in data:
            trip.title = data['title']
        if 'description' in data:
            trip.description = data['description']
        if 'destination' in data:
            trip.destination = data['destination']
        if 'start_date' in data:
            trip.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        if 'end_date' in data:
            trip.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        if 'total_budget' in data:
            trip.total_budget = data['total_budget']
        if 'status' in data:
            trip.status = data['status']
        
        trip.save()
        
        return Response({
            'success': True,
            'message': 'Trip updated successfully',
            'trip': trip.to_dict()
        }, status=status.HTTP_200_OK)
        
    except DoesNotExist:
        return Response({
            'success': False,
            'message': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to update trip'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_trip(request, trip_id):
    """Delete a trip"""
    try:
        user = request.user
        trip = Trip.objects.get(id=trip_id, user=user)
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
            'message': 'Failed to delete trip'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_activities(request, trip_id):
    """Manage activities for a trip"""
    try:
        user = request.user
        trip = Trip.objects.get(id=trip_id, user=user)
        
        if request.method == 'GET':
            return Response({
                'success': True,
                'activities': [
                    {
                        'name': activity.name,
                        'description': activity.description,
                        'location': activity.location,
                        'category': activity.category,
                        'estimated_cost': activity.estimated_cost,
                        'estimated_duration': activity.estimated_duration,
                        'date': activity.date.isoformat() if activity.date else None,
                        'time': activity.time,
                        'is_completed': activity.is_completed,
                        'notes': activity.notes
                    } for activity in trip.activities
                ]
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            data = request.data
            activity = Activity(
                name=data.get('name', ''),
                description=data.get('description', ''),
                location=data.get('location', ''),
                category=data.get('category', ''),
                estimated_cost=data.get('estimated_cost', 0.0),
                estimated_duration=data.get('estimated_duration', 60),
                date=datetime.fromisoformat(data['date'].replace('Z', '+00:00')) if data.get('date') else None,
                time=data.get('time', ''),
                notes=data.get('notes', '')
            )
            trip.activities.append(activity)
            trip.save()
            
            return Response({
                'success': True,
                'message': 'Activity added successfully'
            }, status=status.HTTP_201_CREATED)
        
    except DoesNotExist:
        return Response({
            'success': False,
            'message': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to manage activities'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_budget(request, trip_id):
    """Manage budget for a trip"""
    try:
        user = request.user
        trip = Trip.objects.get(id=trip_id, user=user)
        
        if request.method == 'GET':
            return Response({
                'success': True,
                'budget_items': [
                    {
                        'category': item.category,
                        'planned_amount': item.planned_amount,
                        'actual_amount': item.actual_amount,
                        'description': item.description
                    } for item in trip.budget_items
                ],
                'total_budget': trip.total_budget
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            data = request.data
            budget_item = BudgetItem(
                category=data.get('category', ''),
                planned_amount=data.get('planned_amount', 0.0),
                actual_amount=data.get('actual_amount', 0.0),
                description=data.get('description', '')
            )
            trip.budget_items.append(budget_item)
            trip.save()
            
            return Response({
                'success': True,
                'message': 'Budget item added successfully'
            }, status=status.HTTP_201_CREATED)
        
    except DoesNotExist:
        return Response({
            'success': False,
            'message': 'Trip not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to manage budget'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
