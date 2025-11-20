"""
Script automático para configurar MySQL/MariaDB
Prueba contraseñas comunes y configura la BD
"""
import MySQLdb
import sys

print("🔧 Configuración Automática de MySQL/MariaDB\n")

# Lista de contraseñas comunes a probar
passwords = ['', 'root', 'admin', 'mysql', 'password', '123456']
connection = None
working_password = None

# Intentar conectar con diferentes contraseñas
for pwd in passwords:
    try:
        print(f"Probando {'(sin contraseña)' if pwd == '' else f'contraseña: {pwd}'}...", end=' ')
        connection = MySQLdb.connect(
            host='localhost',
            user='root',
            passwd=pwd,
            port=3306
        )
        print("✅ ¡CONEXIÓN EXITOSA!")
        working_password = pwd
        break
    except MySQLdb.Error:
        print("❌")
        continue

if not connection:
    print("\n❌ No se pudo conectar con contraseñas comunes.")
    print("\nPor favor, ejecuta manualmente desde MySQL Workbench:")
    print("CREATE DATABASE inventario_tisol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    sys.exit(1)

# Crear base de datos
try:
    cursor = connection.cursor()
    
    print("\n📊 Creando base de datos...")
    cursor.execute("CREATE DATABASE IF NOT EXISTS inventario_tisol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    print("✅ Base de datos 'inventario_tisol' creada")
    
    # Verificar
    cursor.execute("SHOW DATABASES LIKE 'inventario_tisol'")
    result = cursor.fetchone()
    
    if result:
        print(f"\n✨ ¡Configuración completada!")
        print(f"\n🔐 Credenciales detectadas:")
        print(f"   Usuario: root")
        print(f"   Contraseña: {'(vacía)' if working_password == '' else working_password}")
        print(f"   Puerto: 3306")
        print(f"   Base de datos: inventario_tisol")
        
        # Guardar en archivo temporal
        with open('mysql_config.txt', 'w') as f:
            f.write(f"DB_PASSWORD={working_password}\n")
        
        print(f"\n📝 Configuración guardada en mysql_config.txt")
    
    cursor.close()
    connection.close()
    
except MySQLdb.Error as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
