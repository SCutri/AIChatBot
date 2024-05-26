import requests
from django.core.files.base import ContentFile
from .models import image_directory_path

def save_image_from_url(message, image_url):
    if not image_url:
        raise ValueError("No image URL provided in services.py")
    
    response = requests.get(image_url, stream=True)
    print(f"Response from services.py: {response}")
    response.raise_for_status()
    
    image_filename = image_directory_path(message, f"{message.id}.png")
    message.image.save(image_filename, ContentFile(response.content), save=False)