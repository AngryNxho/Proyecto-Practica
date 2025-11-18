#!/usr/bin/env python
"""
Script de demostración para poblar la base de datos con datos de ejemplo.
Ejecutar: python poblar_datos.py
"""
import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Producto, Alerta

def poblar_datos():
    """Crear productos y alertas de ejemplo para demostración"""
    
    print("🔧 Poblando base de datos con datos de ejemplo...")
    
    # Productos de ejemplo
    productos_ejemplo = [
        {
            'nombre': 'Toner HP 80A CF280A Negro',
            'descripcion': 'Compatible con LaserJet Pro 400 M401, M425',
            'marca': 'HP',
            'modelo': 'CF280A',
            'categoria': 'Toner',
            'precio': 45000,
            'stock': 15,
        },
        {
            'nombre': 'Toner HP 85A CE285A Negro',
            'descripcion': 'Para LaserJet Pro P1102, M1132, M1212',
            'marca': 'HP',
            'modelo': 'CE285A',
            'categoria': 'Toner',
            'precio': 38000,
            'stock': 3,
        },
        {
            'nombre': 'Impresora HP LaserJet Pro M404dn',
            'descripcion': 'Impresora láser monocromática con red',
            'marca': 'HP',
            'modelo': 'M404dn',
            'categoria': 'Impresora',
            'precio': 285000,
            'stock': 2,
        },
        {
            'nombre': 'Toner Canon 052',
            'descripcion': 'Para imageCLASS LBP212dw, LBP214dw',
            'marca': 'Canon',
            'modelo': '052',
            'categoria': 'Toner',
            'precio': 52000,
            'stock': 8,
        },
        {
            'nombre': 'Toner Brother TN-2370',
            'descripcion': 'Compatible con HL-L2395DW, MFC-L2750DW',
            'marca': 'Brother',
            'modelo': 'TN-2370',
            'categoria': 'Toner',
            'precio': 41000,
            'stock': 12,
        },
        {
            'nombre': 'Impresora Epson EcoTank L3250',
            'descripcion': 'Multifuncional de tinta continua WiFi',
            'marca': 'Epson',
            'modelo': 'L3250',
            'categoria': 'Impresora',
            'precio': 189000,
            'stock': 5,
        },
        {
            'nombre': 'Toner Samsung MLT-D101S',
            'descripcion': 'Para ML-2165, SCX-3405',
            'marca': 'Samsung',
            'modelo': 'MLT-D101S',
            'categoria': 'Toner',
            'precio': 35000,
            'stock': 1,
        },
        {
            'nombre': 'Kit Mantenimiento HP CF064A',
            'descripcion': 'Kit de mantenimiento LaserJet Enterprise M600',
            'marca': 'HP',
            'modelo': 'CF064A',
            'categoria': 'Accesorio',
            'precio': 125000,
            'stock': 4,
        },
    ]
    
    productos_creados = []
    for datos in productos_ejemplo:
        producto, creado = Producto.objects.get_or_create(
            nombre=datos['nombre'],
            defaults=datos
        )
        if creado:
            productos_creados.append(producto)
            print(f"  ✅ Creado: {producto.nombre}")
        else:
            print(f"  ⏭️  Ya existe: {producto.nombre}")
    
    # Crear alertas para productos con stock bajo
    print("\n🔔 Configurando alertas de stock...")
    alertas_creadas = 0
    
    for producto in Producto.objects.all():
        # Definir umbral según tipo
        if producto.categoria == 'Toner':
            umbral = 5
        elif producto.categoria == 'Impresora':
            umbral = 2
        else:
            umbral = 3
        
        alerta, creado = Alerta.objects.get_or_create(
            producto=producto,
            defaults={'umbral': umbral, 'activa': producto.stock < umbral}
        )
        
        if creado:
            alertas_creadas += 1
            estado = "🔴 ACTIVA" if alerta.activa else "✅ Normal"
            print(f"  {estado} - {producto.nombre} (Stock: {producto.stock}, Umbral: {umbral})")
    
    print(f"\n✨ Completado!")
    print(f"   Productos totales: {Producto.objects.count()}")
    print(f"   Alertas configuradas: {Alerta.objects.count()}")
    print(f"   Alertas activas: {Alerta.objects.filter(activa=True).count()}")

if __name__ == '__main__':
    poblar_datos()
