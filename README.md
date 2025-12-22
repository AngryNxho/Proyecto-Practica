# Sistema de Gestion de Inventario - Practica Profesional

**Estudiante:** Ignacio Esteban Manriquez Silva  
**Empresa:** Asesorias y Gestiones Tecnologicas SPA (TISOL)  
**Periodo:** 10/11/2025 - 15/01/2026  
**Metodologia:** Scrum (Sprints de 14 dias)

Sistema web full-stack para controlar inventario de productos de impresion (impresoras, toners, repuestos), con gestion de movimientos de stock, alertas automaticas y dashboard con reportes.

---

## Enlaces del Proyecto

**Jira Board:** https://ignmanriquez.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog  
**Repositorio GitHub:** https://github.com/AngryNxho/Proyecto-Practica

---

## Tecnologias

### Backend
- Django 4.2.7 + Django REST Framework 3.14.0
- Python 3.12
- SQLite (desarrollo) / PostgreSQL (produccion)
- django-cors-headers 4.3.0
- python-decouple 3.8
- pysnmp 4.5.0 (adaptador SNMP para impresoras)

### Frontend
- React 18.3.1 + Vite 5.4
- Axios 1.7.7
- CSS3 (sin frameworks)

### Herramientas
- Git/GitHub
- Jira (gestion Scrum)
- PowerShell (Windows)
- HeidiSQL (gestion base de datos)

---

## Instalacion y Ejecucion (Windows)

### 1. Backend (Django)

Abrir PowerShell y ejecutar:

```powershell
cd C:\Users\JustNxho\Documents\PRACTICA DUOC\S1\backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**URLs Backend:**
- API REST: http://127.0.0.1:8000/api/
- Admin Django: http://127.0.0.1:8000/admin/
- Documentacion API: http://127.0.0.1:8000/api/productos/

**Cargar datos de prueba (opcional):**
```powershell
python crear_datos_prueba.py
```

### 2. Frontend (React)

Abrir otra PowerShell:

```powershell
cd C:\Users\JustNxho\Documents\PRACTICA DUOC\S1\frontend
npm install
npm run dev
```

**URL Frontend:** http://localhost:5173

---

## Comandos Utiles

### Backend

```powershell
# Activar entorno virtual
.\venv\Scripts\activate

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar tests
python manage.py test

# Verificar salud del sistema
python verificar_salud.py

# Verificar calidad de codigo
python check_quality.py

# Limpiar cache
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

### Frontend

```powershell
# Modo desarrollo
npm run dev

# Build para produccion
npm run build

# Preview de build
npm run preview

# Linting
npm run lint
```

---

## Conectar HeidiSQL a la Base de Datos

### SQLite (Desarrollo)

1. Abrir HeidiSQL
2. Click en "Nuevo" (esquina inferior izquierda)
3. Configurar:
   - **Tipo de red:** SQLite
   - **Nombre de sesion:** Inventario Dev
   - **Archivo de base de datos:** `C:\Users\JustNxho\Documents\PRACTICA DUOC\S1\backend\db.sqlite3`
4. Click en "Abrir"
5. Ver tablas: `core_producto`, `core_movimiento`, `core_alerta`, `core_device`

### PostgreSQL (Produccion - futuro)
    
1. Abrir HeidiSQL
2. Click en "Nuevo"
3. Configurar:
   - **Tipo de red:** PostgreSQL
   - **Nombre de sesion:** Inventario Prod
   - **Hostname / IP:** localhost
   - **Usuario:** postgres
   - **Password:** (tu password)
   - **Puerto:** 5432
   - **Base de datos:** inventario_db
4. Click en "Abrir"

---

## Estructura del Proyecto

```
PRACTICA DUOC/
├── S1/
│   ├── backend/          # API Django REST Framework
│   │   ├── config/       # Configuracion del proyecto
│   │   ├── core/         # App principal
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── tests.py
│   │   │   └── utils.py
│   │   ├── db.sqlite3
│   │   ├── manage.py
│   │   └── requirements.txt
│   └── frontend/         # Aplicacion React
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── utils/
│       ├── package.json
│       └── vite.config.js
├── diagramas/            # Diagramas PlantUML
├── words/                # Documentacion del proyecto
└── README.md
```

---

## Endpoints Principales

### Productos
- `GET /api/productos/` - Listar productos
- `POST /api/productos/` - Crear producto
- `GET /api/productos/{id}/` - Obtener producto
- `PUT /api/productos/{id}/` - Actualizar producto
- `DELETE /api/productos/{id}/` - Eliminar producto
- `POST /api/productos/{id}/registrar_entrada/` - Registrar entrada
- `POST /api/productos/{id}/registrar_salida/` - Registrar salida
- `GET /api/productos/estadisticas/` - Estadisticas generales
- `GET /api/productos/metricas_dashboard/` - Metricas para dashboard
- `GET /api/productos/exportar_csv/` - Exportar a CSV

### Movimientos
- `GET /api/movimientos/` - Listar movimientos
- `GET /api/movimientos/{id}/` - Obtener movimiento
- `GET /api/movimientos/exportar_csv/` - Exportar a CSV

### Alertas
- `GET /api/alertas/` - Listar alertas
- `POST /api/alertas/` - Crear alerta
- `GET /api/alertas/activas/` - Alertas activas
- `POST /api/alertas/{id}/resolver/` - Resolver alerta

---

## Problemas Comunes

### Backend no inicia
- Verificar que el entorno virtual este activado
- Verificar que todas las dependencias esten instaladas: `pip install -r requirements.txt`
- Verificar migraciones: `python manage.py migrate`

### Frontend no conecta con Backend
- Verificar que el backend este corriendo en puerto 8000
- Verificar configuracion CORS en `config/settings.py`
- Verificar URL de API en frontend: `src/services/api.js`

### Error de migraciones
```powershell
# Eliminar migraciones conflictivas
rm core/migrations/000*.py
python manage.py makemigrations
python manage.py migrate
```
