"""
Script para crear la base de datos en MariaDB
"""
import MySQLdb
import getpass

print("🔧 Configuración de Base de Datos MariaDB\n")

# Solicitar contraseña
password = getpass.getpass("Ingresa la contraseña de root de MariaDB: ")

try:
    # Conectar a MariaDB
    connection = MySQLdb.connect(
        host='localhost',
        user='root',
        passwd=password,
        port=3306
    )
    
    cursor = connection.cursor()
    
    # Crear base de datos
    cursor.execute("CREATE DATABASE IF NOT EXISTS inventario_tisol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    print("✅ Base de datos 'inventario_tisol' creada exitosamente")
    
    # Mostrar bases de datos
    cursor.execute("SHOW DATABASES")
    print("\n📊 Bases de datos disponibles:")
    for db in cursor.fetchall():
        print(f"  - {db[0]}")
    
    cursor.close()
    connection.close()
    
    print("\n✨ Configuración completada!")
    print(f"\n📝 Ahora agrega estas líneas a S1/backend/.env:")
    print(f"""
DB_ENGINE=mysql
DB_NAME=inventario_tisol
DB_USER=root
DB_PASSWORD={password}
DB_HOST=localhost
DB_PORT=3306
""")
    
except MySQLdb.Error as e:
    print(f"❌ Error al conectar: {e}")
    print("\nVerifica que:")
    print("  1. MariaDB esté corriendo")
    print("  2. La contraseña sea correcta")
    print("  3. El puerto 3306 esté disponible")
