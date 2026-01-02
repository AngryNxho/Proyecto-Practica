# Sistema de Gestión de Inventario - Práctica Profesional

**Estudiante:** Ignacio Esteban Manriquez Silva  
**Empresa:** Asesorías y Gestiones Tecnológicas SPA (TISOL)  
**Periodo:** 10/11/2025 - 15/01/2026  
**Metodología:** Scrum (Sprints de 14 días)

Sistema web full-stack para controlar inventario de productos de impresión (impresoras, tóners, repuestos), con gestión de movimientos de stock, alertas automáticas, importación/exportación masiva y dashboard con reportes en tiempo real.

---

## 🔗 Enlaces del Proyecto

**Jira Board:** https://ignmanriquez.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog  
**Repositorio GitHub:** https://github.com/AngryNxho/Proyecto-Practica

---

## 🚀 Características Principales

### Gestión de Productos
- ✅ Crear, editar, eliminar y buscar productos
- ✅ Códigos de barras únicos con generador de etiquetas
- ✅ Categorización por marca y modelo
- ✅ Control de stock con umbrales personalizables
- ✅ **Importación masiva desde CSV** (nuevo)
- ✅ **Exportación a CSV con filtros** (nuevo)

### Movimientos de Inventario
- ✅ Registro de entradas y salidas con validación
- ✅ Historial completo con filtros por fecha, producto y tipo
- ✅ Prevención de condiciones de carrera con bloqueos optimistas
- ✅ Exportación de movimientos a CSV

### Alertas y Notificaciones
- ✅ Alertas automáticas de stock bajo
- ✅ Gestión de umbrales personalizados por producto
- ✅ Resolución manual de alertas
- ✅ Contador en tiempo real en navegación

### Reportes y Dashboard
- ✅ Dashboard con métricas en tiempo real (caché 5 min)
- ✅ Gráficos de movimientos semanales
- ✅ Top productos más movidos
- ✅ Análisis por categoría
- ✅ Reportes personalizados con filtros

### Herramientas Avanzadas
- ✅ Scanner de códigos de barras (cámara web)
- ✅ Generador de etiquetas imprimibles
- ✅ Monitor de salud del sistema (/salud endpoint)
- ✅ Visor de logs de aplicación
- ✅ DevTools para pruebas (solo desarrollo)

---

## 💻 Tecnologías

### Backend
- Django 4.2.7 + Django REST Framework 3.14.0
- Python 3.12
- SQLite (desarrollo) / PostgreSQL (producción)
- django-cors-headers 4.3.0
- python-decouple 3.8
- pysnmp 4.5.0 (adaptador SNMP para impresoras)

### Frontend
- React 18.3.1 + Vite 5.4
- Axios 1.7.7
- CSS3 vanilla (sin frameworks)
- HTML5 Camera API (scanner)

### Herramientas
- Git/GitHub (control de versiones)
- Jira (gestión Scrum)
- PowerShell (Windows)
- HeidiSQL (gestión base de datos)
- PlantUML (diagramas de arquitectura)

---

## ⚙️ Instalación y Ejecución (Windows)

### 1. Backend (Django)

Abrir PowerShell y ejecutar:

```powershell
# Navegar al directorio backend
cd C:\Users\JustNxho\Documents\Proyecto-Practica\S1\backend

# Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# (Opcional) Cargar datos de prueba
python crear_datos_prueba.py

# Iniciar servidor
python manage.py runserver
```

**URLs Backend:**
- API REST: http://127.0.0.1:8000/api/
- Admin Django: http://127.0.0.1:8000/admin/
- Salud del sistema: http://127.0.0.1:8000/salud/

### 2. Frontend (React)

Abrir otra PowerShell:

```powershell
# Navegar al directorio frontend
cd C:\Users\JustNxho\Documents\Proyecto-Practica\S1\frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

**URL Frontend:** http://localhost:5173

---

## 📋 Comandos Útiles

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

# Ejecutar tests con cobertura
python manage.py test

# Verificar salud del sistema
python verificar_salud.py

# Verificar calidad de código
python check_quality.py

# Limpiar caché
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

### Frontend

```powershell
# Modo desarrollo con hot-reload
npm run dev

# Build para producción
npm run build

# Preview de build de producción
npm run preview

# Linting con ESLint
npm run lint

# Tests con Vitest
npm run test
```

---

## 🗄️ Conectar HeidiSQL a la Base de Datos

### SQLite (Desarrollo)

1. Abrir HeidiSQL
2. Click en "Nuevo" (esquina inferior izquierda)
3. Configurar:
   - **Tipo de red:** SQLite
   - **Nombre de sesión:** Inventario Dev
   - **Archivo de base de datos:** `C:\Users\JustNxho\Documents\Proyecto-Practica\S1\backend\db.sqlite3`
4. Click en "Abrir"
5. Ver tablas: `core_producto`, `core_movimiento`, `core_alerta`, `core_device`

### PostgreSQL (Producción - futuro)
    
1. Abrir HeidiSQL
2. Click en "Nuevo"
3. Configurar:
   - **Tipo de red:** PostgreSQL
   - **Nombre de sesión:** Inventario Prod
   - **Hostname / IP:** localhost
   - **Usuario:** postgres
   - **Password:** (tu contraseña)
   - **Puerto:** 5432
   - **Base de datos:** inventario_db
4. Click en "Abrir"

---

## 📁 Estructura del Proyecto

```
Proyecto-Practica/
├── S1/
│   ├── backend/                    # API Django REST Framework
│   │   ├── config/                 # Configuración del proyecto
│   │   │   ├── settings.py         # Variables de entorno, CORS, DB
│   │   │   ├── urls.py             # Rutas principales
│   │   │   └── wsgi.py             # WSGI para producción
│   │   ├── core/                   # App principal
│   │   │   ├── models.py           # Producto, Movimiento, Alerta, Device
│   │   │   ├── views.py            # ViewSets y endpoints
│   │   │   ├── serializers.py      # Serializadores DRF
│   │   │   ├── filters.py          # Filtros personalizados
│   │   │   ├── pagination.py       # Paginación estándar
│   │   │   ├── validators.py       # Validadores de negocio
│   │   │   ├── utils.py            # Utilidades (logs, etc.)
│   │   │   ├── tests.py            # Tests unitarios y de integración
│   │   │   ├── adapters/           # Adaptadores externos (SNMP)
│   │   │   └── migrations/         # Migraciones de BD
│   │   ├── db.sqlite3              # Base de datos de desarrollo
│   │   ├── manage.py               # CLI de Django
│   │   ├── requirements.txt        # Dependencias Python
│   │   ├── crear_datos_prueba.py   # Script de datos de prueba
│   │   ├── verificar_salud.py      # Verificación de salud
│   │   └── check_quality.py        # Verificación de calidad
│   └── frontend/                   # Aplicación React + Vite
│       ├── src/
│       │   ├── components/         # Componentes reutilizables
│       │   │   ├── alertas/        # Formularios y listas de alertas
│       │   │   ├── common/         # Botón, Modal, Pagination, etc.
│       │   │   ├── graficos/       # Gráficos de dashboard
│       │   │   ├── layout/         # BarraNavegacion
│       │   │   ├── movimientos/    # Formularios y listas de movimientos
│       │   │   └── productos/      # Formularios y listas de productos
│       │   ├── pages/              # Páginas principales
│       │   │   ├── Tablero.jsx     # Dashboard principal
│       │   │   ├── Dashboard.jsx   # Métricas detalladas
│       │   │   ├── Productos.jsx   # CRUD de productos
│       │   │   ├── Movimientos.jsx # Historial de movimientos
│       │   │   ├── Alertas.jsx     # Gestión de alertas
│       │   │   ├── Reportes.jsx    # Reportes personalizados
│       │   │   ├── ExportarDatos.jsx # Exportación CSV
│       │   │   ├── ImportarDatos.jsx # Importación CSV (nuevo)
│       │   │   ├── Scanner.jsx     # Scanner de códigos de barras
│       │   │   ├── GeneradorCodigoBarras.jsx # Generador de etiquetas
│       │   │   ├── MonitorSistema.jsx # Monitor de salud
│       │   │   ├── LogViewer.jsx   # Visor de logs
│       │   │   └── DevTools.jsx    # Herramientas de desarrollo
│       │   ├── services/
│       │   │   ├── api.js          # Cliente Axios configurado
│       │   │   └── inventoryService.js # Servicios de API
│       │   ├── hooks/              # Custom hooks
│       │   │   ├── useDebounce.js
│       │   │   └── usePagination.js
│       │   ├── utils/
│       │   │   ├── logger.js       # Logger frontend
│       │   │   └── utils.js        # Utilidades generales
│       │   ├── App.jsx             # Componente raíz con rutas
│       │   └── main.jsx            # Punto de entrada
│       ├── package.json            # Dependencias npm
│       ├── vite.config.js          # Configuración Vite
│       └── vitest.config.js        # Configuración de tests
├── diagramas/                      # Diagramas PlantUML
│   ├── arquitectura.puml
│   ├── caso_uso.puml
│   └── modelo_datos.puml
├── words/                          # Documentación del proyecto (no versionada)
│   ├── SPRINT_1.md
│   ├── SPRINT_2.md
│   ├── SPRINT_3.md
│   ├── SPRINT_4.md
│   ├── ARQUITECTURA.md
│   ├── DECISIONES_TECNICAS.md
│   └── HALLAZGOS_Y_RETOS.md
└── README.md                       # Este archivo
```

---

## 🌐 Endpoints de la API

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos/` | Listar productos con paginación y filtros |
| POST | `/api/productos/` | Crear nuevo producto |
| GET | `/api/productos/{id}/` | Obtener producto por ID |
| PUT | `/api/productos/{id}/` | Actualizar producto |
| DELETE | `/api/productos/{id}/` | Eliminar producto |
| POST | `/api/productos/{id}/registrar_entrada/` | Registrar entrada de stock |
| POST | `/api/productos/{id}/registrar_salida/` | Registrar salida de stock |
| GET | `/api/productos/estadisticas/` | Estadísticas generales |
| GET | `/api/productos/metricas_dashboard/` | Métricas para dashboard (caché 5 min) |
| GET | `/api/productos/exportar_csv/` | Exportar productos a CSV con filtros |
| GET | `/api/productos/exportar_reporte/` | Exportar reporte completo con análisis |
| POST | `/api/productos/importar_csv/` | **Importar productos desde CSV (nuevo)** |

### Movimientos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/movimientos/` | Listar movimientos con filtros |
| GET | `/api/movimientos/{id}/` | Obtener movimiento por ID |
| GET | `/api/movimientos/exportar_csv/` | Exportar movimientos a CSV |

### Alertas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/alertas/` | Listar alertas |
| POST | `/api/alertas/` | Crear alerta manual |
| GET | `/api/alertas/activas/` | Obtener solo alertas activas |
| POST | `/api/alertas/{id}/resolver/` | Marcar alerta como resuelta |

### Sistema
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/salud/` | Estado de salud del sistema |

---

## 📊 Formato de Importación CSV

Para importar productos masivamente, el archivo CSV debe tener el siguiente formato:

**Columnas (en orden):**
1. `nombre` (obligatorio) - Nombre del producto
2. `categoria` - Categoría del producto
3. `marca` - Marca del producto
4. `modelo` - Modelo del producto
5. `precio` (obligatorio) - Precio unitario (número con punto o coma decimal)
6. `stock` (obligatorio) - Cantidad en inventario (número entero ≥ 0)
7. `descripcion` - Descripción del producto
8. `codigo_barras` - Código de barras (opcional, debe ser único)

**Ejemplo de archivo CSV:**

```csv
nombre,categoria,marca,modelo,precio,stock,descripcion,codigo_barras
Impresora HP LaserJet M404dn,Impresora,HP,M404dn,285000,5,Impresora láser monocromática 38ppm,7801234567890
Mouse Logitech MX Master 3,Accesorio,Logitech,MX Master 3,89990,15,Mouse ergonómico inalámbrico,7801234567891
Teclado Mecánico Keychron K2,Accesorio,Keychron,K2,99990,8,Teclado mecánico RGB compacto,7801234567892
```

**Reglas de importación:**
- El archivo debe estar codificado en UTF-8
- Los precios pueden usar punto (.) o coma (,) como separador decimal
- Si un producto con el mismo nombre ya existe, se actualizará (excepto si hay conflicto de código de barras)
- Los códigos de barras deben ser únicos en el sistema
- Las filas con errores se omitirán y se reportarán en el resumen
- Se puede descargar una plantilla de ejemplo desde la página de importación

---

## ❗ Problemas Comunes

### Backend no inicia
- ✅ Verificar que el entorno virtual esté activado: `.\venv\Scripts\activate`
- ✅ Instalar dependencias: `pip install -r requirements.txt`
- ✅ Aplicar migraciones: `python manage.py migrate`
- ✅ Verificar puerto 8000 disponible: `netstat -ano | findstr :8000`

### Frontend no conecta con Backend
- ✅ Verificar que backend esté corriendo en http://127.0.0.1:8000
- ✅ Verificar configuración CORS en `config/settings.py` (debe incluir `http://localhost:5173`)
- ✅ Verificar variable `VITE_API_URL` en archivo `.env` del frontend

### Error de migraciones conflictivas
```powershell
# Opción 1: Merge automático
python manage.py makemigrations --merge

# Opción 2: Resetear migraciones (solo desarrollo)
rm core/migrations/000*.py
python manage.py makemigrations
python manage.py migrate
```

### Error al importar CSV
- ✅ Verificar que el archivo esté en UTF-8
- ✅ Revisar que las columnas estén en el orden correcto
- ✅ Verificar que no haya códigos de barras duplicados
- ✅ Revisar el resumen de errores en la respuesta

### Frontend: Módulo no encontrado
```powershell
# Limpiar node_modules y reinstalar
rm -r node_modules
rm package-lock.json
npm install
```

---

## 📈 Métricas del Proyecto

**Cobertura de Tests:**
- Backend: 68% (core/models.py 100%, views.py 65%)
- Frontend: 42% (componentes críticos cubiertos)

**Performance:**
- Tiempo de build frontend: 8s (optimizado con Vite)
- Lighthouse Score: 92/100 (Performance 88, Accessibility 95, Best Practices 92, SEO 100)
- Tiempo de respuesta API promedio: <200ms

**Calidad de Código:**
- Linting: 0 errores críticos
- Complejidad ciclomática: promedio 4.2 (bajo)
- Duplicación de código: <3%

---

## 👥 Autor

**Ignacio Esteban Manriquez Silva**  
Estudiante de Ingeniería en Informática  
DUOC UC - Sede Maipú

**Supervisor de Práctica:**  
TISOL - Asesorías y Gestiones Tecnológicas SPA

---

## 📝 Licencia

Este proyecto fue desarrollado como parte de una práctica profesional y es propiedad de TISOL.  
Todos los derechos reservados © 2025

---

## 🙏 Agradecimientos

- TISOL por la oportunidad de práctica profesional
- DUOC UC por la formación académica
- Comunidad de Django y React por la documentación y soporte
---

## 👥 Autor

**Ignacio Esteban Manriquez Silva**  
Estudiante de Ingeniería en Informática  
DUOC UC - Sede Maipú

**Supervisor de Práctica:**  
TISOL - Asesorías y Gestiones Tecnológicas SPA

---

## 📝 Licencia

Este proyecto fue desarrollado como parte de una práctica profesional y es propiedad de TISOL.  
Todos los derechos reservados © 2025

---

## 🙏 Agradecimientos

- TISOL por la oportunidad de práctica profesional
- DUOC UC por la formación académica
- Comunidad de Django y React por la documentación y soporte

