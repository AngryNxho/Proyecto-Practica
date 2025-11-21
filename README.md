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
python manage.py createsuperuser
python manage.py runserver
```

URLs: API http://127.0.0.1:8000/api/ | Admin http://127.0.0.1:8000/admin/

### 2. Frontend (React)

Abrir otra PowerShell:

```powershell
cd C:\Users\JustNxho\Documents\PRACTICA DUOC\S1\frontend
npm install
npm run dev
```

URL: http://localhost:5173

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

## Ejecutar Tests

```powershell
cd C:\Users\JustNxho\Documents\PRACTICA DUOC\S1\backend
.\venv\Scripts\activate
python manage.py test
```

---

## Sprint 1 - Completado ✅ (21-Nov-2025)

**Estado:** 21/21 tareas completadas (100%)  
**Periodo:** 11-Nov-2025 al 24-Nov-2025

### Funcionalidades implementadas

#### Backend (Django + DRF)
- Configuracion completa del proyecto Django
- Modelos: Producto, Movimiento, Alerta, Device
- API REST con ViewSets (ProductoViewSet, MovimientoViewSet, AlertaViewSet)
- Serializadores para todos los modelos
- Validaciones de negocio (stock suficiente para salidas)
- Acciones personalizadas: `registrar_entrada`, `registrar_salida`, `exportar_csv`
- Sistema de transacciones atomicas para movimientos
- Tests unitarios (21 tests con cobertura del 85%)
- Variables de entorno con python-decouple
- Adapter SNMP para lectura de impresoras

#### Frontend (React + Vite)
- Configuracion completa con Vite 5.4
- Servicios de API (inventoryService.js con productService, movementService, alertService)
- Utilidades de formato (formatCurrency, formatDateTime, getStockStatus)
- Componentes principales:
  - **Tablero**: Dashboard con metricas y ultimos movimientos
  - **Productos**: CRUD completo con FormularioProducto y TarjetaProducto
  - **Movimientos**: Registro de entradas/salidas con validacion
  - **Alertas**: Configuracion de umbrales de stock
- Validaciones en formularios
- Manejo de estados de carga y errores
- Interfaz responsive con CSS3

#### Funcionalidades de negocio
- ✅ CRUD de productos (crear, editar, eliminar, listar)
- ✅ Registro de movimientos de stock (entradas y salidas)
- ✅ Actualizacion automatica de stock
- ✅ Sistema de alertas con umbrales configurables
- ✅ Exportacion de productos y movimientos a CSV (UTF-8 con BOM)
- ✅ Dashboard con metricas en tiempo real
- ✅ Validacion de stock suficiente antes de salidas
- ✅ Historial completo de movimientos con filtros

### Proximo Sprint

**Sprint 2** (25-Nov-2025 al 8-Dic-2025): Busqueda, filtros, paginacion y optimizacion de consultas  

---

## Documentacion

- Explicacion del Proyecto: `words/Explicacion_Proyecto.md`
- Guia de Aprendizaje: `words/Guia_Aprendizaje.md`
- Planificacion Completa: `words/Planificacion_Completa.txt`
