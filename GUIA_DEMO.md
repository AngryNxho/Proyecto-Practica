# Guía de Demostración - Sistema de Inventario TISOL

## 📋 Preparación para la Demo (5 minutos)

### 1. Iniciar Backend
```powershell
cd C:\Users\JustNxho\Documents\PRACTICA DUOC\S1\backend
.\venv\Scripts\activate
python manage.py runserver
```

### 2. Poblar Datos de Ejemplo (OPCIONAL)
```powershell
# En el mismo terminal del backend
python poblar_datos.py
```
Esto crea:
- 8 productos de ejemplo (impresoras, tóners, accesorios)
- Alertas automáticas según tipo de producto
- Productos con stock bajo/crítico para demostrar alertas

### 3. Iniciar Frontend (nueva terminal)
```powershell
cd C:\Users\JustNxho\Documents\PRACTICA DUOC\S1\frontend
npm run dev
```

Acceder a: **http://localhost:5173**

---

## 🎯 Flujo de Demostración (15-20 min)

### Parte 1: Navegación y Dashboard (3 min)
1. **Mostrar la barra de navegación lateral**
   - Diseño moderno con logo TISOL
   - Enlaces a 4 secciones principales
   
2. **Explicar el Tablero (Dashboard)**
   - KPIs en tiempo real:
     * Total productos registrados
     * Stock acumulado (suma de todas las unidades)
     * Valor estimado del inventario
     * Alertas activas
   - Tabla de últimos 5 movimientos
   - Lista de alertas activas con productos críticos

### Parte 2: Gestión de Productos (5 min)
1. **Crear un nuevo producto**
   - Ir a "Productos"
   - Llenar formulario:
     * Nombre: "Toner HP 12A"
     * Categoría: "Toner"
     * Marca: "HP"
     * Modelo: "Q2612A"
     * Precio: 42000
     * Stock inicial: 10
     * Descripción: "Compatible con LaserJet 1010, 1012, 1015"
   - Guardar y mostrar cómo aparece en la lista

2. **Demostrar tarjetas de productos**
   - Badges de estado (verde = OK, amarillo = bajo, rojo = crítico)
   - Información visible: stock, precio, alertas
   - Botón eliminar (confirmar antes de borrar)

### Parte 3: Movimientos de Stock (4 min)
1. **Registrar entrada de stock**
   - Ir a "Movimientos"
   - Seleccionar un producto
   - Tipo: Entrada
   - Cantidad: 20
   - Descripción: "Compra mensual proveedor XYZ"
   - Guardar y ver actualización

2. **Registrar salida de stock**
   - Seleccionar otro producto
   - Tipo: Salida
   - Cantidad: 5
   - Descripción: "Entrega cliente ABC"
   - Mostrar validación de stock insuficiente (si aplica)

3. **Ver historial**
   - Lista de movimientos con fecha/hora
   - Badges de tipo (verde entrada, rojo salida)

### Parte 4: Sistema de Alertas (4 min)
1. **Crear nueva alerta**
   - Ir a "Alertas"
   - Seleccionar producto
   - Definir umbral: 5 unidades
   - Guardar

2. **Demostrar alertas automáticas**
   - Explicar que se activan cuando stock < umbral
   - Mostrar productos en estado crítico
   - Ver alertas resueltas vs activas

---

## 💡 Puntos Clave para Destacar

### Arquitectura Técnica
- **Backend**: Django REST Framework
  - API RESTful con endpoints CRUD completos
  - Modelos relacionales: Producto, Movimiento, Alerta
  - Validaciones de negocio (ej: no permitir salidas sin stock)
  
- **Frontend**: React + Vite
  - SPA con React Router (navegación sin recargas)
  - Componentes modulares reutilizables
  - Estado local con hooks (useState, useEffect)
  - Servicios centralizados para API

### Características Implementadas
✅ CRUD completo de productos
✅ Registro de movimientos (entrada/salida)
✅ Sistema de alertas configurables
✅ Dashboard con KPIs en tiempo real
✅ Diseño responsive y moderno
✅ Validaciones frontend y backend
✅ Formato de moneda chilena (CLP)
✅ Timestamps localizados (es-CL)

### Próximas Funcionalidades (Semana 2-3)
- [ ] Autenticación de usuarios
- [ ] Reportes PDF/Excel
- [ ] Gráficos de tendencias
- [ ] Integración SNMP para lectura automática de tóners
- [ ] Notificaciones por email
- [ ] Gestión de múltiples bodegas

---

## 🐛 Troubleshooting

### Backend no inicia
```powershell
# Verificar que el venv esté activado
.\venv\Scripts\activate

# Verificar migraciones
python manage.py migrate

# Verificar .env existe
dir .env
```

### Frontend muestra errores
```powershell
# Reinstalar dependencias
rm -r node_modules
npm install

# Verificar .env
dir .env
```

### API no responde
- Verificar que backend esté en http://127.0.0.1:8000
- Verificar CORS configurado en backend/config/settings.py
- Revisar .env del frontend (VITE_API_URL)

---

## 📊 Datos de Demostración

Si ejecutaste `poblar_datos.py`, tienes:

**Productos creados:**
- Toner HP 80A (Stock: 15)
- Toner HP 85A (Stock: 3) ⚠️
- Impresora HP M404dn (Stock: 2)
- Toner Canon 052 (Stock: 8)
- Toner Brother TN-2370 (Stock: 12)
- Impresora Epson L3250 (Stock: 5)
- Toner Samsung MLT-D101S (Stock: 1) 🔴
- Kit Mantenimiento HP (Stock: 4)

**Alertas activas:**
- Productos con stock < umbral automáticamente marcados

---

## ✨ Mensaje Final

> "Este sistema demuestra una arquitectura moderna y escalable para gestión de inventario. La separación entre frontend y backend permite desplegar en diferentes servidores, agregar aplicaciones móviles, o integrar con otros sistemas empresariales. El código está documentado y sigue buenas prácticas de la industria."

**Tiempo de desarrollo:** Semana 1 (HU01-HU09)  
**Estado:** Funcional, listo para demo  
**Próximos pasos:** Autenticación y reportes (Semana 2)
