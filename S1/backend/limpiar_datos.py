#!/usr/bin/env python
"""
Script para eliminar datos de demo: Productos, Movimientos y Alertas.
Ejecutar desde la carpeta `S1/backend` con el entorno virtual activado:
    .\venv\Scripts\Activate.ps1
    python limpiar_datos.py
"""
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        import django
        django.setup()
    except Exception as e:
        print('Error al inicializar Django:', e)
        sys.exit(1)

    try:
        from core.models import Producto, Movimiento, Alerta
    except Exception as e:
        print('Error importando modelos. ¿Estás en la carpeta correcta?')
        print(e)
        sys.exit(1)

    def contar():
        return {
            'productos': Producto.objects.count(),
            'movimientos': Movimiento.objects.count(),
            'alertas': Alerta.objects.count(),
        }

    before = contar()
    print('Conteo antes de borrar:', before)

    print('Borrando Movimientos...')
    Movimiento.objects.all().delete()

    print('Borrando Alertas...')
    Alerta.objects.all().delete()

    print('Borrando Productos...')
    Producto.objects.all().delete()

    after = contar()
    print('Conteo después de borrar:', after)
    print('Limpieza completada.')
