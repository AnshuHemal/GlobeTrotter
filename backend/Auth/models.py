from django.utils import timezone
from mongoengine import (
    Document,
    StringField,
    EmailField,
    BooleanField,
    DateTimeField,
    DictField,
    ReferenceField,
    ListField,
    IntField,
    DecimalField,
    BinaryField,
    MapField,
    EmbeddedDocument,
    EmbeddedDocumentField,
    fields
)

class User(Document):
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    name = StringField(required=True)
    phone = StringField() 
    phoneVerified = BooleanField(default=False)
    isverified = BooleanField(default=False)
    lastLogin = DateTimeField(default=timezone.now)
    role = StringField(required=True)
    onlineStatus = StringField(choices=["online", "offline"], default="offline")
    lastSeen = DateTimeField(default=timezone.now)

    meta = {"collection": "users", "strict": False}