from mongoengine import Document, StringField, FloatField, ListField, IntField, DateTimeField
from datetime import datetime


class Destination(Document):
    """Destination model for popular travel destinations"""
    
    name = StringField(required=True, max_length=200)
    country = StringField(required=True, max_length=100)
    description = StringField(max_length=1000)
    
    # Location details
    latitude = FloatField()
    longitude = FloatField()
    
    # Destination info
    category = StringField(max_length=100)  # e.g., 'city', 'beach', 'mountain', 'historical'
    best_time_to_visit = StringField(max_length=200)
    average_cost_per_day = FloatField(default=0.0)
    
    # Popular activities
    popular_activities = ListField(StringField(max_length=200))
    
    # Image
    image_url = StringField(max_length=500)
    
    # Statistics
    popularity_score = IntField(default=0)
    visit_count = IntField(default=0)
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'destinations',
        'indexes': ['name', 'country', 'category', 'popularity_score']
    }
    
    def save(self, *args, **kwargs):
        """Override save to update the updated_at field"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert destination to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'name': self.name,
            'country': self.country,
            'description': self.description,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'category': self.category,
            'best_time_to_visit': self.best_time_to_visit,
            'average_cost_per_day': self.average_cost_per_day,
            'popular_activities': self.popular_activities,
            'image_url': self.image_url,
            'popularity_score': self.popularity_score,
            'visit_count': self.visit_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class City(Document):
    """City model for city search functionality"""
    
    name = StringField(required=True, max_length=200)
    country = StringField(required=True, max_length=100)
    state_province = StringField(max_length=100)
    
    # Location
    latitude = FloatField()
    longitude = FloatField()
    
    # City info
    population = IntField()
    timezone = StringField(max_length=50)
    currency = StringField(max_length=10)
    
    # Travel info
    attractions = ListField(StringField(max_length=200))
    average_temperature = FloatField()  # in Celsius
    image_url = StringField(max_length=500, default='')  # URL for city image
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'cities',
        'indexes': ['name', 'country']
    }
    
    def to_dict(self):
        """Convert city to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'name': self.name,
            'country': self.country,
            'state_province': self.state_province,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'population': self.population,
            'timezone': self.timezone,
            'currency': self.currency,
            'attractions': self.attractions,
            'average_temperature': self.average_temperature,
            'created_at': self.created_at.isoformat()
        }
