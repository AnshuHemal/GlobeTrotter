from django.core.management.base import BaseCommand
from destinations.models import Destination


class Command(BaseCommand):
    help = 'Fix destination images for Paris and Santorini'
    
    def handle(self, *args, **options):
        # Update Paris image
        try:
            paris = Destination.objects.get(name='Paris')
            paris.image_url = 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
            paris.save()
            self.stdout.write(self.style.SUCCESS('Updated Paris image'))
        except Destination.DoesNotExist:
            self.stdout.write(self.style.WARNING('Paris destination not found'))
        
        # Update Santorini image
        try:
            santorini = Destination.objects.get(name='Santorini')
            santorini.image_url = 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
            santorini.save()
            self.stdout.write(self.style.SUCCESS('Updated Santorini image'))
        except Destination.DoesNotExist:
            self.stdout.write(self.style.WARNING('Santorini destination not found'))
        
        self.stdout.write(self.style.SUCCESS('Image update completed'))
