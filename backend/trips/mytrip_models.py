from datetime import datetime
from mongoengine import Document, StringField, DateTimeField

class MyTrip(Document):
    trip_id = StringField(required=True)
    title = StringField(required=True)
    image_url = StringField()
    start_date = DateTimeField(required=True)
    end_date = DateTimeField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'mytrips',
        'indexes': ['trip_id', '-created_at']
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'trip_id': self.trip_id,
            'title': self.title,
            'image_url': self.image_url,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
