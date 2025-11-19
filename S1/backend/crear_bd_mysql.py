"""
Script para crear la base de datos usando MySQL existente
"""
import MySQLdb
import getpass

print("🔧 Configuración de Base de Datos MySQL\n")
print("Intentando conectar a MySQL (puerto 3306)...\n")

# Intentar sin contraseña primero (común en instalaciones locales)
try:
    connection = MySQLdb.connect(
        host='localhost',
        user='root',
        passwd='',  # Sin contraseña
        port=3306
    )
    print("✅ Conectado a MySQL sin contraseña")
except:
    # Si falla, pedir contraseña
    password = getpass.getpass("Ingresa la contraseña de root de MySQL: ")
    try:
        connection = MySQLdb.connect(
            host='localhost',
            user='root',
            passwd=password,
            port=3306
        )
        print("✅ Conectado a MySQL con contraseña")
    except MySQLdb.Error as e:
        print(f"❌ Error: {e}")
        print("\nOpciones:")
        print("1. Verifica la contraseña de MySQL")
        print("2. Intenta con otro usuario")
        exit(1)

try:
    cursor = connection.cursor()
    
    # Crear base de datos
    cursor.execute("CREATE DATABASE IF NOT EXISTS inventario_tisol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    print("✅ Base de datos 'inventario_tisol' creada")
    
    # Mostrar bases de datos
    cursor.execute("SHOW DATABASES")
    print("\n📊 Bases de datos disponibles:")
    for db in cursor.fetchall():
        print(f"  - {db[0]}")
    
    cursor.close()
    connection.close()
    
    print("\n✨ ¡Listo! Ahora actualiza tu archivo .env")
    
except MySQLdb.Error as e:
    print(f"❌ Error: {e}")
