"""
Script de despliegue automatizado para backend
Ejecuta todos los pasos necesarios para poner en producción
"""
import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def ejecutar_comando(comando, descripcion):
    """Ejecuta un comando y muestra el resultado"""
    print(f"\n{'='*60}")
    print(f"  {descripcion}")
    print(f"{'='*60}")
    
    try:
        resultado = subprocess.run(
            comando,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        print(resultado.stdout)
        if resultado.stderr:
            print("Advertencias:", resultado.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        print(f"Salida: {e.stdout}")
        print(f"Error: {e.stderr}")
        return False


def verificar_entorno():
    """Verifica que el entorno esté configurado"""
    print("\n🔍 Verificando entorno...")
    
    # Verificar archivo .env
    env_file = BASE_DIR / '.env'
    if not env_file.exists():
        print("❌ Falta archivo .env")
        return False
    
    # Verificar que no sea DEBUG
    with open(env_file, 'r') as f:
        contenido = f.read()
        if 'DEBUG=True' in contenido:
            print("⚠️  Advertencia: DEBUG=True en producción")
            respuesta = input("¿Continuar de todos modos? (si/no): ")
            if respuesta.lower() not in ['si', 's']:
                return False
    
    print("✓ Entorno verificado")
    return True


def main():
    """Función principal de despliegue"""
    print("=" * 60)
    print("  DESPLIEGUE DE BACKEND - INVENTARIO")
    print("=" * 60)
    
    # Paso 1: Verificar entorno
    if not verificar_entorno():
        print("\n❌ Verificación fallida. Abortando.")
        sys.exit(1)
    
    # Paso 2: Instalar dependencias
    if not ejecutar_comando(
        "pip install -r requirements-prod.txt",
        "📦 Instalando dependencias de producción"
    ):
        print("\n❌ Error al instalar dependencias")
        sys.exit(1)
    
    # Paso 3: Aplicar migraciones
    if not ejecutar_comando(
        "python manage.py migrate --noinput",
        "🗄️  Aplicando migraciones de base de datos"
    ):
        print("\n❌ Error al aplicar migraciones")
        sys.exit(1)
    
    # Paso 4: Recolectar archivos estáticos
    if not ejecutar_comando(
        "python manage.py collectstatic --noinput",
        "📁 Recolectando archivos estáticos"
    ):
        print("\n❌ Error al recolectar archivos estáticos")
        sys.exit(1)
    
    # Paso 5: Verificar sistema
    if not ejecutar_comando(
        "python manage.py check --deploy",
        "✅ Verificando configuración de despliegue"
    ):
        print("\n⚠️  Advertencias de configuración detectadas")
    
    # Paso 6: Crear directorios de logs
    print("\n📝 Creando directorios de logs...")
    (BASE_DIR / 'logs').mkdir(exist_ok=True)
    print("✓ Directorios creados")
    
    # Resumen
    print("\n" + "=" * 60)
    print("  ✅ DESPLIEGUE COMPLETADO")
    print("=" * 60)
    print("\n📋 Para iniciar el servidor:")
    print("  gunicorn config.wsgi:application -c gunicorn.conf.py")
    print("\n📋 Para ejecutar en segundo plano:")
    print("  gunicorn config.wsgi:application -c gunicorn.conf.py --daemon")
    print("\n📋 Para detener el servidor:")
    print("  pkill -f gunicorn")


if __name__ == '__main__':
    main()
