from mongoengine import Document, StringField, FloatField, IntField, ReferenceField, DateTimeField
from datetime import datetime
from authentication.models import User


class UserTrip(Document):
    """User trip model for MongoDB - for trips booked/created by users"""
    
    user = ReferenceField(User, required=True)
    title = StringField(required=True, max_length=200)
    location = StringField(required=True, max_length=200)
    stay = StringField(max_length=100)  # e.g., '7 Days 6 Nights'
    price = FloatField(required=True)
    old_price = FloatField(required=True)
    save_amount = FloatField(required=True)
    image_url = StringField(required=True, max_length=500)
    status = StringField(max_length=50, default='upcoming')  # 'upcoming', 'ongoing', 'completed', 'cancelled'
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_trips',
        'indexes': ['user', 'status', 'created_at']
    }
    
    def save(self, *args, **kwargs):
        """Override save to update the updated_at field"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def to_dict(self):
        """Convert trip to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'name': self.title,  # Frontend expects 'name' field
            'title': self.title,
            'destination': self.location,  # Frontend expects 'destination' field
            'location': self.location,
            'stay': self.stay,
            'price': self.price,
            'oldPrice': self.old_price,
            'saveAmount': self.save_amount,
            'coverImage': self.image_url,  # Frontend expects 'coverImage' field
            'imageUrl': self.image_url,
            'status': self.status,
            'budget': self.price,  # For compatibility with existing frontend
            'startDate': self.created_at.isoformat(),  # For compatibility
            'endDate': self.created_at.isoformat(),    # For compatibility
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
