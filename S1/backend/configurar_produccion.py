"""
Script de configuración para entorno de producción
Valida variables de entorno y configuraciones necesarias
"""
import os
import sys
from pathlib import Path

# Añadir el directorio del proyecto al path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')


def verificar_variables_entorno():
    """Verifica que todas las variables de entorno necesarias estén configuradas"""
    print("=" * 60)
    print("  VERIFICACIÓN DE VARIABLES DE ENTORNO")
    print("=" * 60)
    
    variables_requeridas = {
        'SECRET_KEY': 'Clave secreta de Django',
        'DEBUG': 'Modo de depuración (debe ser False en producción)',
        'ALLOWED_HOSTS': 'Dominios permitidos',
        'DB_ENGINE': 'Motor de base de datos (postgresql para producción)',
        'DB_NAME': 'Nombre de la base de datos',
        'DB_USER': 'Usuario de la base de datos',
        'DB_PASSWORD': 'Contraseña de la base de datos',
        'DB_HOST': 'Host de la base de datos',
        'DB_PORT': 'Puerto de la base de datos',
    }
    
    errores = []
    advertencias = []
    
    for var, descripcion in variables_requeridas.items():
        valor = os.getenv(var)
        
        if not valor:
            errores.append(f"❌ {var}: No configurada ({descripcion})")
        else:
            # Validaciones específicas
            if var == 'SECRET_KEY':
                if 'django-insecure' in valor or len(valor) < 50:
                    advertencias.append(f"⚠️  {var}: Usar clave más segura en producción")
                else:
                    print(f"✓ {var}: Configurada correctamente")
            
            elif var == 'DEBUG':
                if valor.lower() in ['true', '1', 'yes']:
                    advertencias.append(f"⚠️  {var}: DEBUG=True NO debe usarse en producción")
                else:
                    print(f"✓ {var}: {valor}")
            
            elif var == 'DB_ENGINE':
                if valor != 'postgresql':
                    advertencias.append(f"⚠️  {var}: Se recomienda PostgreSQL para producción")
                else:
                    print(f"✓ {var}: {valor}")
            
            elif var == 'ALLOWED_HOSTS':
                if 'localhost' in valor or '127.0.0.1' in valor:
                    advertencias.append(f"⚠️  {var}: Incluye hosts de desarrollo")
                print(f"✓ {var}: {valor}")
            
            else:
                # No mostrar contraseñas
                if 'PASSWORD' in var:
                    print(f"✓ {var}: ********")
                else:
                    print(f"✓ {var}: {valor}")
    
    # Mostrar resultados
    print("\n" + "=" * 60)
    if errores:
        print("❌ ERRORES ENCONTRADOS:")
        for error in errores:
            print(f"  {error}")
    
    if advertencias:
        print("\n⚠️  ADVERTENCIAS:")
        for advertencia in advertencias:
            print(f"  {advertencia}")
    
    if not errores and not advertencias:
        print("✅ Todas las variables están correctamente configuradas")
    
    return len(errores) == 0


def verificar_dependencias():
    """Verifica que todas las dependencias estén instaladas"""
    print("\n" + "=" * 60)
    print("  VERIFICACIÓN DE DEPENDENCIAS")
    print("=" * 60)
    
    try:
        import django
        print(f"✓ Django {django.get_version()}")
    except ImportError:
        print("❌ Django no está instalado")
        return False
    
    try:
        import rest_framework
        print(f"✓ Django REST Framework instalado")
    except ImportError:
        print("❌ Django REST Framework no está instalado")
        return False
    
    try:
        import psycopg2
        print(f"✓ psycopg2 (PostgreSQL driver) instalado")
    except ImportError:
        print("⚠️  psycopg2 no está instalado (necesario para PostgreSQL)")
    
    try:
        import corsheaders
        print(f"✓ django-cors-headers instalado")
    except ImportError:
        print("❌ django-cors-headers no está instalado")
        return False
    
    return True


def verificar_estructura_directorios():
    """Verifica que existan los directorios necesarios"""
    print("\n" + "=" * 60)
    print("  VERIFICACIÓN DE ESTRUCTURA DE DIRECTORIOS")
    print("=" * 60)
    
    directorios = {
        'static': BASE_DIR / 'staticfiles',
        'media': BASE_DIR / 'media',
        'logs': BASE_DIR / 'logs',
    }
    
    for nombre, ruta in directorios.items():
        if ruta.exists():
            print(f"✓ {nombre}: {ruta}")
        else:
            print(f"⚠️  {nombre}: No existe (creando...)")
            ruta.mkdir(parents=True, exist_ok=True)
            print(f"  ✓ Creado: {ruta}")
    
    return True


def generar_secret_key():
    """Genera una nueva SECRET_KEY segura"""
    from django.core.management.utils import get_random_secret_key
    return get_random_secret_key()


def main():
    """Función principal"""
    print("\n🔧 CONFIGURACIÓN DE PRODUCCIÓN")
    print("=" * 60)
    
    # Verificar archivo .env
    env_file = BASE_DIR / '.env'
    if not env_file.exists():
        print(f"\n❌ Archivo .env no encontrado en: {env_file}")
        print("\n💡 Crea un archivo .env basándote en .env.example:")
        print(f"   copy .env.example .env")
        sys.exit(1)
    
    print(f"✓ Archivo .env encontrado: {env_file}\n")
    
    # Cargar variables de entorno
    from decouple import config
    
    # Ejecutar verificaciones
    paso1 = verificar_variables_entorno()
    paso2 = verificar_dependencias()
    paso3 = verificar_estructura_directorios()
    
    # Resumen final
    print("\n" + "=" * 60)
    print("  RESUMEN")
    print("=" * 60)
    
    if paso1 and paso2 and paso3:
        print("✅ Sistema listo para producción")
        print("\n📋 Próximos pasos:")
        print("  1. python manage.py migrate")
        print("  2. python manage.py collectstatic")
        print("  3. python manage.py createsuperuser")
        print("  4. Ejecutar servidor con gunicorn o similar")
    else:
        print("❌ Corrige los errores antes de desplegar")
        sys.exit(1)
    
    # Ofrecer generar nueva SECRET_KEY
    if os.getenv('SECRET_KEY', '').startswith('django-insecure'):
        print("\n💡 ¿Generar nueva SECRET_KEY?")
        respuesta = input("   (si/no): ").strip().lower()
        if respuesta in ['si', 's', 'yes', 'y']:
            nueva_key = generar_secret_key()
            print(f"\n🔑 Nueva SECRET_KEY generada:")
            print(f"   {nueva_key}")
            print("\n   Agrégala a tu archivo .env:")
            print(f"   SECRET_KEY={nueva_key}")


if __name__ == '__main__':
    main()
