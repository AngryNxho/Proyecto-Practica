# GUÍA DE INSERCIÓN DE DIAGRAMAS EN EL INFORME

## ✅ DIAGRAMAS GENERADOS

Se han creado 3 diagramas profesionales listos para insertar:

1. **Figura1_CasoUso.png** - Diagrama de casos de uso
2. **Figura2_ModeloDatos.png** - Modelo de datos (entidad-relación)
3. **Figura3_Arquitectura.png** - Arquitectura del sistema

📁 **Ubicación:** `diagramas/`

---

## 📍 DÓNDE INSERTAR CADA DIAGRAMA

### FIGURA 1: Diagrama de Casos de Uso
**📂 Ubicación en el informe:** Sección 4 - "Descripción del trabajo realizado"

**📝 Texto a agregar ANTES del diagrama:**

```
El sistema de inventario fue diseñado considerando las necesidades de dos tipos de usuarios principales: operadores y supervisores. Como se observa en la Figura 1, los operadores pueden gestionar productos mediante operaciones CRUD (crear, leer, actualizar, eliminar), registrar entradas y salidas de stock, consultar el stock actual y revisar alertas de productos con stock bajo. Por su parte, los supervisores tienen acceso a funcionalidades adicionales como la generación de reportes periódicos, exportación de datos en formatos CSV y PDF, y gestión de códigos de barras para identificación de productos.

[INSERTAR AQUÍ: Figura1_CasoUso.png]

**Figura 1.** Diagrama de casos de uso del sistema de inventario. Muestra las interacciones entre usuarios (operador y supervisor) y las funcionalidades principales del sistema.
```

---

### FIGURA 2: Modelo de Datos
**📂 Ubicación en el informe:** Sección 4 - "Descripción del trabajo realizado" (después de Figura 1)

**📝 Texto a agregar ANTES del diagrama:**

```
La base de datos del sistema fue diseñada utilizando un modelo relacional que permite mantener la integridad de la información y facilitar el seguimiento de las operaciones. Como se presenta en la Figura 2, el modelo consta de cuatro entidades principales: Producto, Movimiento, Alerta y Device. La entidad Producto almacena la información básica de cada artículo del inventario, incluyendo nombre, descripción, marca, modelo, precio, stock actual, categoría y código de barras único. Esta entidad se relaciona con Movimiento en una relación uno a muchos, donde cada movimiento registra una operación de entrada o salida de stock, incluyendo la cantidad, fecha y descripción de la operación.

Adicionalmente, la entidad Alerta permite configurar umbrales de stock mínimo para cada producto, activándose automáticamente cuando el stock cae por debajo del límite establecido. Por último, la entidad Device representa impresoras o dispositivos monitoreados mediante protocolo SNMP, vinculados a productos consumibles para actualizar el stock automáticamente según el nivel de uso detectado.

[INSERTAR AQUÍ: Figura2_ModeloDatos.png]

**Figura 2.** Modelo entidad-relación del sistema de inventario. Muestra las cuatro entidades principales (Producto, Movimiento, Alerta, Device) y sus relaciones, incluyendo claves primarias (PK), claves foráneas (FK) y claves únicas (UK).
```

---

### FIGURA 3: Arquitectura del Sistema
**📂 Ubicación en el informe:** Sección 4 - "Descripción del trabajo realizado" (después de Figura 2)

**📝 Texto a agregar ANTES del diagrama:**

```
El sistema fue desarrollado siguiendo una arquitectura de tres capas que separa claramente las responsabilidades de presentación, lógica de negocio y persistencia de datos. Como se ilustra en la Figura 3, la capa de presentación (frontend) fue implementada en React 18 utilizando Vite como herramienta de construcción, e incluye páginas, componentes reutilizables, servicios de comunicación con la API y hooks personalizados para la gestión del estado.

La capa intermedia (backend) fue desarrollada en Django con Django REST Framework, exponiendo una API REST que maneja las peticiones HTTP mediante ViewSets, serializa los datos usando Serializers y aplica filtros y paginación según los parámetros recibidos. La comunicación entre frontend y backend se realiza mediante el cliente HTTP axios, con habilitación de CORS para permitir peticiones entre orígenes distintos durante el desarrollo.

Finalmente, la capa de persistencia utiliza SQLite como base de datos en el entorno de desarrollo, con la posibilidad de migrar a PostgreSQL para producción. El acceso a los datos se realiza mediante el ORM de Django, que abstrae las operaciones de base de datos y facilita el mantenimiento del código.

[INSERTAR AQUÍ: Figura3_Arquitectura.png]

**Figura 3.** Arquitectura del sistema de inventario. Representa la separación en tres capas: frontend (React + Vite), backend (Django + DRF) y base de datos (SQLite/PostgreSQL), así como los componentes principales de cada capa y su comunicación.
```

---

## 📋 PASOS PARA INSERTAR EN WORD

### 1. Abrir el documento
Abrir `INFORME2.docx`

### 2. Ubicar la sección 4
Ir a "4. Descripción del trabajo realizado"

### 3. Insertar cada diagrama
Para cada figura:

1. **Copiar el texto indicado** (incluyendo el párrafo antes y el pie de figura)
2. **Pegar en el lugar correspondiente** en la sección 4
3. **Posicionar el cursor** donde dice "[INSERTAR AQUÍ: ...]"
4. **Insertar → Imagen → Desde archivo**
5. Seleccionar el archivo correspondiente en `diagramas/`
6. **Ajustar tamaño** de la imagen (ancho: 14-16 cm, mantener proporción)
7. **Centrar** la imagen (Ctrl+E o botón Centrar)
8. **Eliminar** el texto "[INSERTAR AQUÍ: ...]"

### 4. Formato del pie de figura
El pie de figura debe estar:
- **Centrado**
- **Calibri 10pt** (un punto menos que el texto normal)
- **Negrita** solo en "Figura X."
- Con espacio de 8pt antes y 8pt después

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de insertar los diagramas:

- [ ] Las 3 figuras están insertadas en la sección 4
- [ ] Cada figura tiene su párrafo introductorio ANTES
- [ ] Cada figura tiene su pie de figura DESPUÉS
- [ ] Las imágenes están centradas
- [ ] Las imágenes tienen tamaño apropiado (legibles pero no excesivas)
- [ ] Los pies de figura están en formato correcto
- [ ] Se mencionan las figuras en el texto ("Figura 1", "Figura 2", "Figura 3")
- [ ] La numeración es consecutiva

---

## 🎯 RESULTADO ESPERADO

Después de insertar los diagramas, la sección 4 debería tener:

1. Descripción del trabajo inicial
2. **Párrafo + Figura 1 + Pie** (Casos de uso)
3. **Párrafo + Figura 2 + Pie** (Modelo de datos)
4. **Párrafo + Figura 3 + Pie** (Arquitectura)
5. Continuación de la descripción del trabajo

---

## 💡 TIPS

- **Mantén las imágenes en alta calidad:** No las comprimas excesivamente
- **Actualiza el índice:** Después de insertar todo, actualiza la tabla de contenidos
- **Referencias cruzadas:** En Word puedes usar Referencias → Referencia cruzada para que los números de figura se actualicen automáticamente
- **Exportación final:** Al exportar a PDF, verifica que las imágenes se vean nítidas

---

**¿Listo para insertar?** Sigue los pasos uno por uno y tu informe tendrá diagramas profesionales. 🎉
