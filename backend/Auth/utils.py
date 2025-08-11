import os
from django.core.exceptions import ValidationError

def validate_image_file(file):
    """
    Validate uploaded image file
    """
    # Check file size (max 5MB)
    if file.size > 5 * 1024 * 1024:
        raise ValidationError("Image file size must be less than 5MB.")
    
    # Check file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if file.content_type not in allowed_types:
        raise ValidationError("Only JPG, PNG, and GIF files are allowed.")
    
    # Check file extension
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    file_extension = os.path.splitext(file.name)[1].lower()
    if file_extension not in allowed_extensions:
        raise ValidationError("Invalid file extension. Only JPG, PNG, and GIF files are allowed.")
    
    return True

def get_file_extension(filename):
    """
    Get file extension from filename
    """
    return os.path.splitext(filename)[1].lower()

def format_file_size(size_in_bytes):
    """
    Format file size in human readable format
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.1f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.1f} TB"
