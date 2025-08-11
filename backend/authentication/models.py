from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField, ReferenceField
from datetime import datetime, timedelta
import bcrypt
import secrets
from django.conf import settings
import uuid


class User(Document):
    """User model for MongoDB using MongoEngine"""
    
    name = StringField(required=True, max_length=100)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    is_active = BooleanField(default=False)  # Changed to False, will be True after email verification
    is_verified = BooleanField(default=False)  # New field to track email verification
    is_admin = BooleanField(default=False)
    verification_token = StringField()  # Store verification token
    verification_token_expires = DateTimeField()  # Token expiration time
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'users',
        'indexes': ['email']
    }
    
    def set_password(self, password):
        """Hash and set the user's password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """Check if the provided password matches the user's password"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    @property
    def is_authenticated(self):
        """Always return True. This is a way to tell if the user has been authenticated in templates."""
        return True
    
    @property
    def is_anonymous(self):
        """Always return False. This is a way to tell if the user has not been authenticated in templates."""
        return False
    
    def save(self, *args, **kwargs):
        """Override save to update the updated_at field"""
        self.updated_at = datetime.utcnow()
        # If this is a new user, generate a verification token
        if not self.id and not self.verification_token:
            self.generate_verification_token()
        return super().save(*args, **kwargs)
    
    def generate_verification_token(self):
        """Generate a verification token for email confirmation"""
        self.verification_token = str(uuid.uuid4())
        self.verification_token_expires = datetime.utcnow() + timedelta(hours=24)  # Token valid for 24 hours
        self.save()
        return self.verification_token
        
    def verify_email(self, token):
        """Verify user's email using the provided token"""
        if not self.verification_token or self.verification_token != token:
            return False
            
        if datetime.utcnow() > self.verification_token_expires:
            return False
            
        self.is_verified = True
        self.is_active = True
        self.verification_token = None
        self.verification_token_expires = None
        self.save()
        return True
        
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
