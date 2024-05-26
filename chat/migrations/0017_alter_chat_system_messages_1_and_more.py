# Generated by Django 4.2.7 on 2024-04-10 21:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0016_alter_chat_temperature_alter_chat_top_p'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chat',
            name='system_messages_1',
            field=models.CharField(blank=True, default="Be logical and precise - really try to consider your replies and recommendations, and ensure they match up well with the user's message and the chat history supplied to you, as well as the user's goals. When recommending code, try to narrow down potential mistakes and fix. The user prefers finalized, untruncated code.", max_length=700),
        ),
        migrations.AlterField(
            model_name='chat',
            name='system_messages_2',
            field=models.CharField(blank=True, default='', max_length=700),
        ),
    ]
