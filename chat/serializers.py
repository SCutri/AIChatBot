# chat/serializers.py
from rest_framework import serializers
from .models import Chat, Message

class MessageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'chat', 'content', 'is_user', 'timestamp', 'image', 'image_vision_upload']

    def get_image(self, obj):
        if obj.image_vision_upload:
            return self.context['request'].build_absolute_uri(obj.image_vision_upload.url)
        return None

class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    system_messages_1 = serializers.CharField(allow_blank=True, required=False)
    system_messages_2 = serializers.CharField(allow_blank=True, required=False)
    system_messages_3 = serializers.CharField(allow_blank=True, required=False)
    system_messages_4 = serializers.CharField(allow_blank=True, required=False)
    system_messages_5 = serializers.CharField(allow_blank=True, required=False)
    image_vision_upload = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'name', 'project_info', 'response_info', 'messages', 'model', 'token_limit', 'temperature', 'top_p', 'frequency_penalty', 'system_messages_1', 'system_messages_2', 'system_messages_3', 'system_messages_4', 'system_messages_5', 'image_vision_upload']

    def get_image_vision_upload(self, obj):
        message = obj.messages.order_by('-timestamp').first()
        if message and message.image_vision_upload:
            return 'http://localhost:8083' + message.image_vision_upload.url
        return None