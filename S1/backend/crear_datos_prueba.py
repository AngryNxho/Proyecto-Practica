import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Producto, Movimiento, Alerta
from django.contrib.auth.models import User

# Crear o obtener usuario por defecto
usuario, _ = User.objects.get_or_create(
    username='sistema',
    defaults={'email': 'sistema@inventario.com', 'is_staff': True}
)

# Limpiar datos existentes
print("Limpiando datos anteriores...")
Movimiento.objects.all().delete()
Alerta.objects.all().delete()
Producto.objects.all().delete()
print("✓ Datos limpiados")

# Crear productos de prueba
productos_data = [
    {
        'nombre': 'Toner HP 85A Negro',
        'marca': 'HP',
        'modelo': 'CE285A',
        'categoria': 'Toner',
        'stock': 15,
        'precio': 25000,
        'codigo_barras': '0886111963119',
        'descripcion': 'Toner original HP para LaserJet Pro P1102'
    },
    {
        'nombre': 'Toner Canon 137 Negro',
        'marca': 'Canon',
        'modelo': 'CRG-137',
        'categoria': 'Toner',
        'stock': 8,
        'precio': 28000,
        'codigo_barras': '0013803188567',
        'descripcion': 'Toner original Canon para imageCLASS MF212w'
    },
    {
        'nombre': 'Impresora HP LaserJet Pro M404dn',
        'marca': 'HP',
        'modelo': 'M404dn',
        'categoria': 'Impresora',
        'stock': 3,
        'precio': 350000,
        'codigo_barras': '0193905543540',
        'descripcion': 'Impresora láser monocromática de alto rendimiento'
    },
    {
        'nombre': 'Toner Samsung MLT-D101S',
        'marca': 'Samsung',
        'modelo': 'MLT-D101S',
        'categoria': 'Toner',
        'stock': 2,
        'precio': 22000,
        'codigo_barras': '8808993469888',
        'descripcion': 'Toner original Samsung ML-2165'
    },
    {
        'nombre': 'Toner Brother TN-2370',
        'marca': 'Brother',
        'modelo': 'TN-2370',
        'categoria': 'Toner',
        'stock': 20,
        'precio': 26000,
        'codigo_barras': '4977766753654',
        'descripcion': 'Toner original Brother HL-L2395DW'
    },
    {
        'nombre': 'Papel Resma A4 75g',
        'marca': 'Champion',
        'modelo': 'A4-75',
        'categoria': 'Papel',
        'stock': 50,
        'precio': 4500,
        'codigo_barras': '7891027009089',
        'descripcion': 'Resma de papel bond blanco A4 500 hojas'
    },
    {
        'nombre': 'Tinta Epson T664 Cian',
        'marca': 'Epson',
        'modelo': 'T664220',
        'categoria': 'Tinta',
        'stock': 12,
        'precio': 8500,
        'codigo_barras': '0010343921962',
        'descripcion': 'Botella de tinta para EcoTank L210/L355'
    },
    {
        'nombre': 'Tambor HP 19A',
        'marca': 'HP',
        'modelo': 'CF219A',
        'categoria': 'Repuesto',
        'stock': 4,
        'precio': 85000,
        'codigo_barras': '0889894752659',
        'descripcion': 'Tambor de imagen para LaserJet Pro M102/M130'
    },
]

print("\nCreando productos de prueba...")
productos_creados = []
for data in productos_data:
    producto = Producto.objects.create(**data)
    print(f"✓ Creado: {producto.nombre} (Stock: {producto.stock})")
    productos_creados.append(producto)
    
    # Crear alerta si el stock es bajo
    if producto.stock <= 10:
        Alerta.objects.create(
            producto=producto,
            umbral=10,
            activa=True
        )
        print(f"  → Alerta creada para {producto.nombre}")

# Crear movimientos históricos
print("\nCreando historial de movimientos...")
movimientos_count = 0
for producto in productos_creados:
    # Simular movimientos de los últimos 30 días
    for i in range(random.randint(3, 8)):
        dias_atras = random.randint(0, 30)
        fecha = datetime.now() - timedelta(days=dias_atras)
        
        tipo = random.choice(['ENTRADA', 'SALIDA'])
        cantidad = random.randint(1, 5)
        
        movimiento = Movimiento.objects.create(
            producto=producto,
            tipo=tipo,
            cantidad=cantidad,
            descripcion=f"{tipo.capitalize()} de {producto.nombre}",
            usuario=usuario,
            fecha=fecha
        )
        movimientos_count += 1

print(f"✓ {movimientos_count} movimientos creados")

print(f"\n✅ Proceso completado!")
print(f"Total productos: {Producto.objects.count()}")
print(f"Total movimientos: {Movimiento.objects.count()}")
print(f"Total alertas: {Alerta.objects.count()}")
print(f"\nUsuario creado: {usuario.username}")
