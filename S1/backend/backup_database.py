"""
Script para crear backups de la base de datos
Soporta SQLite y PostgreSQL
"""
import os
import json
import sys
from datetime import datetime
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.conf import settings
from core.models import Producto, Movimiento, Alerta


def crear_backup():
    """Crea un backup completo de la base de datos en formato JSON"""
    print("=" * 60)
    print("  CREANDO BACKUP DE BASE DE DATOS")
    print("=" * 60)
    
    db_engine = settings.DATABASES['default']['ENGINE']
    db_name = settings.DATABASES['default']['NAME']
    
    print(f"\n📊 Base de datos: {db_engine}")
    print(f"📁 Nombre: {db_name}")
    
    backup_data = {
        'metadata': {
            'fecha_backup': datetime.now().isoformat(),
            'db_engine': db_engine,
            'db_name': str(db_name),
        },
        'datos': {
            'productos': [],
            'movimientos': [],
            'alertas': []
        }
    }
    
    try:
        # Exportar productos
        print("\n📦 Exportando productos...")
        productos = Producto.objects.all()
        for p in productos:
            backup_data['datos']['productos'].append({
                'id': p.id,
                'nombre': p.nombre,
                'descripcion': p.descripcion,
                'categoria': p.categoria,
                'marca': p.marca,
                'modelo': p.modelo,
                'precio': str(p.precio),
                'stock': p.stock,
                'codigo_barras': p.codigo_barras,
                'fecha_creacion': p.fecha_creacion.isoformat(),
            })
        print(f"  ✓ {len(backup_data['datos']['productos'])} productos")
        
        # Exportar movimientos
        print("📋 Exportando movimientos...")
        movimientos = Movimiento.objects.all()
        for m in movimientos:
            backup_data['datos']['movimientos'].append({
                'id': m.id,
                'producto_id': m.producto_id,
                'tipo': m.tipo,
                'cantidad': m.cantidad,
                'descripcion': m.descripcion,
                'usuario': m.usuario,
                'fecha': m.fecha.isoformat(),
            })
        print(f"  ✓ {len(backup_data['datos']['movimientos'])} movimientos")
        
        # Exportar alertas
        print("⚠️  Exportando alertas...")
        alertas = Alerta.objects.all()
        for a in alertas:
            backup_data['datos']['alertas'].append({
                'id': a.id,
                'producto_id': a.producto_id,
                'umbral': a.umbral,
                'activa': a.activa,
            })
        print(f"  ✓ {len(backup_data['datos']['alertas'])} alertas")
        
        # Generar nombre de archivo con timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        archivo_backup = Path(__file__).resolve().parent / f'backup_{timestamp}.json'
        
        # Guardar archivo
        with open(archivo_backup, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Backup creado exitosamente")
        print(f"📁 Ubicación: {archivo_backup}")
        print(f"📊 Tamaño: {archivo_backup.stat().st_size / 1024:.2f} KB")
        
        return archivo_backup
        
    except Exception as e:
        print(f"\n❌ Error al crear backup: {e}")
        import traceback
        traceback.print_exc()
        return None


def restaurar_backup(archivo_backup):
    """Restaura un backup desde un archivo JSON"""
    print("=" * 60)
    print("  RESTAURANDO BACKUP")
    print("=" * 60)
    
    if not Path(archivo_backup).exists():
        print(f"❌ Error: Archivo no encontrado: {archivo_backup}")
        return False
    
    print(f"\n📁 Archivo: {archivo_backup}")
    
    try:
        # Leer archivo de backup
        with open(archivo_backup, 'r', encoding='utf-8') as f:
            backup_data = json.load(f)
        
        metadata = backup_data.get('metadata', {})
        datos = backup_data.get('datos', {})
        
        print(f"📅 Fecha backup: {metadata.get('fecha_backup', 'Desconocida')}")
        print(f"📊 BD original: {metadata.get('db_engine', 'Desconocida')}")
        
        # Confirmar operación
        print("\n⚠️  ADVERTENCIA: Esta operación eliminará todos los datos actuales")
        respuesta = input("¿Deseas continuar? (si/no): ").strip().lower()
        if respuesta not in ['si', 's', 'yes', 'y']:
            print("\n❌ Operación cancelada")
            return False
        
        # Limpiar base de datos actual
        print("\n🧹 Limpiando base de datos...")
        Movimiento.objects.all().delete()
        Alerta.objects.all().delete()
        Producto.objects.all().delete()
        print("  ✓ Base de datos limpiada")
        
        # Restaurar productos
        print("\n📦 Restaurando productos...")
        for p_data in datos.get('productos', []):
            Producto.objects.create(
                id=p_data['id'],
                nombre=p_data['nombre'],
                descripcion=p_data['descripcion'],
                categoria=p_data['categoria'],
                marca=p_data['marca'],
                modelo=p_data['modelo'],
                precio=p_data['precio'],
                stock=p_data['stock'],
                codigo_barras=p_data['codigo_barras'],
            )
        print(f"  ✓ {len(datos.get('productos', []))} productos restaurados")
        
        # Restaurar movimientos
        print("📋 Restaurando movimientos...")
        for m_data in datos.get('movimientos', []):
            Movimiento.objects.create(
                id=m_data['id'],
                producto_id=m_data['producto_id'],
                tipo=m_data['tipo'],
                cantidad=m_data['cantidad'],
                descripcion=m_data['descripcion'],
                usuario=m_data['usuario'],
            )
        print(f"  ✓ {len(datos.get('movimientos', []))} movimientos restaurados")
        
        # Restaurar alertas
        print("⚠️  Restaurando alertas...")
        for a_data in datos.get('alertas', []):
            Alerta.objects.create(
                id=a_data['id'],
                producto_id=a_data['producto_id'],
                umbral=a_data['umbral'],
                activa=a_data['activa'],
            )
        print(f"  ✓ {len(datos.get('alertas', []))} alertas restauradas")
        
        print("\n✅ Backup restaurado exitosamente")
        return True
        
    except Exception as e:
        print(f"\n❌ Error al restaurar backup: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Función principal"""
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python backup_database.py crear          - Crear nuevo backup")
        print("  python backup_database.py restaurar <archivo> - Restaurar backup")
        sys.exit(1)
    
    comando = sys.argv[1].lower()
    
    if comando == 'crear':
        crear_backup()
    elif comando == 'restaurar':
        if len(sys.argv) < 3:
            print("❌ Error: Especifica el archivo de backup")
            print("Ejemplo: python backup_database.py restaurar backup_20251226_120000.json")
            sys.exit(1)
        restaurar_backup(sys.argv[2])
    else:
        print(f"❌ Comando desconocido: {comando}")
        print("Usa 'crear' o 'restaurar'")
        sys.exit(1)


if __name__ == '__main__':
    main()
