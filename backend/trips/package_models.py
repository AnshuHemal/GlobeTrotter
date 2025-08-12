from mongoengine import Document, StringField, FloatField, IntField, ListField, DictField


class TravelPackage(Document):
    """Travel package model for MongoDB"""
    
    title = StringField(required=True, max_length=200)
    subtitle = StringField(max_length=300)
    duration = StringField(max_length=100)  # e.g., '7 Days 6 Nights'
    description = StringField(max_length=1000)
    current_price = FloatField(required=True)
    old_price = FloatField(required=True)
    save_amount = FloatField(required=True)
    image_url = StringField(required=True, max_length=500)
    rating = FloatField(default=0.0)
    category = StringField(max_length=100)  # e.g., 'Adventure', 'Cultural', 'Beach'
    itinerary = ListField(DictField(), default=[])
    
    meta = {
        'collection': 'travel_packages',
        'indexes': ['category', 'title']
    }
    
    def to_dict(self):
        """Convert package to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'title': self.title,
            'subtitle': self.subtitle,
            'duration': self.duration,
            'description': self.description,
            'current_price': float(self.current_price) if self.current_price is not None else 0.0,
            'old_price': float(self.old_price) if self.old_price is not None else 0.0,
            'save_amount': float(self.save_amount) if self.save_amount is not None else 0.0,
            'image_url': self.image_url,
            'rating': float(self.rating) if self.rating is not None else 0.0,
            'category': self.category,
            'itinerary': self.itinerary or [],
            # Add aliases for frontend compatibility
            'currentPrice': float(self.current_price) if self.current_price is not None else 0.0,
            'originalPrice': float(self.old_price) if self.old_price is not None else 0.0,
            'savings': float(self.save_amount) if self.save_amount is not None else 0.0,
            'image': self.image_url
        }
