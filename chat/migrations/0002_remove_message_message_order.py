# Generated by Django 4.2.7 on 2023-11-14 16:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='message',
            name='message_order',
        ),
    ]
