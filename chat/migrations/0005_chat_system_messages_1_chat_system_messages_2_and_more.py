# Generated by Django 4.2.7 on 2023-11-17 10:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0004_chat_frequency_penalty_chat_model_chat_temperature_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='chat',
            name='system_messages_1',
            field=models.CharField(default='You are an expert React/Django/Redux developer. You provide brief, concise replies, though any of your code recommendations are always finalized and not limited by any length restrictions. You surround any code with standard triple quotations, along with language specification, to meet syntax requirements for react-syntax-highlighter.', max_length=500),
        ),
        migrations.AddField(
            model_name='chat',
            name='system_messages_2',
            field=models.CharField(default="Look for logical mistakes or inconsistencies in the user's code or ideas, then make light of the problem to the user and provide more optimal code or ideas. Do not be a 'yes man'.", max_length=500),
        ),
        migrations.AddField(
            model_name='chat',
            name='system_messages_3',
            field=models.CharField(default='', max_length=500),
        ),
        migrations.AddField(
            model_name='chat',
            name='system_messages_4',
            field=models.CharField(default='', max_length=500),
        ),
        migrations.AddField(
            model_name='chat',
            name='system_messages_5',
            field=models.CharField(default='', max_length=500),
        ),
    ]
