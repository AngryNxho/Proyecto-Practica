# Sistema de Inventario - Frontend

Aplicación web desarrollada con React y Vite para la gestión visual del inventario.

## Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copiar `.env.example` a `.env`:
```bash
cp .env.example .env
```

El archivo debe contener:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 3. Ejecutar servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Scripts disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Vista previa de producción
- `npm run lint` - Ejecutar ESLint

## Estructura

```
frontend/
├── src/
│   ├── components/      # Componentes React
│   │   ├── ProductoList.jsx
│   │   └── ProductoList.css
│   ├── services/        # Servicios de API
│   │   ├── api.js
│   │   └── inventarioService.js
│   ├── App.jsx         # Componente principal
│   ├── App.css         # Estilos globales
│   └── main.jsx        # Punto de entrada
├── public/             # Archivos estáticos
├── index.html          # HTML base
├── package.json        # Dependencias
└── .env               # Variables de entorno (no versionado)
```

## Componentes principales

### ProductoList
Muestra la lista de productos en una tabla con:
- Información detallada de cada producto
- Indicadores visuales de stock (bajo en rojo, normal en verde)
- Precios formateados en pesos chilenos
- Contador de productos
- Manejo de estados de carga y errores

## Tecnologías

- React 18.3.1
- Vite 5.4.10
- Axios 1.7.7
- CSS moderno

## Configuración de la API

La URL del backend se configura en el archivo `.env`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Si no se define, se usa `http://127.0.0.1:8000/api` por defecto.
