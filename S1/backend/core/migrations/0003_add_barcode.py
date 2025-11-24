"""Agregar campo codigo_barras a Producto

Generada manualmente.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_producto_marca_producto_modelo'),
    ]

    operations = [
        migrations.AddField(
            model_name='producto',
            name='codigo_barras',
            field=models.CharField(max_length=64, null=True, unique=True, verbose_name='Código de barras', blank=True),
        ),
    ]
