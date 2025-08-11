from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist, ValidationError
from .models import Destination
from trips.models import Trip
from authentication.models import User
from datetime import datetime
from django.core.paginator import Paginator


@api_view(['GET'])
@permission_classes([AllowAny])
def list_all_destinations(request):
    """
    List all destinations with optional filtering and pagination
    Query params:
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    - country: Filter by country (case-insensitive substring match)
    - category: Filter by category (exact match)
    - sort: Field to sort by (default: -popularity_score)
    """
    try:
        # Get query parameters with defaults
        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 20)), 100)
        country = request.query_params.get('country', '').strip()
        category = request.query_params.get('category', '').strip()
        sort = request.query_params.get('sort', '-popularity_score')
        
        # Build query
        query = {}
        if country:
            query['country__icontains'] = country
        if category:
            query['category'] = category
        
        # Get and sort destinations
        destinations = Destination.objects(**query).order_by(sort)
        
        # Paginate results
        paginator = Paginator(destinations, page_size)
        page_obj = paginator.get_page(page)
        
        # Prepare response data
        data = {
            'success': True,
            'count': paginator.count,
            'page': page_obj.number,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'results': [dest.to_dict() for dest in page_obj.object_list]
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except (ValueError, ValidationError) as e:
        return Response({
            'success': False,
            'message': 'Invalid request parameters',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch destinations',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            'message': 'Failed to fetch popular destinations',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_places(request):
    """Get all destinations in a unified format"""
    try:
        # Get all destinations and format them
        destinations = Destination.objects.all()
        all_places = [{
            'id': str(dest.id),
            'name': dest.name,
            'country': dest.country,
            'type': 'destination',
            'image_url': dest.image_url,
            'description': dest.description,
            'average_cost': dest.average_cost_per_day,
            'popularity': dest.popularity_score,
            'created_at': dest.created_at.isoformat() if dest.created_at else datetime.utcnow().isoformat()
        } for dest in destinations]

        # Sort by popularity
        all_places.sort(key=lambda x: x['popularity'], reverse=True)

        return Response({
            'success': True,
            'places': all_places
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch places',
            'error': str(e)
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
