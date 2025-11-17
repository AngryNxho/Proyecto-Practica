# Sistema de Inventario - Backend

API REST desarrollada con Django REST Framework para la gestión de inventario de impresoras y toners.

## Instalación

### 1. Crear entorno virtual
```bash
python -m venv venv
```

### 2. Activar entorno virtual
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
Copiar `.env.example` a `.env` y configurar valores:
```bash
cp .env.example .env
```

### 5. Aplicar migraciones
```bash
python manage.py migrate
```

### 6. Ejecutar servidor
```bash
python manage.py runserver
```

## Endpoints de la API

- `GET /api/productos/` - Listar productos
- `POST /api/productos/` - Crear producto
- `GET /api/productos/{id}/` - Obtener producto
- `PUT /api/productos/{id}/` - Actualizar producto
- `DELETE /api/productos/{id}/` - Eliminar producto
- `POST /api/productos/{id}/registrar_entrada/` - Registrar entrada de stock
- `POST /api/productos/{id}/registrar_salida/` - Registrar salida de stock
- `GET /api/movimientos/` - Listar movimientos
- `GET /api/alertas/` - Listar alertas

## Estructura

```
backend/
├── config/          # Configuración del proyecto Django
├── core/            # App principal
│   ├── models.py    # Modelos (Producto, Movimiento, Alerta)
│   ├── serializers.py  # Serializers DRF
│   ├── views.py     # Vistas API
│   └── urls.py      # URLs de la app
├── manage.py        # Comando de administración Django
├── requirements.txt # Dependencias
└── .env            # Variables de entorno (no versionado)
```

## Tecnologías

- Django 4.2.7
- Django REST Framework 3.14.0
- python-decouple 3.8
- django-cors-headers 4.3.0
- SQLite (desarrollo)
