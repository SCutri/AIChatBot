# Generated by Django 4.2.7 on 2024-04-10 21:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0018_alter_chat_model'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chat',
            name='token_limit',
            field=models.IntegerField(default=10000),
        ),
    ]
