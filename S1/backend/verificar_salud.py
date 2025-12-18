"""
Script de verificación de salud del sistema de inventario
Ejecutar con: python verificar_salud.py
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.db.models import Count, Sum, F
from core.models import Producto, Movimiento, Alerta


def verificar_conexion_bd():
    """Verifica que la conexión a la base de datos funcione"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("[OK] Conexión a base de datos")
        return True
    except Exception as e:
        print(f"[ERROR] Conexión BD: {e}")
        return False


def verificar_modelos():
    """Verifica que los modelos estén correctamente configurados"""
    try:
        Producto.objects.count()
        Movimiento.objects.count()
        Alerta.objects.count()
        print("[OK] Modelos de datos")
        return True
    except Exception as e:
        print(f"[ERROR] Modelos: {e}")
        return False


def verificar_integridad_stock():
    """Verifica que no haya stock negativo"""
    productos_negativos = Producto.objects.filter(stock__lt=0)
    if productos_negativos.exists():
        print(f"[ADVERTENCIA] {productos_negativos.count()} productos con stock negativo")
        for p in productos_negativos:
            print(f"  - {p.nombre}: {p.stock}")
        return False
    else:
        print("[OK] Integridad de stock")
        return True


def verificar_alertas():
    """Verifica configuración de alertas"""
    productos_sin_alerta = Producto.objects.annotate(
        num_alertas=Count('alertas')
    ).filter(num_alertas=0)
    
    if productos_sin_alerta.exists():
        print(f"[INFO] {productos_sin_alerta.count()} productos sin alertas configuradas")
    else:
        print("[OK] Todos los productos tienen alertas")
    
    alertas_activas = Alerta.objects.filter(activa=True).count()
    print(f"[INFO] {alertas_activas} alertas activas en el sistema")
    return True


def verificar_movimientos():
    """Verifica que los movimientos tengan datos consistentes"""
    movimientos_sin_usuario = Movimiento.objects.filter(
        usuario__isnull=True
    ) | Movimiento.objects.filter(usuario='')
    
    if movimientos_sin_usuario.exists():
        print(f"[INFO] {movimientos_sin_usuario.count()} movimientos sin usuario asignado")
    else:
        print("[OK] Todos los movimientos tienen usuario")
    
    total_movimientos = Movimiento.objects.count()
    print(f"[INFO] Total de movimientos registrados: {total_movimientos}")
    return True


def generar_reporte_inventario():
    """Genera un reporte rápido del inventario"""
    print("\n=== REPORTE DE INVENTARIO ===")
    
    # Totales
    total_productos = Producto.objects.count()
    total_stock = Producto.objects.aggregate(Sum('stock'))['stock__sum'] or 0
    valor_total = Producto.objects.aggregate(
        total=Sum(F('stock') * F('precio'))
    )['total'] or 0
    
    print(f"Total de productos: {total_productos}")
    print(f"Stock total: {total_stock} unidades")
    print(f"Valor inventario: ${valor_total:,.0f}")
    
    # Por estado
    criticos = Producto.objects.filter(stock__lte=5).count()
    bajos = Producto.objects.filter(stock__gt=5, stock__lte=10).count()
    normales = Producto.objects.filter(stock__gt=10).count()
    
    print(f"\nDistribución de stock:")
    print(f"  Crítico (≤5): {criticos}")
    print(f"  Bajo (6-10): {bajos}")
    print(f"  Normal (>10): {normales}")
    
    # Por categoría
    por_categoria = Producto.objects.values('categoria').annotate(
        cantidad=Count('id')
    ).order_by('-cantidad')
    
    print(f"\nProductos por categoría:")
    for cat in por_categoria:
        print(f"  {cat['categoria']}: {cat['cantidad']}")


def main():
    """Ejecuta todas las verificaciones"""
    print("=" * 50)
    print("VERIFICACIÓN DE SALUD DEL SISTEMA")
    print("=" * 50)
    print()
    
    checks = [
        verificar_conexion_bd(),
        verificar_modelos(),
        verificar_integridad_stock(),
        verificar_alertas(),
        verificar_movimientos(),
    ]
    
    print()
    generar_reporte_inventario()
    
    print()
    print("=" * 50)
    if all(checks):
        print("RESULTADO: Sistema en buen estado")
        sys.exit(0)
    else:
        print("RESULTADO: Se encontraron advertencias")
        sys.exit(1)


if __name__ == "__main__":
    main()
