# Backend S1 - Django REST API

## Requisitos
- Python 3.10+
- pip

## Instalación

```powershell
cd S1/backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Migraciones

```powershell
python manage.py migrate
```

## Ejecutar servidor

```powershell
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

## Crear superusuario (opcional)

```powershell
python manage.py createsuperuser
```

Admin panel: `http://localhost:8000/admin`
