# chat/views.py
from django.core.files.base import ContentFile
from django.http import Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Chat, Message
from .serializers import ChatSerializer
from .tasks import chat_task
import base64, json, logging, uuid

logger = logging.getLogger(__name__)


@api_view(['GET'])
@csrf_exempt
def chat(request, chat_id):
    chat = Chat.objects.get(id=chat_id)
    serializer = ChatSerializer(chat)
    return Response(serializer.data)

@api_view(['DELETE'])
@csrf_exempt
def delete_chat(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Chat.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST', 'PUT'])
@csrf_exempt
def chat_history(request, chat_id=None):
    if request.method == 'GET':
        chats = Chat.objects.all()
        serializer = ChatSerializer(chats, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ChatSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    elif request.method == 'PUT':
        chat = Chat.objects.get(id=chat_id)
        serializer = ChatSerializer(chat, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

OPENAI_MODELS = [
    'gpt-4',
    'gpt-4-1106-preview',
    'gpt-4-0125-preview',
    ]

@api_view(['POST'])
@csrf_exempt
def upload_image(request, chat_id):
    if 'image' in request.FILES:
        image_file = request.FILES['image']
        image_path = default_storage.save(f'chats/{chat_id}/vision_images/{image_file.name}', image_file)
        image_url = default_storage.url(image_path)
        return JsonResponse({"image_url": image_url})
    return JsonResponse({"error": "No image provided"}, status=400)

@api_view(['POST'])
@csrf_exempt
def send_message(request, chat_id):
    chat = Chat.objects.get(id=chat_id)
    payload = json.loads(request.body)
    message_text = payload.get('message', '')
    print(f"Message text: {message_text}")
    temp_id = payload.get('temp_id')

    message = Message(chat=chat, content=message_text, is_user=True)
    message.save()

    content = {
        'message': message_text,
        'temp_id': temp_id,
    }

    chat_task.delay(chat_id, content)

    return JsonResponse({"status": "success"})

@api_view(['PUT'])
@csrf_exempt
def edit_message(request, chat_id, message_id):
    print("Edit message function hit")
    if request.method == 'PUT':
        print('Request data:', request.data)
        chat = Chat.objects.get(id=chat_id)
        print(f"chat.model: {chat.model}")
        message = Message.objects.get(id=message_id)
        print('Message before edit:', message.__dict__)

        if message.is_user:
            if 'content' in request.data:
                message.content = request.data['content']
            
            message.save()

            # Delete all messages after the edited message
            Message.objects.filter(chat=chat, timestamp__gt=message.timestamp).delete()

            # Call the chat_task with create_new_message=False
            chat_task.delay(chat_id, message.content, message.id, create_new_message=False)

            return JsonResponse({"status": "success"})
        else:
            return JsonResponse({"status": "error", "message": "Cannot edit bot messages"})
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method"})

@api_view(['PUT'])
@csrf_exempt
def update_custom_instructions(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
    except Chat.DoesNotExist:
        raise Http404

    if request.method == 'PUT':
        serializer = ChatSerializer(chat, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['PUT'])
@csrf_exempt
def update_chat_parameters(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
    except Chat.DoesNotExist:
        raise Http404

    if request.method == 'PUT':
        serializer = ChatSerializer(chat, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
@api_view(['PUT'])
@csrf_exempt
def update_system_messages(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
    except Chat.DoesNotExist:
        raise Http404

    if request.method == 'PUT':
        serializer = ChatSerializer(chat, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)