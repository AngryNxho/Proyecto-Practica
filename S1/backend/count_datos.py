#!/usr/bin/env python
import os
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
try:
    import django
    django.setup()
except Exception as e:
    print('Error al inicializar Django:', e)
    sys.exit(1)

from core.models import Producto, Movimiento, Alerta

print('Conteos actuales:')
print('Productos:', Producto.objects.count())
print('Movimientos:', Movimiento.objects.count())
print('Alertas:', Alerta.objects.count())
