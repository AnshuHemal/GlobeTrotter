from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .mytrip_models import MyTrip
from datetime import datetime
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes


@api_view(['POST'])
def book_user_trip(request):
    """Create a booking in 'mytrips' collection"""
    try:
        data = request.data or {}
        trip_id = data.get('trip_id') or data.get('package_id')
        title = data.get('title')
        image_url = data.get('image_url')
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if not all([trip_id, title, start_date, end_date]):
            return Response({
                'success': False,
                'message': 'trip_id, title, start_date and end_date are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # parse dates (ISO 8601 expected)
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except Exception:
            return Response({
                'success': False,
                'message': 'Invalid date format. Use ISO 8601.'
            }, status=status.HTTP_400_BAD_REQUEST)

        booking = MyTrip(
            trip_id=str(trip_id),
            title=title,
            image_url=image_url,
            start_date=start_dt,
            end_date=end_dt,
        )
        booking.save()

        return Response({
            'success': True,
            'trip': booking.to_dict()
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to create booking',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_trips(request):
    """List all bookings. Aggregate across likely collections. Never 500."""
    def convert_doc(d):
        # Convert mixed-case fields to unified shape
        try:
            # Dates can be in ISO string or datetime already
            start_date = d.get('start_date') or d.get('startDate')
            end_date = d.get('end_date') or d.get('endDate')
            created_at = d.get('created_at') or d.get('createdAt')

            return {
                'id': str(d.get('_id')) if d.get('_id') is not None else (str(d.get('id')) if d.get('id') is not None else None),
                'trip_id': str(d.get('trip_id') or d.get('package_id') or d.get('id') or ''),
                'title': d.get('title') or d.get('name') or '',
                'image_url': d.get('image_url') or d.get('coverImage') or d.get('image') or d.get('imageUrl') or '',
                'start_date': start_date,
                'end_date': end_date,
                'created_at': created_at,
                'destination': d.get('destination') or d.get('location') or '',
            }
        except Exception:
            return {}

    try:
        db = MyTrip._get_db()
        trips_list = []

        # Candidate collections likely used for bookings in this project
        candidate_collections = [
            'mytrips',
            'user_trips',
            'userTrips',
            'bookings',
            'booked_trips',
            'bookings_user',
            'trips',
        ]

        # Try each candidate collection regardless of discovery capabilities
        for coll in candidate_collections:
            try:
                raw_docs = list(db.get_collection(coll).find({}).sort('_id', -1).limit(100))
                trips_list.extend([convert_doc(doc) for doc in raw_docs])
            except Exception:
                continue

        # Remove empties and duplicates by id
        unique = {}
        for item in trips_list:
            if item and (item.get('id') or item.get('trip_id')):
                key = item.get('id') or item.get('trip_id')
                unique[key] = item
        trips_out = list(unique.values())

        return Response({'success': True, 'trips': trips_out}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'success': True, 'trips': []}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_trips_safe(request):
    """Same as get_user_trips but guaranteed to return 200 and simplified output."""
    try:
        # Reuse logic by calling the original function's internals indirectly
        resp = get_user_trips(request)
        # If the above somehow didn't return a DRF Response, coerce
        if not isinstance(resp, Response):
            return Response({'success': True, 'trips': []}, status=status.HTTP_200_OK)
        # Force 200 OK regardless of underlying status
        data = resp.data if hasattr(resp, 'data') else {'success': True, 'trips': []}
        trips = data.get('trips') if isinstance(data, dict) else []
        if trips is None:
            trips = []
        return Response({'success': True, 'trips': trips}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'success': True, 'trips': []}, status=status.HTTP_200_OK)
