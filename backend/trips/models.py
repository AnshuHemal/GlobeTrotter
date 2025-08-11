from mongoengine import Document, StringField, DateTimeField, ListField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField, FloatField, IntField, BooleanField
from datetime import datetime
from authentication.models import User


class Activity(EmbeddedDocument):
    """Embedded document for trip activities"""
    name = StringField(required=True, max_length=200)
    description = StringField(max_length=1000)
    location = StringField(max_length=200)
    category = StringField(max_length=100)  # e.g., 'sightseeing', 'food', 'adventure'
    estimated_cost = FloatField(default=0.0)
    estimated_duration = IntField(default=60)  # in minutes
    date = DateTimeField()
    time = StringField(max_length=10)  # e.g., "09:00"
    is_completed = BooleanField(default=False)
    notes = StringField(max_length=500)


class BudgetItem(EmbeddedDocument):
    """Embedded document for budget tracking"""
    category = StringField(required=True, max_length=100)  # e.g., 'accommodation', 'food', 'transport'
    planned_amount = FloatField(default=0.0)
    actual_amount = FloatField(default=0.0)
    description = StringField(max_length=200)


class Trip(Document):
    """Trip model for MongoDB"""
    
    title = StringField(required=True, max_length=200)
    description = StringField(max_length=1000)
    destination = StringField(required=True, max_length=200)
    start_date = DateTimeField(required=True)
    end_date = DateTimeField(required=True)
    
    # User reference
    user = ReferenceField(User, required=True)
    
    # Trip details
    activities = ListField(EmbeddedDocumentField(Activity))
    budget_items = ListField(EmbeddedDocumentField(BudgetItem))
    total_budget = FloatField(default=0.0)
    
    # Trip status
    status = StringField(max_length=50, default='planning')  # 'planning', 'active', 'completed', 'cancelled'
    is_public = BooleanField(default=False)
    shared_link = StringField(max_length=100, unique=True, sparse=True)
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'trips',
        'indexes': ['user', 'destination', 'start_date', 'status']
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
            'description': self.description,
            'destination': self.destination,
            'startDate': self.start_date.isoformat() if self.start_date else None,  # Frontend expects 'startDate'
            'endDate': self.end_date.isoformat() if self.end_date else None,        # Frontend expects 'endDate'
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'user_id': str(self.user.id) if self.user else None,
            'activities': [
                {
                    'name': activity.name,
                    'description': activity.description,
                    'location': activity.location,
                    'category': activity.category,
                    'estimated_cost': activity.estimated_cost,
                    'estimated_duration': activity.estimated_duration,
                    'date': activity.date.isoformat() if activity.date else None,
                    'time': activity.time,
                    'is_completed': activity.is_completed,
                    'notes': activity.notes
                } for activity in self.activities
            ],
            'budget_items': [
                {
                    'category': item.category,
                    'planned_amount': item.planned_amount,
                    'actual_amount': item.actual_amount,
                    'description': item.description
                } for item in self.budget_items
            ],
            'total_budget': self.total_budget,
            'status': self.status,
            'is_public': self.is_public,
            'shared_link': self.shared_link,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
