from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from trips.models import Trip
from destinations.models import Destination


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """Get dashboard statistics for the authenticated user"""
    try:
        user = request.user
        
        # Get user's trips
        user_trips = Trip.objects(user=user)
        
        # Calculate statistics
        total_trips = user_trips.count()
        
        # Upcoming trips (trips that start in the future)
        now = datetime.utcnow()
        upcoming_trips = user_trips.filter(start_date__gte=now).count()
        
        # Total budget from all trips
        total_budget = sum(trip.total_budget for trip in user_trips)
        
        # Visited cities (unique destinations)
        visited_cities = len(set(trip.destination for trip in user_trips))
        
        stats = {
            'totalTrips': total_trips,
            'upcomingTrips': upcoming_trips,
            'totalBudget': total_budget,
            'visitedCities': visited_cities
        }
        
        return Response({
            'success': True,
            'stats': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch dashboard statistics'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
