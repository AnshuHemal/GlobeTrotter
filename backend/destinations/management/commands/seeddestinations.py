from django.core.management.base import BaseCommand
from destinations.models import Destination


class Command(BaseCommand):
    help = 'Seed destinations in MongoDB'
    
    def handle(self, *args, **options):
        # Check if destinations already exist
        if Destination.objects.count() > 0:
            self.stdout.write(
                self.style.WARNING('Destinations already exist. Skipping seeding.')
            )
            return
        
        # Dummy destination data
        destinations_data = [
            {
                'name': 'Bali',
                'country': 'Indonesia',
                'description': 'Tropical paradise with beautiful beaches, rice terraces, and vibrant culture.',
                'latitude': -8.3405,
                'longitude': 115.0920,
                'category': 'beach',
                'best_time_to_visit': 'April to October',
                'average_cost_per_day': 75.0,
                'popular_activities': ['Surfing', 'Temple Visits', 'Rice Field Trekking'],
                'image_url': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'popularity_score': 95,
                'visit_count': 12000
            },
            {
                'name': 'Paris',
                'country': 'France',
                'description': 'City of love with iconic landmarks, world-class museums, and exquisite cuisine.',
                'latitude': 48.8566,
                'longitude': 2.3522,
                'category': 'city',
                'best_time_to_visit': 'April to June, September to November',
                'average_cost_per_day': 150.0,
                'popular_activities': ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral'],
                'image_url': 'https://images.unsplash.com/photo-1508050919630-b135583b29ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'popularity_score': 98,
                'visit_count': 15000
            },
            {
                'name': 'Kyoto',
                'country': 'Japan',
                'description': 'Historic city with traditional temples, gardens, and geisha districts.',
                'latitude': 35.0116,
                'longitude': 135.7681,
                'category': 'cultural',
                'best_time_to_visit': 'March to May, September to November',
                'average_cost_per_day': 120.0,
                'popular_activities': ['Temple Visits', 'Cherry Blossom Viewing', 'Tea Ceremony'],
                'image_url': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'popularity_score': 92,
                'visit_count': 9500
            },
            {
                'name': 'Santorini',
                'country': 'Greece',
                'description': 'Stunning island with white-washed buildings, blue domes, and breathtaking sunsets.',
                'latitude': 36.3932,
                'longitude': 25.4615,
                'category': 'beach',
                'best_time_to_visit': 'May to October',
                'average_cost_per_day': 110.0,
                'popular_activities': ['Sunset Viewing', 'Wine Tasting', 'Beach Relaxation'],
                'image_url': 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'popularity_score': 88,
                'visit_count': 8200
            },
            {
                'name': 'Banff',
                'country': 'Canada',
                'description': 'Mountain resort town in the heart of the Canadian Rockies with stunning natural beauty.',
                'latitude': 51.4968,
                'longitude': -115.9281,
                'category': 'mountain',
                'best_time_to_visit': 'June to August, December to March',
                'average_cost_per_day': 130.0,
                'popular_activities': ['Hiking', 'Skiing', 'Lake Louise Visit'],
                'image_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'popularity_score': 85,
                'visit_count': 7500
            },
            {
                'name': 'Machu Picchu',
                'country': 'Peru',
                'description': 'Ancient Incan citadel set high in the Andes Mountains with breathtaking views.',
                'latitude': -13.1631,
                'longitude': -72.5450,
                'category': 'historical',
                'best_time_to_visit': 'May to September',
                'average_cost_per_day': 95.0,
                'popular_activities': ['Inca Trail Hiking', 'Archaeological Tours', 'Sun Gate Viewing'],
                'image_url': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'popularity_score': 90,
                'visit_count': 10500
            },
            {
                'name': 'Dubai',
                'country': 'UAE',
                'description': 'Modern metropolis with futuristic architecture, luxury shopping, and desert adventures.',
                'latitude': 25.2048,
                'longitude': 55.2708,
                'category': 'city',
                'best_time_to_visit': 'November to March',
                'average_cost_per_day': 200.0,
                'popular_activities': ['Burj Khalifa', 'Desert Safari', 'Shopping'],
                'image_url': 'https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'popularity_score': 87,
                'visit_count': 9200
            },
            {
                'name': 'Queenstown',
                'country': 'New Zealand',
                'description': 'Adventure capital with stunning landscapes, lakes, and mountains.',
                'latitude': -45.0311,
                'longitude': 168.6626,
                'category': 'adventure',
                'best_time_to_visit': 'October to April',
                'average_cost_per_day': 140.0,
                'popular_activities': ['Bungee Jumping', 'Skydiving', 'Lake Cruises'],
                'image_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'popularity_score': 83,
                'visit_count': 6800
            }
        ]
        
        # Insert destinations
        created_count = 0
        for dest_data in destinations_data:
            destination = Destination(**dest_data)
            destination.save()
            created_count += 1
            
        self.stdout.write(
            self.style.SUCCESS(f'Successfully inserted {created_count} destinations')
        )
