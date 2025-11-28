# Guión de Presentación - Sistema de Inventario con Scanner de Códigos de Barras

## Introducción (30 segundos)
"Buenos días/tardes. Hoy les voy a presentar el avance del sistema de inventario que hemos desarrollado. Una de las características principales que implementamos es un sistema de códigos de barras que facilita el registro y gestión de productos."

## Demostración del Generador de Códigos (1 minuto)
1. **Navegar a 'Generador'**
   - "Primero, vamos a la sección de Generador de Códigos de Barras"
   
2. **Crear un producto con código**
   - "Aquí puedo ingresar la información de un nuevo producto"
   - "El sistema genera automáticamente un código de barras válido en formato EAN-13"
   - Ingresar: Nombre, Stock, Stock Mínimo
   - "Al hacer clic en Generar, el código se crea y se muestra visualmente"
   
3. **Mostrar código generado**
   - "Como pueden ver, el código de barras se muestra tanto en formato visual como en número"
   - "Este código es único y sigue el estándar internacional EAN-13"

4. **Guardar producto**
   - "Ahora guardo este producto con su código de barras en la base de datos"
   - Clic en "Guardar Producto"

## Demostración del Scanner (2 minutos)
1. **Navegar a 'Scanner'**
   - "Ahora vamos a la sección de Scanner"
   
2. **Iniciar cámara**
   - "Aquí puedo usar la cámara del dispositivo para escanear códigos de barras"
   - Clic en "Iniciar Scanner"
   - "El sistema solicita permiso para usar la cámara"

3. **Escanear código impreso**
   - "Voy a escanear el código de barras que acabamos de generar"
   - Mostrar el código impreso/en pantalla a la cámara
   - "Cuando el scanner detecta el código, automáticamente busca el producto en la base de datos"

4. **Mostrar resultado**
   - "Como pueden ver, el sistema encontró el producto y muestra toda su información"
   - "Aquí veo el nombre, stock actual, stock mínimo y la fecha de registro"

5. **Registrar movimiento (opcional)**
   - "Si quisiera registrar una entrada o salida de este producto, puedo hacerlo directamente desde aquí"
   - Mostrar el formulario de movimientos

## Beneficios del Sistema (30 segundos)
"Este sistema de códigos de barras aporta varios beneficios:
- **Rapidez**: Registrar productos es mucho más rápido que escribir manualmente
- **Precisión**: Elimina errores de digitación en códigos de producto
- **Movilidad**: Funciona desde cualquier dispositivo con cámara, incluso celulares
- **Estandarización**: Usa formatos internacionales como EAN-13"

## Funcionalidad Adicional (30 segundos)
"Además del scanner, el sistema cuenta con:
- **Gestión completa de inventario**: Productos, movimientos, alertas
- **Exportación a CSV**: Para análisis externos
- **Búsqueda y filtros**: Para encontrar productos rápidamente
- **Interfaz responsive**: Funciona en computadores, tablets y celulares"

## Cierre (15 segundos)
"Esto ha sido la demostración del sistema de inventario con scanner de códigos de barras. ¿Tienen alguna pregunta?"

---

## Tips para la Presentación:
1. **Antes de empezar:**
   - Tener un producto ya generado y el código impreso
   - Verificar que la cámara funcione correctamente
   - Probar el scanner al menos una vez antes

2. **Durante la demo:**
   - Hablar claro y pausado
   - Mostrar la pantalla de forma que todos vean
   - Si el scanner no detecta inmediatamente, ajustar distancia/luz

3. **Problemas comunes:**
   - Si la cámara no inicia: Verificar permisos del navegador
   - Si no detecta el código: Asegurar buena iluminación y distancia adecuada
   - Si no encuentra el producto: Verificar que el código esté registrado en la BD

4. **Preguntas frecuentes esperadas:**
   - "¿Funciona con códigos de barras comerciales?" → Sí, EAN-13 es un estándar
   - "¿Qué pasa si no hay cámara?" → Se puede ingresar el código manualmente
   - "¿Funciona offline?" → No, requiere conexión para buscar en la base de datos
