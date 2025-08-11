#!/usr/bin/env python
"""
Script to populate MongoDB with dummy data for the Globetrotter application
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from trips.models import Trip, Activity, BudgetItem
from destinations.models import Destination


def create_sample_users():
    """Create sample users"""
    print("Creating sample users...")
    
    # Clear existing users
    User.objects.delete()
    
    users_data = [
        {
            'name': 'John Doe',
            'email': 'john@example.com',
            'password': 'password123'
        },
        {
            'name': 'Jane Smith',
            'email': 'jane@example.com',
            'password': 'password123'
        },
        {
            'name': 'Admin User',
            'email': 'admin@example.com',
            'password': 'admin123',
            'is_admin': True
        }
    ]
    
    created_users = []
    for user_data in users_data:
        user = User(
            name=user_data['name'],
            email=user_data['email'],
            is_admin=user_data.get('is_admin', False)
        )
        user.set_password(user_data['password'])
        user.save()
        created_users.append(user)
        print(f"Created user: {user.name} ({user.email})")
    
    return created_users


def create_sample_destinations():
    """Create sample destinations"""
    print("Creating sample destinations...")
    
    # Clear existing destinations
    Destination.objects.delete()
    
    destinations_data = [
        {
            'name': 'Paris',
            'country': 'France',
            'description': 'Known for its art, fashion, gastronomy, and culture.',
            'latitude': 48.8566,
            'longitude': 2.3522,
            'category': 'cultural',
            'best_time_to_visit': 'April to June, September to October',
            'average_cost_per_day': 150.0,
            'popular_activities': ['Visit Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Montmartre Walk'],
            'popularity_score': 95
        },
        {
            'name': 'Tokyo',
            'country': 'Japan',
            'description': 'A bustling metropolis blending traditional and modern culture.',
            'latitude': 35.6762,
            'longitude': 139.6503,
            'category': 'cultural',
            'best_time_to_visit': 'March to May, September to November',
            'average_cost_per_day': 120.0,
            'popular_activities': ['Visit Senso-ji Temple', 'Shibuya Crossing', 'Tsukiji Fish Market', 'Cherry Blossom Viewing'],
            'popularity_score': 92
        },
        {
            'name': 'Bali',
            'country': 'Indonesia',
            'description': 'Tropical paradise with beautiful beaches, temples, and rice terraces.',
            'latitude': -8.3405,
            'longitude': 115.0920,
            'category': 'beach',
            'best_time_to_visit': 'April to October',
            'average_cost_per_day': 50.0,
            'popular_activities': ['Beach Hopping', 'Temple Visits', 'Rice Terrace Tours', 'Volcano Hiking'],
            'popularity_score': 88
        },
        {
            'name': 'New York City',
            'country': 'United States',
            'description': 'The Big Apple - iconic skyline, Broadway shows, and world-class museums.',
            'latitude': 40.7128,
            'longitude': -74.0060,
            'category': 'city',
            'best_time_to_visit': 'April to June, September to November',
            'average_cost_per_day': 200.0,
            'popular_activities': ['Statue of Liberty', 'Central Park', 'Broadway Shows', 'Times Square'],
            'popularity_score': 90
        },
        {
            'name': 'Swiss Alps',
            'country': 'Switzerland',
            'description': 'Majestic mountain range perfect for skiing and hiking.',
            'latitude': 46.5197,
            'longitude': 7.4815,
            'category': 'mountain',
            'best_time_to_visit': 'December to March (skiing), June to September (hiking)',
            'average_cost_per_day': 180.0,
            'popular_activities': ['Skiing', 'Mountain Hiking', 'Cable Car Rides', 'Alpine Lakes'],
            'popularity_score': 85
        }
    ]
    
    # Create destinations
    created_destinations = []
    for dest_data in destinations_data:
        destination = Destination(**dest_data)
        destination.save()
        created_destinations.append(destination)
        print(f"Created destination: {destination.name}, {destination.country}")
    
    print("Skipping city creation as the City model has been removed")
    return created_destinations, []
    
    return created_destinations, created_cities


def create_sample_trips(users):
    """Create sample trips for users"""
    print("Creating sample trips...")
    
    # Clear existing trips
    Trip.objects.delete()
    
    if not users:
        print("No users available to create trips for")
        return []
    
    user = users[0]  # Use the first user
    
    trips_data = [
        {
            'title': 'Paris Adventure',
            'description': 'A romantic getaway to Paris',
            'destination': 'Paris, France',
            'start_date': datetime.now() + timedelta(days=30),
            'end_date': datetime.now() + timedelta(days=37),
            'total_budget': 2500.0,
            'status': 'planning'
        },
        {
            'title': 'Tokyo Discovery',
            'description': 'Exploring the vibrant culture of Japan',
            'destination': 'Tokyo, Japan',
            'start_date': datetime.now() + timedelta(days=60),
            'end_date': datetime.now() + timedelta(days=70),
            'total_budget': 3000.0,
            'status': 'planning'
        },
        {
            'title': 'Bali Relaxation',
            'description': 'Beach vacation in tropical paradise',
            'destination': 'Bali, Indonesia',
            'start_date': datetime.now() - timedelta(days=30),
            'end_date': datetime.now() - timedelta(days=23),
            'total_budget': 1500.0,
            'status': 'completed'
        }
    ]
    
    created_trips = []
    for trip_data in trips_data:
        # Create activities for each trip
        activities = []
        if 'Paris' in trip_data['destination']:
            activities = [
                Activity(
                    name='Visit Eiffel Tower',
                    description='Iconic tower visit with city views',
                    location='Champ de Mars, Paris',
                    category='sightseeing',
                    estimated_cost=25.0,
                    estimated_duration=180,
                    date=trip_data['start_date'] + timedelta(days=1),
                    time='10:00'
                ),
                Activity(
                    name='Louvre Museum',
                    description='World-famous art museum',
                    location='Rue de Rivoli, Paris',
                    category='sightseeing',
                    estimated_cost=17.0,
                    estimated_duration=240,
                    date=trip_data['start_date'] + timedelta(days=2),
                    time='09:00'
                )
            ]
        elif 'Tokyo' in trip_data['destination']:
            activities = [
                Activity(
                    name='Senso-ji Temple',
                    description='Ancient Buddhist temple',
                    location='Asakusa, Tokyo',
                    category='sightseeing',
                    estimated_cost=0.0,
                    estimated_duration=120,
                    date=trip_data['start_date'] + timedelta(days=1),
                    time='09:00'
                ),
                Activity(
                    name='Sushi Dinner',
                    description='Traditional sushi experience',
                    location='Ginza, Tokyo',
                    category='food',
                    estimated_cost=80.0,
                    estimated_duration=90,
                    date=trip_data['start_date'] + timedelta(days=1),
                    time='19:00'
                )
            ]
        
        # Create budget items
        budget_items = [
            BudgetItem(
                category='accommodation',
                planned_amount=trip_data['total_budget'] * 0.4,
                actual_amount=0.0,
                description='Hotel and lodging expenses'
            ),
            BudgetItem(
                category='food',
                planned_amount=trip_data['total_budget'] * 0.3,
                actual_amount=0.0,
                description='Meals and dining'
            ),
            BudgetItem(
                category='transport',
                planned_amount=trip_data['total_budget'] * 0.2,
                actual_amount=0.0,
                description='Flights and local transport'
            ),
            BudgetItem(
                category='activities',
                planned_amount=trip_data['total_budget'] * 0.1,
                actual_amount=0.0,
                description='Tours and attractions'
            )
        ]
        
        trip = Trip(
            title=trip_data['title'],
            description=trip_data['description'],
            destination=trip_data['destination'],
            start_date=trip_data['start_date'],
            end_date=trip_data['end_date'],
            user=user,
            activities=activities,
            budget_items=budget_items,
            total_budget=trip_data['total_budget'],
            status=trip_data['status'],
            shared_link=f"trip-{len(created_trips) + 1}"
        )
        trip.save()
        created_trips.append(trip)
        print(f"Created trip: {trip.title} for {user.name}")
    
    return created_trips


def main():
    """Main function to populate the database"""
    print("Starting database population...")
    
    try:
        # Create sample data
        users = create_sample_users()
        destinations, cities = create_sample_destinations()
        trips = create_sample_trips(users)
        
        print("\n" + "="*50)
        print("DATABASE POPULATION COMPLETE!")
        print(f"Created {len(users)} users")
        print(f"Created {len(destinations)} destinations")
        print(f"Created {len(cities)} cities")
        print(f"Created {len(trips)} trips")
        print("="*50)
        
        # Print sample login credentials
        print("\nSample Login Credentials:")
        print("Email: john@example.com, Password: password123")
        print("Email: jane@example.com, Password: password123")
        print("Email: admin@example.com, Password: admin123 (Admin)")
        
    except Exception as e:
        print(f"Error populating database: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
