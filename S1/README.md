# S1 - Estructura Base Fullstack

Proyecto fullstack con Django REST Framework (backend) y React + Vite (frontend).

## Estructura

```
S1/
├── backend/          # Django REST API
│   ├── config/       # Configuración Django
│   ├── core/         # App principal
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/         # React + Vite
    ├── src/
    ├── index.html
    └── package.json
```

## Setup Rápido

### Backend

```powershell
cd S1/backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Servidor: `http://localhost:8000`

### Frontend

```powershell
cd S1/frontend
npm install
npm run dev
```

Servidor: `http://localhost:5173`

## Tecnologías

**Backend:**
- Django 4.2.7
- Django REST Framework 3.14.0
- django-cors-headers
- PostgreSQL (psycopg2)

**Frontend:**
- React 18.2
- Vite 5.0
- React Router 6.20
- Axios 1.6

## Plan de Desarrollo

Ver `day1_tasks.csv` para tareas y cronograma.

## Día 1 - Completado ✅

- Estructura base de carpetas
- Proyecto Django configurado (CORS, DRF)
- Frontend Vite+React inicializado
- Archivos .gitignore
- READMEs con instrucciones
