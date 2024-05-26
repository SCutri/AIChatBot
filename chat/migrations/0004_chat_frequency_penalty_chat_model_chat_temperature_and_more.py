# Generated by Django 4.2.7 on 2023-11-17 09:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_chat_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='chat',
            name='frequency_penalty',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='chat',
            name='model',
            field=models.CharField(default='gpt-4', max_length=255),
        ),
        migrations.AddField(
            model_name='chat',
            name='temperature',
            field=models.FloatField(default=0.85),
        ),
        migrations.AddField(
            model_name='chat',
            name='token_limit',
            field=models.IntegerField(default=7250),
        ),
        migrations.AddField(
            model_name='chat',
            name='top_p',
            field=models.FloatField(default=0.3),
        ),
    ]
