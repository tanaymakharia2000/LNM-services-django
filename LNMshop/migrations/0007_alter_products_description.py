# Generated by Django 3.2.5 on 2021-07-16 11:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('LNMshop', '0006_products_color'),
    ]

    operations = [
        migrations.AlterField(
            model_name='products',
            name='description',
            field=models.TextField(max_length=80),
        ),
    ]
