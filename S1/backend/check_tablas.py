#!/usr/bin/env python
"""Lista las tablas existentes en la base de datos usada por Django."""
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
try:
    import django
    django.setup()
except Exception as e:
    print('Error al inicializar Django:', e)
    sys.exit(1)

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]

print('Tablas detectadas (parcial):')
for t in tables:
    print('-', t)

print('\n¿Existe core_device?', 'core_device' in tables)
