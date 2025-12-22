# Documentación de Componentes - Frontend

## Estructura de Carpetas

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   ├── productos/       # Componentes de productos
│   ├── movimientos/     # Componentes de movimientos
│   ├── alertas/         # Componentes de alertas
│   ├── graficos/        # Gráficos y visualizaciones
│   └── layout/          # Layout y navegación
├── pages/               # Páginas principales
├── services/            # Servicios API
├── utils/               # Utilidades y helpers
└── styles/              # Estilos CSS
```

## Componentes Comunes

### Badge
Componente para mostrar etiquetas de estado.

```jsx
import Badge from './components/common/Badge';

<Badge tipo="success">Activo</Badge>
<Badge tipo="warning">Pendiente</Badge>
<Badge tipo="danger">Crítico</Badge>
```

Props:
- `tipo`: 'success' | 'warning' | 'danger' | 'info'
- `children`: Texto a mostrar

### Boton
Botón personalizado con variantes.

```jsx
import Boton from './components/common/Boton';

<Boton variante="primary" onClick={handleClick}>
  Guardar
</Boton>
```

Props:
- `variante`: 'primary' | 'secondary' | 'danger'
- `onClick`: Función manejadora
- `deshabilitado`: boolean
- `cargando`: boolean

### CampoTexto
Input de texto con validación.

```jsx
import CampoTexto from './components/common/CampoTexto';

<CampoTexto
  etiqueta="Nombre"
  valor={nombre}
  onChange={setNombre}
  error={errorNombre}
  requerido
/>
```

Props:
- `etiqueta`: Label del campo
- `valor`: Valor actual
- `onChange`: Callback al cambiar
- `error`: Mensaje de error
- `tipo`: 'text' | 'number' | 'email'
- `requerido`: boolean

### Modal
Modal reutilizable para formularios.

```jsx
import Modal from './components/common/Modal';

<Modal
  estaAbierto={mostrarModal}
  alCerrar={() => setMostrarModal(false)}
  titulo="Nuevo Producto"
>
  <FormularioProducto />
</Modal>
```

### Pagination
Componente de paginación.

```jsx
import Pagination from './components/common/Pagination';

<Pagination
  paginaActual={pagina}
  totalPaginas={10}
  onCambioPagina={setPagina}
/>
```

## Componentes de Productos

### TarjetaProducto
Muestra información de un producto.

```jsx
import TarjetaProducto from './components/productos/TarjetaProducto';

<TarjetaProducto
  producto={producto}
  alerta={alerta}
  alEditar={handleEditar}
  alEliminar={handleEliminar}
  alRegistrarMovimiento={handleMovimiento}
/>
```

Props:
- `producto`: Objeto con datos del producto
- `alerta`: Alerta asociada (opcional)
- `alEditar`: Callback para editar
- `alEliminar`: Callback para eliminar
- `alRegistrarMovimiento`: Callback para movimientos

### FormularioProducto
Formulario para crear/editar productos.

```jsx
import FormularioProducto from './components/productos/FormularioProducto';

<FormularioProducto
  productoInicial={producto}
  alGuardar={handleGuardar}
  alCancelar={handleCancelar}
/>
```

### ListaProductos
Lista con grid de productos.

```jsx
import ListaProductos from './components/productos/ListaProductos';

<ListaProductos
  productos={productos}
  cargando={cargando}
  onEditar={handleEditar}
  onEliminar={handleEliminar}
/>
```

## Componentes de Movimientos

### ModalRegistroMovimiento
Modal para registrar entradas/salidas.

```jsx
import ModalRegistroMovimiento from './components/movimientos/ModalRegistroMovimiento';

<ModalRegistroMovimiento
  estaAbierto={abierto}
  alCerrar={cerrar}
  producto={producto}
  tipo="entrada"
  alGuardar={handleGuardar}
/>
```

Props:
- `tipo`: 'entrada' | 'salida'

### ModalDetalleMovimiento
Ver detalles de un movimiento.

```jsx
import ModalDetalleMovimiento from './components/movimientos/ModalDetalleMovimiento';

<ModalDetalleMovimiento
  movimiento={movimiento}
  estaAbierto={abierto}
  alCerrar={cerrar}
/>
```

### TablaMovimientos
Tabla de historial de movimientos.

```jsx
import TablaMovimientos from './components/movimientos/TablaMovimientos';

<TablaMovimientos
  movimientos={movimientos}
  onVerDetalle={handleDetalle}
/>
```

## Componentes de Alertas

### ListaAlertas
Lista de alertas activas.

```jsx
import ListaAlertas from './components/alertas/ListaAlertas';

<ListaAlertas
  alertas={alertas}
  onResolver={handleResolver}
/>
```

### ItemAlerta
Item individual de alerta.

```jsx
import ItemAlerta from './components/alertas/ItemAlerta';

<ItemAlerta
  alerta={alerta}
  onResolver={handleResolver}
  onIrProducto={handleIrProducto}
/>
```

## Páginas Principales

### Dashboard
Página principal con estadísticas.

Ruta: `/`

Muestra:
- Total de productos
- Alertas activas
- Valor total del inventario
- Movimientos recientes
- Gráficos de stock por categoría

### Productos
Gestión de productos.

Ruta: `/productos`

Funcionalidades:
- Listar productos con filtros
- Crear nuevo producto
- Editar producto existente
- Eliminar producto
- Registrar movimientos rápidos

### Movimientos
Historial de movimientos.

Ruta: `/movimientos`

Muestra:
- Tabla de movimientos
- Filtros por tipo, producto, fecha
- Estadísticas de entradas/salidas
- Detalles de cada movimiento

### Alertas
Gestión de alertas.

Ruta: `/alertas`

Funcionalidades:
- Lista de alertas activas
- Resolver alertas
- Ver productos con stock bajo
- Configurar umbrales

### GeneradorCodigoBarras
Generar etiquetas imprimibles.

Ruta: `/etiquetas`

Funcionalidades:
- Seleccionar producto
- Generar código de barras CODE128
- Generar código QR
- Vista previa de etiqueta
- Imprimir etiqueta

## Servicios

### api.js
Cliente Axios configurado.

```javascript
import api from './services/api';

const response = await api.get('/productos/');
```

### inventoryService.js
Servicio para operaciones de inventario.

```javascript
import { productService } from './services/inventoryService';

// Listar productos
const productos = await productService.obtenerTodos();

// Crear producto
const nuevo = await productService.crear(datos);

// Actualizar
await productService.actualizar(id, datos);

// Eliminar
await productService.eliminar(id);
```

## Utilidades

### utils.js
Funciones helper.

```javascript
import { formatCurrency, formatDateTime } from './utils/utils';

const precio = formatCurrency(25000); // "$25.000"
const fecha = formatDateTime(isoDate); // "22 dic 2025, 14:30"
```

Funciones disponibles:
- `formatCurrency(numero)` - Formato moneda chilena
- `formatDateTime(isoString)` - Formato fecha/hora
- `getStockStatus(stock, umbral)` - Estado del stock
- `getStockLabel(estado)` - Etiqueta de estado

## Testing

Ejecutar tests:
```bash
npm test              # Una vez
npm run test:watch    # Modo watch
```

Tests ubicados en:
- `src/components/**/__tests__/*.test.jsx`
- `src/utils/__tests__/*.test.js`
