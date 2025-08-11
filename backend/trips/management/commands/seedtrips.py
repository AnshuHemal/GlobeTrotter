from django.core.management.base import BaseCommand
from django.conf import settings
from pymongo import MongoClient
from bson import ObjectId
import random
from datetime import datetime

class Command(BaseCommand):
    help = 'Seed user trips in MongoDB'
    
    def handle(self, *args, **options):
        # MongoDB connection using Django settings
        mongo_settings = settings.MONGODB_SETTINGS
        client = MongoClient(mongo_settings['host'])
        db = client[mongo_settings['db']]
        
        # Collections
        users_collection = db['users']
        trips_collection = db['user_trips']
        
        # Dummy trip data
        dummy_trips = [
            {
                'title': 'Thailand Full Moon Party',
                'location': 'Phuket, Krabi & Ko Samui',
                'stay': '7 Days 6 Nights',
                'price': 42850,
                'oldPrice': 47050,
                'saveAmount': 5000,
                'imageUrl': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'status': 'upcoming'
            },
            {
                'title': 'Vietnam Group Trip',
                'location': 'Ho Chi Minh, Da Nang, Hoi An, Hanoi',
                'stay': '8 Days 7 Nights',
                'price': 45850,
                'oldPrice': 50850,
                'saveAmount': 5000,
                'imageUrl': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'status': 'completed'
            },
            {
                'title': 'Bali Adventure',
                'location': 'Bali with ATV & Gili Island',
                'stay': '6 Days 7 Nights',
                'price': 45900,
                'oldPrice': 52100,
                'saveAmount': 6200,
                'imageUrl': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'status': 'upcoming'
            },
            {
                'title': 'Spiti Valley Road Trip',
                'location': 'Spiti Valley with Chandratal Lake',
                'stay': '11 Days 10 Nights',
                'price': 21950,
                'oldPrice': 23950,
                'saveAmount': 2000,
                'imageUrl': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'status': 'ongoing'
            },
            {
                'title': 'Kerala Backwaters',
                'location': 'Munnar, Thekkady & Alleppey',
                'stay': '5 Days 4 Nights',
                'price': 28500,
                'oldPrice': 32000,
                'saveAmount': 3500,
                'imageUrl': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'status': 'completed'
            },
            {
                'title': 'Rajasthan Royal Tour',
                'location': 'Jaipur, Udaipur & Jodhpur',
                'stay': '9 Days 8 Nights',
                'price': 55000,
                'oldPrice': 62000,
                'saveAmount': 7000,
                'imageUrl': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'status': 'upcoming'
            },
            {
                'title': 'Goa Beach Paradise',
                'location': 'North & South Goa',
                'stay': '4 Days 3 Nights',
                'price': 18500,
                'oldPrice': 22000,
                'saveAmount': 3500,
                'imageUrl': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'status': 'completed'
            },
            {
                'title': 'Himachal Hill Station',
                'location': 'Shimla, Manali & Dharamshala',
                'stay': '6 Days 5 Nights',
                'price': 32000,
                'oldPrice': 38000,
                'saveAmount': 6000,
                'imageUrl': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'status': 'upcoming'
            }
        ]
        
        try:
            # Get existing users
            self.stdout.write('Fetching users...')
            users = list(users_collection.find().limit(10))
            
            if not users:
                self.stdout.write(self.style.ERROR('No users found in the database. Please create some users first.'))
                return
            
            self.stdout.write(f'Found {len(users)} users')
            
            # Check if trips already exist
            existing_trips = trips_collection.count_documents({})
            if existing_trips > 0:
                self.stdout.write(self.style.WARNING(f'{existing_trips} trips already exist. Skipping seed operation.'))
                self.stdout.write('To re-seed, please delete existing trips first.')
                return
            
            # Distribute trips among users
            trips_to_insert = []
            trip_index = 0
            
            for i, user in enumerate(users):
                if trip_index >= len(dummy_trips):
                    break
                    
                trips_per_user = min(3, len(dummy_trips) - trip_index)
                
                for j in range(trips_per_user):
                    if trip_index < len(dummy_trips):
                        trip = {
                            **dummy_trips[trip_index],
                            'userId': user['_id'],
                            'createdAt': datetime.utcnow(),
                            'updatedAt': datetime.utcnow()
                        }
                        trips_to_insert.append(trip)
                        trip_index += 1
            
            # Insert trips
            self.stdout.write(f'Inserting {len(trips_to_insert)} trips...')
            if trips_to_insert:
                result = trips_collection.insert_many(trips_to_insert)
                self.stdout.write(self.style.SUCCESS(f'Successfully inserted {len(result.inserted_ids)} trips'))
                
                # Show distribution
                for user in users:
                    user_trips = [trip for trip in trips_to_insert if str(trip['userId']) == str(user['_id'])]
                    if user_trips:
                        email = user.get('email', user.get('username', str(user['_id'])))
                        self.stdout.write(f'User {email}: {len(user_trips)} trips')
            else:
                self.stdout.write('No trips to insert.')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error seeding trips: {str(e)}'))
        finally:
            client.close()
            self.stdout.write('Database connection closed')
        
        self.stdout.write(self.style.SUCCESS('Seed operation completed'))
        
        return
