from mongoengine import Document, StringField, FloatField, IntField


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
            'currentPrice': self.current_price,
            'originalPrice': self.old_price,
            'savings': self.save_amount,
            'image': self.image_url,
            'rating': self.rating,
            'category': self.category
        }
