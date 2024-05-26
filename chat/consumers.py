# chat/consumers.py

from ChatGPTClone.celery import app as celery_app

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Chat
from .tasks import chat_task
from asgiref.sync import sync_to_async
from celery.app.control import Control

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.chat_group_name = f'chat_{self.chat_id}'

        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.chat_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(f"Received the following data from the frontend: {text_data_json}")

        if 'type' in text_data_json and text_data_json['type'] == 'terminate':
            # Retrieve the task ID from the ChatSession model and revoke the task
            chat_session = await sync_to_async(Chat.objects.get)(id=self.chat_id)
            task_id = chat_session.task_id
            print(f"Task ID retrieved from the chat session: {task_id}")
            if task_id:
                print("Sending revocation request for task ID: ", task_id)
                control = Control(celery_app)
                control.revoke(task_id, terminate=True)
                print(f"Revocation command sent for task ID: {task_id}")

                # Set a flag in the database to indicate that the task has been revoked
                chat_session.task_revoked = True
                await sync_to_async(chat_session.save)()
        else:
            temp_id = text_data_json['temp_id']
            message = text_data_json.get('message', '')
            image_base64 = text_data_json.get('image_base64', None)

            if image_base64:
                content = {
                    'image': image_base64,
                    'message': message
                }
            else:
                content = message

            chat_task.delay(self.chat_id, content, temp_id)

    async def chat_message(self, event):
        message = event['message']
        message_id = event['message_id']
        temp_id = event['temp_id']
        is_complete = event['is_complete']
        image_url = event.get('image_url', None)

        websocket_message = {
            'message': message,
            'message_id': message_id,
            'temp_id': temp_id,
            'is_complete': is_complete,
        }

        if image_url:
            websocket_message['image_url'] = image_url

        await self.send(text_data=json.dumps(websocket_message))