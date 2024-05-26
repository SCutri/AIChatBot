# chat/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('chat/<int:chat_id>/', views.chat, name='chat'),
    path('chat/', views.chat_history, name='chat_history'),
    path('chat/<int:chat_id>/update_name/', views.chat_history, name='update_name'),
    path('chat/<int:chat_id>/edit/<int:message_id>/', views.edit_message),
    path('chat/<int:chat_id>/send/', views.send_message),
    path('chat/<int:chat_id>/delete/', views.delete_chat, name='delete_chat'),
    path('chat/<int:chat_id>/update_info/', views.update_custom_instructions),
    path('chat/<int:chat_id>/update_parameters/', views.update_chat_parameters),
    path('chat/<int:chat_id>/update_system_messages/', views.update_system_messages),
    path('chat/<int:chat_id>/upload_image/', views.upload_image, name='upload_image'),
]