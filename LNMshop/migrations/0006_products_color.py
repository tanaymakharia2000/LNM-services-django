# Generated by Django 3.2.4 on 2021-07-10 19:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('LNMshop', '0005_products_contact_num'),
    ]

    operations = [
        migrations.AddField(
            model_name='products',
            name='color',
            field=models.CharField(default='#007bff', max_length=20),
        ),
    ]