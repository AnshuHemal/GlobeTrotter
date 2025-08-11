from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist
from .models import Destination, City
from trips.models import Trip
from authentication.models import User


@api_view(['GET'])
@permission_classes([AllowAny])
def get_popular_destinations(request):
    """Get popular destinations"""
    try:
        destinations = Destination.objects().order_by('-popularity_score')[:10]
        
        return Response({
            'success': True,
            'destinations': [dest.to_dict() for dest in destinations]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch popular destinations'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_destinations(request):
    """Search destinations by name or country"""
    try:
        query = request.GET.get('q', '').strip()
        category = request.GET.get('category', '').strip()
        
        if not query:
            return Response({
                'success': False,
                'message': 'Search query is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Build search criteria
        search_criteria = {}
        
        # Text search in name, country, or description
        search_criteria['$or'] = [
            {'name__icontains': query},
            {'country__icontains': query},
            {'description__icontains': query}
        ]
        
        # Add category filter if provided
        if category:
            search_criteria['category'] = category
        
        destinations = Destination.objects(__raw__=search_criteria).order_by('-popularity_score')[:20]
        
        return Response({
            'success': True,
            'destinations': [dest.to_dict() for dest in destinations]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to search destinations'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_cities(request):
    """Search cities by name or country"""
    try:
        query = request.GET.get('q', '').strip()
        
        if not query:
            return Response({
                'success': False,
                'message': 'Search query is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Search in name, country, or state/province
        search_criteria = {
            '$or': [
                {'name__icontains': query},
                {'country__icontains': query},
                {'state_province__icontains': query}
            ]
        }
        
        cities = City.objects(__raw__=search_criteria)[:20]
        
        return Response({
            'success': True,
            'cities': [city.to_dict() for city in cities]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to search cities'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_activities(request):
    """Search activities from destinations"""
    try:
        query = request.GET.get('q', '').strip()
        destination = request.GET.get('destination', '').strip()
        
        if not query:
            return Response({
                'success': False,
                'message': 'Search query is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Build search criteria
        search_criteria = {}
        
        if destination:
            search_criteria['$or'] = [
                {'name__icontains': destination},
                {'country__icontains': destination}
            ]
        
        destinations = Destination.objects(__raw__=search_criteria if destination else {})
        
        # Extract activities that match the query
        matching_activities = []
        for dest in destinations:
            for activity in dest.popular_activities:
                if query.lower() in activity.lower():
                    matching_activities.append({
                        'activity': activity,
                        'destination': dest.name,
                        'country': dest.country,
                        'destination_id': str(dest.id)
                    })
        
        return Response({
            'success': True,
            'activities': matching_activities[:20]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to search activities'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_destination(request, destination_id):
    """Get a specific destination"""
    try:
        destination = Destination.objects.get(id=destination_id)
        
        # Increment visit count
        destination.visit_count += 1
        destination.save()
        
        return Response({
            'success': True,
            'destination': destination.to_dict()
        }, status=status.HTTP_200_OK)
        
    except DoesNotExist:
        return Response({
            'success': False,
            'message': 'Destination not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch destination'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
