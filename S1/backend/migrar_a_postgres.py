"""
Script para migrar datos de SQLite a PostgreSQL
Exporta todos los datos de SQLite y los importa en PostgreSQL
"""
import os
import sys
import json
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.core.management import call_command
from django.conf import settings
from core.models import Producto, Movimiento, Alerta


def validar_configuracion():
    """Valida que la configuración de base de datos sea correcta"""
    db_engine = settings.DATABASES['default']['ENGINE']
    
    if 'postgresql' not in db_engine:
        print("❌ Error: La base de datos debe estar configurada como PostgreSQL")
        print("   Configura DB_ENGINE=postgresql en tu archivo .env")
        return False
    
    print(f"✓ Motor de BD: {db_engine}")
    print(f"✓ Base de datos: {settings.DATABASES['default']['NAME']}")
    print(f"✓ Host: {settings.DATABASES['default']['HOST']}")
    print(f"✓ Puerto: {settings.DATABASES['default']['PORT']}")
    return True


def exportar_datos_sqlite():
    """Exporta datos de SQLite a archivos JSON"""
    print("\n📤 Exportando datos de SQLite...")
    
    # Cambiar temporalmente a SQLite
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': Path(__file__).resolve().parent / 'db.sqlite3',
    }
    
    # Reconectar a la base de datos
    from django import db
    db.connections.close_all()
    
    datos_exportados = {
        'productos': [],
        'movimientos': [],
        'alertas': []
    }
    
    try:
        # Exportar productos
        productos = Producto.objects.all()
        for p in productos:
            datos_exportados['productos'].append({
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
        print(f"  ✓ {len(datos_exportados['productos'])} productos exportados")
        
        # Exportar movimientos
        movimientos = Movimiento.objects.all()
        for m in movimientos:
            datos_exportados['movimientos'].append({
                'id': m.id,
                'producto_id': m.producto_id,
                'tipo': m.tipo,
                'cantidad': m.cantidad,
                'descripcion': m.descripcion,
                'usuario': m.usuario,
                'fecha': m.fecha.isoformat(),
            })
        print(f"  ✓ {len(datos_exportados['movimientos'])} movimientos exportados")
        
        # Exportar alertas
        alertas = Alerta.objects.all()
        for a in alertas:
            datos_exportados['alertas'].append({
                'id': a.id,
                'producto_id': a.producto_id,
                'umbral': a.umbral,
                'activa': a.activa,
            })
        print(f"  ✓ {len(datos_exportados['alertas'])} alertas exportadas")
        
        # Guardar en archivo
        archivo_backup = Path(__file__).resolve().parent / 'backup_sqlite.json'
        with open(archivo_backup, 'w', encoding='utf-8') as f:
            json.dump(datos_exportados, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Datos exportados a: {archivo_backup}")
        return datos_exportados
        
    except Exception as e:
        print(f"❌ Error al exportar datos: {e}")
        return None


def importar_datos_postgres(datos):
    """Importa datos a PostgreSQL"""
    print("\n📥 Importando datos a PostgreSQL...")
    
    # Restaurar configuración PostgreSQL
    os.environ['DB_ENGINE'] = 'postgresql'
    
    # Reconectar a PostgreSQL
    from django import db
    db.connections.close_all()
    
    try:
        # Limpiar tablas existentes
        print("  Limpiando tablas existentes...")
        Movimiento.objects.all().delete()
        Alerta.objects.all().delete()
        Producto.objects.all().delete()
        
        # Importar productos
        print("  Importando productos...")
        for p_data in datos['productos']:
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
        print(f"  ✓ {len(datos['productos'])} productos importados")
        
        # Importar movimientos
        print("  Importando movimientos...")
        for m_data in datos['movimientos']:
            Movimiento.objects.create(
                id=m_data['id'],
                producto_id=m_data['producto_id'],
                tipo=m_data['tipo'],
                cantidad=m_data['cantidad'],
                descripcion=m_data['descripcion'],
                usuario=m_data['usuario'],
            )
        print(f"  ✓ {len(datos['movimientos'])} movimientos importados")
        
        # Importar alertas
        print("  Importando alertas...")
        for a_data in datos['alertas']:
            Alerta.objects.create(
                id=a_data['id'],
                producto_id=a_data['producto_id'],
                umbral=a_data['umbral'],
                activa=a_data['activa'],
            )
        print(f"  ✓ {len(datos['alertas'])} alertas importadas")
        
        print("\n✅ Migración completada exitosamente")
        return True
        
    except Exception as e:
        print(f"❌ Error al importar datos: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Función principal de migración"""
    print("=" * 60)
    print("  MIGRACIÓN DE DATOS: SQLite → PostgreSQL")
    print("=" * 60)
    
    # Validar configuración
    if not validar_configuracion():
        sys.exit(1)
    
    # Confirmar operación
    print("\n⚠️  ADVERTENCIA: Esta operación:")
    print("   1. Exportará todos los datos de SQLite")
    print("   2. Eliminará todos los datos actuales en PostgreSQL")
    print("   3. Importará los datos de SQLite a PostgreSQL")
    
    respuesta = input("\n¿Deseas continuar? (si/no): ").strip().lower()
    if respuesta not in ['si', 's', 'yes', 'y']:
        print("\n❌ Operación cancelada")
        sys.exit(0)
    
    # Ejecutar migración
    print("\n🚀 Iniciando migración...")
    
    # Paso 1: Exportar desde SQLite
    datos = exportar_datos_sqlite()
    if datos is None:
        print("\n❌ Error en la exportación. Abortando.")
        sys.exit(1)
    
    # Paso 2: Aplicar migraciones en PostgreSQL
    print("\n🔧 Aplicando migraciones en PostgreSQL...")
    try:
        call_command('migrate', verbosity=1)
        print("  ✓ Migraciones aplicadas")
    except Exception as e:
        print(f"  ❌ Error al aplicar migraciones: {e}")
        sys.exit(1)
    
    # Paso 3: Importar a PostgreSQL
    if not importar_datos_postgres(datos):
        print("\n❌ Error en la importación. Revisa los logs.")
        sys.exit(1)
    
    # Resumen final
    print("\n" + "=" * 60)
    print("  RESUMEN DE MIGRACIÓN")
    print("=" * 60)
    print(f"  Productos migrados:   {len(datos['productos'])}")
    print(f"  Movimientos migrados: {len(datos['movimientos'])}")
    print(f"  Alertas migradas:     {len(datos['alertas'])}")
    print("\n✅ Migración completada con éxito")
    print("\n💡 Recuerda:")
    print("   - Verificar la conexión en tu aplicación")
    print("   - Actualizar credenciales de producción")
    print("   - Hacer backup del archivo backup_sqlite.json")


if __name__ == '__main__':
    main()
