# Sistema de Inventario - TISOL

Sistema web para la gestión de inventario de impresoras y toners, desarrollado con Django REST Framework y React.

## 📋 Descripción

Aplicación web diseñada para llevar el control de productos (impresoras y toners), gestionar movimientos de stock (entradas y salidas), y generar alertas automáticas cuando el inventario está bajo.

## 🎯 Características Principales

- ✅ Gestión completa de productos (CRUD)
- ✅ Control de movimientos de stock (entradas/salidas)
- ✅ Sistema de alertas automáticas por stock bajo
- ✅ Interfaz moderna y responsiva
- ✅ API REST con Django REST Framework
- ✅ Base de datos SQLite (desarrollo)

## 🛠️ Tecnologías Utilizadas

### Backend
- Python 3.10+
- Django 4.2.7
- Django REST Framework 3.14.0
- SQLite (desarrollo)
- python-decouple 3.8 (gestión de variables de entorno)

### Frontend
- React 18.3.1
- Vite 5.4.10
- Axios 1.7.7
- CSS moderno

## 📁 Estructura del Proyecto

```
S1/
├── backend/               # Servidor Django
│   ├── config/           # Configuración del proyecto
│   ├── core/             # App principal (modelos, vistas, serializers)
│   ├── manage.py         # Comando de administración Django
│   ├── requirements.txt  # Dependencias Python
│   ├── .env             # Variables de entorno (no versionado)
│   └── .env.example     # Plantilla de variables de entorno
│
└── frontend/             # Aplicación React
    ├── src/
    │   ├── components/  # Componentes React
    │   ├── services/    # Servicios API
    │   └── App.jsx      # Componente principal
    ├── package.json     # Dependencias Node
    ├── .env            # Variables de entorno (no versionado)
    └── .env.example    # Plantilla de variables de entorno
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.10 o superior
- Node.js 18 o superior
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/AngryNxho/Proyecto-Practica.git
cd Proyecto-Practica/S1
```

### 2. Configurar el Backend

#### a) Crear entorno virtual

```bash
cd backend
python -m venv venv
```

#### b) Activar entorno virtual

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

#### c) Instalar dependencias

```bash
pip install -r requirements.txt
```

#### d) Configurar variables de entorno

Copiar el archivo de ejemplo y configurar tus valores:

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Configuración de Django
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos
DATABASE_URL=sqlite:///db.sqlite3

# CORS (URLs permitidas para el frontend)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### e) Aplicar migraciones

```bash
python manage.py migrate
```

#### f) Crear superusuario (opcional)

```bash
python manage.py createsuperuser
```

#### g) Ejecutar el servidor

```bash
python manage.py runserver
```

El backend estará disponible en: `http://127.0.0.1:8000`

### 3. Configurar el Frontend

#### a) Instalar dependencias

```bash
cd ../frontend
npm install
```

#### b) Configurar variables de entorno

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

El archivo `.env` debe contener:

```env
# URL del Backend API
VITE_API_URL=http://127.0.0.1:8000/api
```

#### c) Ejecutar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🧪 Pruebas

### Probar la API directamente

Puedes acceder a los endpoints de la API en:

- Productos: `http://127.0.0.1:8000/api/productos/`
- Movimientos: `http://127.0.0.1:8000/api/movimientos/`
- Alertas: `http://127.0.0.1:8000/api/alertas/`

### Panel de administración de Django

Accede al panel de administración en: `http://127.0.0.1:8000/admin/`

## 📊 Modelos de Datos

### Producto
- `nombre`: Nombre del producto
- `marca`: Marca del producto
- `modelo`: Modelo del producto
- `categoria`: Categoría (Impresora/Toner)
- `stock`: Cantidad disponible
- `stock_minimo`: Umbral para alertas
- `precio`: Precio unitario

### Movimiento
- `producto`: Relación con Producto
- `tipo`: Entrada o Salida
- `cantidad`: Cantidad del movimiento
- `fecha`: Fecha del movimiento
- `descripcion`: Descripción opcional

### Alerta
- `producto`: Relación con Producto
- `nivel`: Bajo, Crítico
- `mensaje`: Mensaje de alerta
- `activa`: Estado de la alerta
- `fecha_creacion`: Fecha de creación

## 🔧 Comandos Útiles

### Backend

```bash
# Crear migraciones después de modificar modelos
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar shell de Django
python manage.py shell

# Ejecutar servidor
python manage.py runserver
```

### Frontend

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 📝 Variables de Entorno

### Backend (.env)
- `SECRET_KEY`: Clave secreta de Django
- `DEBUG`: Modo debug (True/False)
- `ALLOWED_HOSTS`: Hosts permitidos separados por coma
- `DATABASE_URL`: URL de conexión a base de datos
- `CORS_ALLOWED_ORIGINS`: URLs permitidas para CORS

### Frontend (.env)
- `VITE_API_URL`: URL del backend API

## 🚀 Despliegue

### Backend
1. Cambiar `DEBUG=False` en `.env`
2. Configurar `ALLOWED_HOSTS` con el dominio de producción
3. Cambiar a base de datos PostgreSQL
4. Configurar archivos estáticos con `collectstatic`
5. Usar servidor WSGI como Gunicorn

### Frontend
1. Ejecutar `npm run build`
2. Desplegar carpeta `dist/` en servidor web
3. Configurar `VITE_API_URL` con URL de producción

## 👥 Autor

**Ignacio Esteban Manríquez Silva**
- Estudiante de Ingeniería en Informática
- DUOC UC
- Práctica Profesional en TISOL

## 📄 Licencia

Este proyecto fue desarrollado como parte de la práctica profesional en TISOL (Asesorías y Gestiones Tecnológicas SPA).

## 🤝 Contribuciones

Este es un proyecto de práctica profesional. Para consultas o sugerencias, contactar al autor.

---

**Fecha de desarrollo:** Noviembre 2024 - Enero 2025  
**Empresa:** TISOL - Asesorías y Gestiones Tecnológicas SPA  
**Supervisor:** Francisco Seminario
