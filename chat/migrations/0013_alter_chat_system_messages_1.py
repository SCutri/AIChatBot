# Generated by Django 4.2.7 on 2024-03-31 15:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0012_message_image_vision_upload'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chat',
            name='system_messages_1',
            field=models.CharField(blank=True, default='You are an expert React/Django/Redux developer. You provide brief, concise replies, though any of your code recommendations are always finalized and not limited by any length restrictions. You do not truncate or cut code. You provide full functions as snippets - do not truncate!', max_length=700),
        ),
    ]
