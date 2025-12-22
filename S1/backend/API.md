# Documentación API REST - Sistema de Inventario

Base URL: `http://127.0.0.1:8000/api/`

## Endpoints de Productos

### Listar productos
```
GET /productos/
```
Parámetros de filtro opcionales:
- `categoria` - Filtrar por categoría (ej: Toner, Impresora)
- `search` - Buscar en nombre, marca o modelo
- `ordering` - Ordenar por campo (ej: -stock, nombre)
- `page` - Número de página (paginación automática de 20 items)

Respuesta:
```json
{
  "count": 45,
  "next": "http://127.0.0.1:8000/api/productos/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "nombre": "Toner HP 80A",
      "marca": "HP",
      "modelo": "80A",
      "precio": 25000,
      "stock": 10,
      "categoria": "Toner",
      "codigo_barras": "7891234560012",
      "descripcion": "Toner original para LaserJet",
      "fecha_creacion": "2025-12-20T10:30:00Z",
      "fecha_actualizacion": "2025-12-22T14:15:00Z"
    }
  ]
}
```

### Obtener producto específico
```
GET /productos/{id}/
```

### Crear producto
```
POST /productos/
Content-Type: application/json

{
  "nombre": "Toner HP 85A",
  "marca": "HP",
  "modelo": "85A",
  "precio": 28000,
  "stock": 5,
  "categoria": "Toner",
  "codigo_barras": "7891234560029",
  "descripcion": "Compatible con LaserJet Pro"
}
```

### Actualizar producto
```
PUT /productos/{id}/
PATCH /productos/{id}/
```

### Eliminar producto
```
DELETE /productos/{id}/
```

---

## Endpoints de Movimientos

### Listar movimientos
```
GET /movimientos/
```
Parámetros de filtro:
- `tipo` - entrada o salida
- `producto` - ID del producto
- `fecha_desde` - Formato YYYY-MM-DD
- `fecha_hasta` - Formato YYYY-MM-DD
- `search` - Buscar en observaciones
- `ordering` - Ordenar (ej: -fecha_creacion)

Respuesta:
```json
{
  "count": 120,
  "results": [
    {
      "id": 1,
      "producto": 1,
      "producto_nombre": "Toner HP 80A",
      "tipo": "entrada",
      "cantidad": 10,
      "usuario": "admin",
      "observaciones": "Compra mensual proveedor ABC",
      "fecha_creacion": "2025-12-22T09:15:00Z"
    }
  ]
}
```

### Registrar movimiento
```
POST /movimientos/
Content-Type: application/json

{
  "producto": 1,
  "tipo": "salida",
  "cantidad": 2,
  "usuario": "vendedor1",
  "observaciones": "Venta sucursal norte"
}
```

Validaciones:
- `tipo` debe ser "entrada" o "salida"
- `cantidad` debe ser > 0
- Para salidas, `cantidad` no puede exceder stock disponible

---

## Endpoints de Alertas

### Listar alertas
```
GET /alertas/
```
Parámetros:
- `estado` - activa, resuelta
- `producto` - ID del producto
- `ordering` - Ordenar resultados

Respuesta:
```json
{
  "results": [
    {
      "id": 1,
      "producto": 1,
      "producto_nombre": "Toner HP 80A",
      "tipo": "stock_bajo",
      "mensaje": "Stock por debajo del umbral mínimo",
      "umbral": 5,
      "stock_actual": 3,
      "estado": "activa",
      "fecha_creacion": "2025-12-22T10:00:00Z"
    }
  ]
}
```

### Crear alerta manual
```
POST /alertas/
Content-Type: application/json

{
  "producto": 1,
  "tipo": "stock_bajo",
  "umbral": 5
}
```

### Resolver alerta
```
PATCH /alertas/{id}/
Content-Type: application/json

{
  "estado": "resuelta"
}
```

---

## Estadísticas del Dashboard

### Resumen general
```
GET /productos/estadisticas/
```

Respuesta:
```json
{
  "total_productos": 45,
  "alertas_activas": 8,
  "valor_inventario": 2450000,
  "movimientos_hoy": 12
}
```

### Productos con stock bajo
```
GET /productos/?stock__lte=5&ordering=stock
```

### Movimientos recientes
```
GET /movimientos/?ordering=-fecha_creacion&limit=10
```

---

## Desarrollo - Endpoints de Testing

**ADVERTENCIA:** Estos endpoints solo deben existir en desarrollo

### Resetear base de datos
```
POST /dev/reset/
```
Elimina todos los productos, movimientos y alertas.

### Poblar con datos de prueba
```
POST /dev/populate/
```
Crea 20 productos de ejemplo con movimientos y alertas.

---

## Códigos de Estado HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Eliminación exitosa
- `400 Bad Request` - Datos inválidos o faltantes
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## Autenticación

Actualmente el sistema no requiere autenticación (desarrollo).
En producción se implementará autenticación JWT.
