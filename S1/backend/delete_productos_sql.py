#!/usr/bin/env python
"""Eliminar directamente filas de la tabla core_producto usando SQL (fallback)."""
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
try:
    import django
    django.setup()
except Exception as e:
    print('Error al inicializar Django:', e)
    sys.exit(1)

from django.db import connection, DatabaseError

try:
    with connection.cursor() as cursor:
        print('Ejecutando: DELETE FROM core_producto;')
        cursor.execute('DELETE FROM core_producto;')
    print('Borrado directo de core_producto ejecutado.')
except DatabaseError as e:
    print('Error al ejecutar SQL directo:', e)
    sys.exit(1)
