# Sistema de Gestion de Inventario - Practica Profesional

**Estudiante:** Ignacio Esteban Manriquez Silva  
**Empresa:** Asesorias y Gestiones Tecnologicas SPA (TISOL)  
**Periodo:** 10/11/2025 - 15/01/2026  
**Metodologia:** Scrum (Sprints de 14 dias)  
**Ultima actualizacion:** 03/12/2025 - 16:40

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
