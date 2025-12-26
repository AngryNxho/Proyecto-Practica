"""
Script para verificar la conexión a PostgreSQL
"""
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.conf import settings
from django.db import connection
from core.models import Producto, Movimiento, Alerta


def verificar_conexion():
    """Verifica la conexión a la base de datos"""
    print("=" * 60)
    print("  VERIFICACIÓN DE CONEXIÓN A BASE DE DATOS")
    print("=" * 60)
    
    db_config = settings.DATABASES['default']
    print(f"\n📊 Configuración de base de datos:")
    print(f"  Motor: {db_config['ENGINE']}")
    
    if 'postgresql' in db_config['ENGINE']:
        print(f"  Base de datos: {db_config['NAME']}")
        print(f"  Usuario: {db_config['USER']}")
        print(f"  Host: {db_config['HOST']}")
        print(f"  Puerto: {db_config['PORT']}")
    else:
        print(f"  Archivo: {db_config['NAME']}")
    
    print("\n🔌 Probando conexión...")
    
    try:
        # Intentar conectar
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        print("✅ Conexión exitosa")
        
        # Obtener versión de la base de datos
        if 'postgresql' in db_config['ENGINE']:
            with connection.cursor() as cursor:
                cursor.execute("SELECT version()")
                version = cursor.fetchone()[0]
                print(f"\n📦 Versión PostgreSQL: {version.split(',')[0]}")
        
        # Verificar tablas
        print("\n📋 Verificando tablas...")
        try:
            productos_count = Producto.objects.count()
            movimientos_count = Movimiento.objects.count()
            alertas_count = Alerta.objects.count()
            
            print(f"  ✓ core_producto: {productos_count} registros")
            print(f"  ✓ core_movimiento: {movimientos_count} registros")
            print(f"  ✓ core_alerta: {alertas_count} registros")
            
        except Exception as e:
            print(f"  ⚠️  Error al acceder a tablas: {e}")
            print("  Posiblemente necesites ejecutar: python manage.py migrate")
        
        return True
        
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        print("\n💡 Posibles soluciones:")
        print("  1. Verifica que PostgreSQL esté corriendo")
        print("  2. Verifica las credenciales en tu archivo .env")
        print("  3. Verifica que la base de datos exista")
        print("  4. Verifica los permisos del usuario")
        return False


def crear_base_datos():
    """Instrucciones para crear la base de datos"""
    print("\n" + "=" * 60)
    print("  INSTRUCCIONES PARA CREAR BASE DE DATOS POSTGRESQL")
    print("=" * 60)
    
    db_config = settings.DATABASES['default']
    
    if 'postgresql' not in db_config['ENGINE']:
        print("\n⚠️  Tu configuración actual usa SQLite, no PostgreSQL")
        print("   Configura DB_ENGINE=postgresql en tu .env para usar PostgreSQL")
        return
    
    print("\n1️⃣  Instalar PostgreSQL:")
    print("   - Descarga desde: https://www.postgresql.org/download/")
    print("   - Durante instalación, anota el password del usuario 'postgres'")
    
    print("\n2️⃣  Crear la base de datos (opción A - desde pgAdmin):")
    print("   - Abre pgAdmin")
    print("   - Click derecho en 'Databases' → Create → Database")
    print(f"   - Nombre: {db_config['NAME']}")
    print(f"   - Owner: {db_config['USER']}")
    
    print("\n2️⃣  Crear la base de datos (opción B - desde línea de comandos):")
    print("   Ejecuta en PowerShell:")
    print(f"   psql -U {db_config['USER']} -c \"CREATE DATABASE {db_config['NAME']};\"")
    
    print("\n3️⃣  Configurar variables de entorno (.env):")
    print("   DB_ENGINE=postgresql")
    print(f"   DB_NAME={db_config['NAME']}")
    print(f"   DB_USER={db_config['USER']}")
    print(f"   DB_PASSWORD=tu-password-aqui")
    print(f"   DB_HOST={db_config['HOST']}")
    print(f"   DB_PORT={db_config['PORT']}")
    
    print("\n4️⃣  Aplicar migraciones:")
    print("   python manage.py migrate")
    
    print("\n5️⃣  Migrar datos (opcional):")
    print("   python migrar_a_postgres.py")


def main():
    """Función principal"""
    exito = verificar_conexion()
    
    if not exito:
        crear_base_datos()
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ Verificación completada exitosamente")
    print("=" * 60)


if __name__ == '__main__':
    main()
