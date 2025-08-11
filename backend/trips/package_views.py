from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .package_models import TravelPackage


@api_view(['GET'])
def get_travel_packages(request):
    """Get all travel packages"""
    try:
        # Check if collection is empty and seed with dummy data if needed
        if TravelPackage.objects.count() == 0:
            seed_travel_packages()
        
        packages = TravelPackage.objects.all()
        return Response({
            'success': True,
            'packages': [package.to_dict() for package in packages]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to fetch travel packages',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def seed_travel_packages():
    """Seed the database with initial travel packages"""
    packages_data = [
        {
            'title': 'Thailand Full Moon Party',
            'subtitle': 'with Phuket, Krabi & Ko Samui',
            'duration': '7 Days 6 Nights',
            'description': 'Experience the vibrant nightlife of Thailand with visits to Phuket, Krabi, and Ko Samui.',
            'current_price': 42850,
            'old_price': 47050,
            'save_amount': 5000,
            'image_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            'rating': 4.8,
            'category': 'Adventure'
        },
        {
            'title': 'Vietnam Group Trip',
            'subtitle': 'Ho Chi Minh, Da Nang, Hoi An, Hanoi',
            'duration': '8 Days 7 Nights',
            'description': 'Explore the cultural richness of Vietnam from bustling cities to serene landscapes.',
            'current_price': 45850,
            'old_price': 50850,
            'save_amount': 5000,
            'image_url': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            'rating': 4.7,
            'category': 'Cultural'
        },
        {
            'title': 'Bali Group Trip',
            'subtitle': 'With ATV & Gili Island',
            'duration': '6 Days 7 Nights',
            'description': 'Discover the beauty of Bali with thrilling ATV rides and tranquil island visits.',
            'current_price': 45900,
            'old_price': 52100,
            'save_amount': 6200,
            'image_url': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            'rating': 4.9,
            'category': 'Beach'
        },
        {
            'title': 'Spiti Valley Road Trip',
            'subtitle': 'with Chandratal Lake',
            'duration': '11 Days 10 Nights',
            'description': 'Experience the breathtaking landscapes of Spiti Valley and the serene Chandratal Lake.',
            'current_price': 21950,
            'old_price': 23950,
            'save_amount': 2000,
            'image_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            'rating': 4.6,
            'category': 'Adventure'
        },
        {
            'title': 'Kerala Backwaters',
            'subtitle': 'Munnar, Thekkady & Alleppey',
            'duration': '5 Days 4 Nights',
            'description': 'Cruise through the serene backwaters of Kerala and explore its lush hill stations.',
            'current_price': 28500,
            'old_price': 32000,
            'save_amount': 3500,
            'image_url': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            'rating': 4.5,
            'category': 'Nature'
        },
        {
            'title': 'Rajasthan Royal Tour',
            'subtitle': 'Jaipur, Udaipur & Jodhpur',
            'duration': '9 Days 8 Nights',
            'description': 'Discover the royal heritage of Rajasthan with visits to magnificent palaces and forts.',
            'current_price': 55000,
            'old_price': 62000,
            'save_amount': 7000,
            'image_url': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            'rating': 4.8,
            'category': 'Cultural'
        }
    ]
    
    for package_data in packages_data:
        package = TravelPackage(**package_data)
        package.save()
    
    print("Travel packages seeded successfully!")
