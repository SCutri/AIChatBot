# tasks.py

from django.conf import settings
from celery import shared_task
from django.core.files.uploadedfile import InMemoryUploadedFile
from .models import Chat, Message
from .generate_image import generate_image
from .services import save_image_from_url
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import anthropic
import openai
import base64, io, time
import tiktoken

# Provides JSON request context for: system messages + alternating user/assistant chat history
def process_messages(chat, messages_without_user_message):
    system_messages = [msg for msg in [
        chat.system_messages_1,
        chat.system_messages_2,
        chat.system_messages_3,
        chat.system_messages_4,
        chat.system_messages_5,
    ] if msg]

    system_prompt = "\n".join(system_messages).rstrip()
    system_prompt += f'\nHere is what the user would like you to know about their situation:\n\n{chat.project_info}'.rstrip()
    system_prompt += f'\nGovern your replies per the following key instructions: \n\n{chat.response_info}'.rstrip()

    chat_history_messages = [{'role': 'user' if msg.is_user else 'assistant', 'content': msg.content} for msg in messages_without_user_message]

    return system_prompt, chat_history_messages

# Handles truncation of chat history if process_message returns contain token amount which exceeds token limit set on frontend *** does NOT INCLUDE user message ***
def handle_token_counting_and_limit(system_prompt, chat_history_messages, user_message, token_limit, encoding):
    def count_tokens(message):
        if isinstance(message['content'], str):
            return len(encoding.encode(message['content'])) + 4
        else:
            # this is a list
            return sum(len(encoding.encode(str(i))) + 4 for i in message['content'])

    message_list = [{'role': 'system', 'content': system_prompt}] + chat_history_messages + [user_message]

    total_tokens = sum(count_tokens(message) for message in message_list)
    print(f"Initial total input tokens: {total_tokens}")

    while total_tokens > token_limit and len(chat_history_messages) > 1:
        # Remove the earliest pair of user/assistant messages
        print(f"\n\nTotal tokens ({total_tokens}) is greater than the token limit ({token_limit}). Cutting messages:\n{chat_history_messages[0:2]}")
        chat_history_messages = chat_history_messages[2:]
        message_list = [{'role': 'system', 'content': system_prompt}] + chat_history_messages + [user_message]
        
        total_tokens = sum(count_tokens(message) for message in message_list)
        print(f"\n\nUpdated total input tokens: {total_tokens}\n\n")

    return message_list

@shared_task(bind=True)
def chat_task(self, chat_id, content, temp_id=None, create_new_message=True):
    chat = Chat.objects.get(id=chat_id)

    # Set the task_id in the Chat model
    chat.task_id = self.request.id
    chat.save()

    if "gpt" in chat.model or "dall-e" in chat.model:
        # OpenAI task
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        messages = Message.objects.filter(chat=chat).order_by('timestamp')

        if temp_id is None:
            temp_id = int(time.time() * 1000)

        print(f"chat_task started with temp_id after if temp_id is None: {temp_id}")

        # Save the user's message to the database
        if create_new_message:
            user_message_obj = Message.objects.create(chat=chat, content=content, is_user=True)
        else:
            user_message_obj = Message.objects.filter(chat=chat, is_user=True).last()

        # Create a queryset of messages that doesn't include the user's message
        messages_without_user_message = messages.exclude(id=user_message_obj.id)

        # Define the model for tiktoken encoding
        model = chat.model  # Assuming this is dynamically set in your Chat model
        print(f"model = {model}")

        # Initialize tiktoken encoding
        try:
            encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            print("Warning: model not found. Using cl100k_base encoding.")
            encoding = tiktoken.get_encoding("cl100k_base")

        system_prompt, chat_history_messages = process_messages(chat, messages_without_user_message)
        # Check if content is a dictionary, if so it means it contains an image
        if isinstance(content, dict) and 'image' in content:
            print(f"Content in task: {content}")
            user_message = {
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': content['message']},
                    {
                        'type': 'image_url',
                        'image_url': {
                            'url': f"data:image/jpeg;base64,{content['image']}"
                        }
                    }
                ]
            }
        else:
            user_message = {'role': 'user', 'content': content}

        final_messages = handle_token_counting_and_limit(system_prompt, chat_history_messages, user_message, chat.token_limit, encoding)

        # Set the final messages as the context
        context = final_messages

        print(f"\n\nFinal context: {context}")

        if chat.model in ["dall-e-3", "dall-e-2"]:
            # Generate the image
            image_url = generate_image(content)  # Call the generate_image function

            # Create a new message for the bot's image response
            bot_message = Message.objects.create(
                chat=chat,
                content='',  # No text content for the image message
                is_user=False,  # Indicate that this is a bot message
            )

            # Use the existing function to save the image URL to the bot message
            save_image_from_url(bot_message, image_url)
            bot_message.save(update_fields=['image'])

            # Ensure the image URL is not None before sending
            if bot_message.image and hasattr(bot_message.image, 'url'):
                full_image_url = 'http://localhost:8083' + bot_message.image.url
            else:
                full_image_url = None

            # Send a WebSocket message with the full image URL if it exists
            channel_layer = get_channel_layer()
            group_name = f'chat_{chat_id}'
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'chat_message',
                    'message': '',
                    'image_url': full_image_url,  # Use 'image_url' instead of 'image'
                    'message_id': bot_message.id,
                    'temp_id': temp_id,
                    'is_complete': True,
                }
            )
        else:
            print("OpenAI server response request initiated... ")
            response = client.chat.completions.create(
                model=chat.model,
                messages=context,
                temperature=chat.temperature,
                top_p=chat.top_p,
                frequency_penalty=chat.frequency_penalty,
                stream=True
            )

            # Print the total token count of the request sent to OpenAI server
            total_request_tokens = sum([len(encoding.encode(str(message['content']))) + 4 for message in context])
            print(f"Total request tokens sent to OpenAI server: {total_request_tokens}")

            channel_layer = get_channel_layer()
            group_name = f'chat_{chat_id}'
            response_text = ""
            total_response_tokens = 0

            for chunk in response:
                # Check for task revocation
                chat_session = Chat.objects.get(id=chat_id)
                if chat_session.task_revoked:
                    print("Revocation request received. Terminating task.")
                    break
                
                if isinstance(chunk, openai.types.chat.chat_completion_chunk.ChatCompletionChunk):
                    content = chunk.choices[0].delta.content if chunk.choices[0].delta.content else ''
                    response_text += content

                    # Count the tokens in the response chunk
                    response_chunk_tokens = len(encoding.encode(content))
                    total_response_tokens += response_chunk_tokens

                    # Send each chunk as a WebSocket message
                    async_to_sync(channel_layer.group_send)(
                        group_name,
                        {
                            'type': 'chat_message',
                            'message': content,
                            'message_id': user_message_obj.id,  # Include the message ID
                            'temp_id': temp_id,  # Include the temp_id
                            'is_complete': False,  # Add is_complete field
                        }
                    )
                else:
                    print(f"Unhandled chunk type: {type(chunk)}")

            # Print the total tokens used return from OpenAI server
            print(f"Total tokens used return from OpenAI server: {total_response_tokens}")

            # Check if the task was revoked
            if chat_session.task_revoked:
                # Reset the task_revoked flag
                chat_session.task_revoked = False
                chat_session.save()
                return  # Exit the function

            # Saving the entire response as a single message after all chunks are received
            bot_message = Message.objects.create(chat=chat, content=response_text, is_user=False)

            # Send a final WebSocket message to indicate that the bot's response is complete
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'chat_message',
                    'message': '',
                    'message_id': bot_message.id,  # Include the message ID
                    'temp_id': temp_id,  # Include the temp_id
                    'is_complete': True,  # Indicate that the bot's response is complete
                }
            ) 
    #Anthropic task
    else:
        # Anthropic task
        messages = Message.objects.filter(chat=chat).order_by('timestamp')
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

        if temp_id is None:
            temp_id = int(time.time() * 1000)

        if create_new_message:
            if isinstance(content, dict) and 'image' in content:
                image_data = content['image']
                message = content.get('message', '')
                media_type = content.get('media_type', 'image/jpeg')
                image_bytes = base64.b64decode(image_data)
                image_file = io.BytesIO(image_bytes)
                image_name = f"image_{temp_id}.{media_type.split('/')[1]}"
                django_file = InMemoryUploadedFile(
                    image_file,
                    None,
                    image_name,
                    media_type,
                    image_file.getbuffer().nbytes,
                    None
                )
                user_message_obj = Message.objects.create(chat=chat, is_user=True, image_vision_upload=django_file, content=message)
            else:
                user_message_obj = Message.objects.create(chat=chat, content=content, is_user=True)
        else:
            user_message_obj = Message.objects.filter(chat=chat, is_user=True).last()

        messages_without_user_message = Message.objects.filter(chat=chat).exclude(id=user_message_obj.id).order_by('timestamp')

        system_prompt, chat_history_messages = process_messages(chat, messages_without_user_message)

        user_message_content = []
        if isinstance(content, dict) and 'image' in content:
            image_data = content['image']
            message = content.get('message', '')
            media_type = content.get('media_type', 'image/jpeg')
            user_message_content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": image_data,
                }
            })
            if message:
                user_message_content.append({"type": "text", "text": message})
        else:
            user_message_content.append({"type": "text", "text": str(content)})

        user_message = {'role': 'user', 'content': user_message_content}

        final_messages = chat_history_messages + [user_message]
        print(f"\n\nFinal system messages: {system_prompt}")
        print(f"\n\nFinal context: {final_messages}")

        with client.messages.stream(
            model=chat.model,
            max_tokens=3024,
            system=system_prompt,
            messages=final_messages
        ) as stream:
            channel_layer = get_channel_layer()
            group_name = f'chat_{chat_id}'
            response_text = ""

            for event in stream:
                # Check for task revocation
                chat_session = Chat.objects.get(id=chat_id)
                if chat_session.task_revoked:
                    print("Revocation request received. Terminating Anthropic task.")
                    break

                if event.type == 'message_start':
                    continue
                elif event.type == 'content_block_delta':
                    text = event.delta.text
                    response_text += text
                    async_to_sync(channel_layer.group_send)(
                        group_name,
                        {
                            'type': 'chat_message',
                            'message': text,
                            'message_id': user_message_obj.id,
                            'temp_id': temp_id,
                            'is_complete': False,
                        }
                    )
                elif event.type == 'message_stop':
                    break

            # Check if the task was revoked
            if chat_session.task_revoked:
                # Reset the task_revoked flag
                chat_session.task_revoked = False
                chat_session.save()
                return  # Exit the function

            bot_message = Message.objects.create(chat=chat, content=response_text, is_user=False)

            image_url = None
            if bot_message.image:
                image_url = 'http://localhost:8083' + bot_message.image.url

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'chat_message',
                    'message': '',
                    'message_id': bot_message.id,
                    'temp_id': temp_id,
                    'is_complete': True,
                    'image_url': image_url,
                }
            )