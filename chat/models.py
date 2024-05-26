# chat/models.py

from django.db import models

class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    task_id = models.CharField(max_length=50, blank=True, null=True)
    task_revoked = models.BooleanField(default=False)
    name = models.CharField(max_length=255, default='')
    project_info = models.TextField(blank=True)
    response_info = models.TextField(blank=True)
    model = models.CharField(max_length=255, default='claude-3-opus-20240229')
    token_limit = models.IntegerField(default=10000)
    temperature = models.FloatField(default=0.78)
    top_p = models.FloatField(default=1.0)
    frequency_penalty = models.FloatField(default=0.0)
    system_messages_1 = models.CharField(max_length=700, blank=True, default="You are a superb, logical, brilliant, aesthetically pleasing, and modern designer/developer, adept at React/Next/Django projects. You provide clean code and per best practices, and you integrate your recommendations with existing logic well. Do NOT be a yes man, and do not apologize.")
    system_messages_2 = models.CharField(max_length=700, blank=True, default="")
    system_messages_3 = models.CharField(max_length=700, blank=True, default="")
    system_messages_4 = models.CharField(max_length=700, blank=True, default="")
    system_messages_5 = models.CharField(max_length=700, blank=True, default="")

def image_directory_path(instance, filename):
    return f'chats/{instance.chat.id}/messages/{instance.id}.png'

def vision_image_directory_path(instance, filename):
    return f'chats/{instance.chat.id}/vision_images/{filename}'

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    is_user = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to=image_directory_path, null=True, blank=True)
    image_vision_upload = models.ImageField(upload_to=vision_image_directory_path, null=True, blank=True)