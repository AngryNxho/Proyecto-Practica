import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Producto, Movimiento

# Crear productos de prueba
productos_data = [
    {
        'nombre': 'Toner HP 85A Negro',
        'marca': 'HP',
        'modelo': 'CE285A',
        'categoria': 'Toner',
        'stock': 15,
        'precio': 25000,
        'descripcion': 'Toner original HP para LaserJet Pro P1102'
    },
    {
        'nombre': 'Toner Canon 137 Negro',
        'marca': 'Canon',
        'modelo': 'CRG-137',
        'categoria': 'Toner',
        'stock': 8,
        'precio': 28000,
        'descripcion': 'Toner original Canon para imageCLASS MF212w'
    },
    {
        'nombre': 'Impresora HP LaserJet Pro M404dn',
        'marca': 'HP',
        'modelo': 'M404dn',
        'categoria': 'Impresora',
        'stock': 3,
        'precio': 350000,
        'descripcion': 'Impresora láser monocromática de alto rendimiento'
    },
    {
        'nombre': 'Toner Samsung MLT-D101S',
        'marca': 'Samsung',
        'modelo': 'MLT-D101S',
        'categoria': 'Toner',
        'stock': 2,
        'precio': 22000,
        'descripcion': 'Toner original Samsung ML-2165'
    },
    {
        'nombre': 'Toner Brother TN-2370',
        'marca': 'Brother',
        'modelo': 'TN-2370',
        'categoria': 'Toner',
        'stock': 20,
        'precio': 26000,
        'descripcion': 'Toner original Brother HL-L2395DW'
    },
]

print("Creando productos de prueba...")
productos_creados = []
for data in productos_data:
    producto, created = Producto.objects.get_or_create(
        nombre=data['nombre'],
        defaults=data
    )
    if created:
        print(f"✓ Creado: {producto.nombre}")
        productos_creados.append(producto)
    else:
        print(f"- Ya existe: {producto.nombre}")

# Crear algunos movimientos
if productos_creados:
    print("\nCreando movimientos de prueba...")
    for producto in productos_creados[:3]:
        # Entrada
        producto.registrar_entrada(10, f"Entrada inicial de {producto.nombre}")
        print(f"✓ Entrada registrada para {producto.nombre}")
        
        # Salida
        if producto.stock >= 5:
            producto.registrar_salida(3, f"Salida de prueba de {producto.nombre}")
            print(f"✓ Salida registrada para {producto.nombre}")

print(f"\n✅ Proceso completado!")
print(f"Total productos: {Producto.objects.count()}")
print(f"Total movimientos: {Movimiento.objects.count()}")
