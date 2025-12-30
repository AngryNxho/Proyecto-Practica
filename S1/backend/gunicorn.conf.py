"""
Configuración de Gunicorn para producción
Archivo: gunicorn.conf.py
"""
import multiprocessing

# Bind
bind = "0.0.0.0:8000"

# Workers
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = "/var/log/inventario/gunicorn_access.log"
errorlog = "/var/log/inventario/gunicorn_error.log"
loglevel = "info"

# Process naming
proc_name = "inventario_backend"

# Server mechanics
daemon = False
pidfile = "/var/run/inventario/gunicorn.pid"
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (si se usa directamente)
# keyfile = "/path/to/key.pem"
# certfile = "/path/to/cert.pem"

# Seguridad
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
