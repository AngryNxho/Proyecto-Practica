from django.db import models, transaction


class Producto(models.Model):
    """
    Modelo para gestionar productos del inventario (impresoras, tóners, etc.)
    """
    nombre = models.CharField(max_length=100, verbose_name="Nombre del producto")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    marca = models.CharField(max_length=50, blank=True, verbose_name="Marca")
    modelo = models.CharField(max_length=100, blank=True, verbose_name="Modelo")
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.IntegerField(default=0, verbose_name="Stock actual")
    categoria = models.CharField(max_length=50, blank=True, verbose_name="Categoría")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    codigo_barras = models.CharField(max_length=64, blank=True, null=True, unique=True, verbose_name="Código de barras")

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['categoria', '-fecha_creacion']),
            models.Index(fields=['marca', 'modelo']),
            models.Index(fields=['stock']),
            models.Index(fields=['codigo_barras']),
        ]

    def __str__(self):
        if self.marca and self.modelo:
            return f"{self.marca} {self.modelo} - {self.nombre}"
        return self.nombre
    
    def esta_en_stock_bajo(self):
        """Verifica si el producto tiene stock por debajo del umbral de alerta"""
        alerta = self.alertas.first()
        if alerta and alerta.activa:
            return self.stock < alerta.umbral
        return False
    
    def registrar_entrada(self, cantidad, descripcion=''):
        """Registra una entrada de stock con validación"""
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        
        with transaction.atomic():
            movimiento = Movimiento.objects.create(
                producto=self,
                tipo='ENTRADA',
                cantidad=cantidad,
                descripcion=descripcion
            )
            self.stock += cantidad
            self.save(update_fields=['stock'])
            self._verificar_alertas()
        return movimiento
    
    def registrar_salida(self, cantidad, descripcion=''):
        """Registra una salida de stock con validación estricta y protección contra race conditions"""
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        
        with transaction.atomic():
            # Usar select_for_update para evitar race conditions en operaciones concurrentes
            producto = Producto.objects.select_for_update().get(pk=self.pk)
            
            if cantidad > producto.stock:
                raise ValueError(
                    f"Stock insuficiente para '{producto.nombre}'. "
                    f"Disponible: {producto.stock}, Solicitado: {cantidad}, "
                    f"Faltante: {cantidad - producto.stock}"
                )
            
            movimiento = Movimiento.objects.create(
                producto=producto,
                tipo='SALIDA',
                cantidad=cantidad,
                descripcion=descripcion
            )
            producto.stock -= cantidad
            producto.save(update_fields=['stock'])
            producto._verificar_alertas()
            
            # Actualizar self para reflejar cambios
            self.refresh_from_db()
        return movimiento
    
    def _verificar_alertas(self):
        """Verifica y actualiza el estado de las alertas según el stock actual"""
        # Si no hay alertas configuradas, crear una por defecto con umbral de 10
        if not self.alertas.exists():
            Alerta.objects.create(producto=self, umbral=10, activa=False)
        
        for alerta in self.alertas.all():
            alerta.activa = self.stock < alerta.umbral
            alerta.save(update_fields=['activa'])


class Movimiento(models.Model):
    """
    Modelo para registrar movimientos de entrada/salida de productos
    """
    TIPO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SALIDA', 'Salida'),
    ]
    
    producto = models.ForeignKey(
        Producto, 
        on_delete=models.CASCADE, 
        related_name='movimientos',
        verbose_name="Producto"
    )
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, verbose_name="Tipo de movimiento")
    cantidad = models.IntegerField(verbose_name="Cantidad")
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha del movimiento")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")

    class Meta:
        verbose_name = 'Movimiento'
        verbose_name_plural = 'Movimientos'
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['producto', '-fecha']),
            models.Index(fields=['tipo', '-fecha']),
        ]

    def __str__(self):
        return f"{self.tipo} - {self.producto.nombre} ({self.cantidad})"


class Alerta(models.Model):
    """
    Modelo para alertas de stock bajo
    """
    producto = models.ForeignKey(
        Producto, 
        on_delete=models.CASCADE, 
        related_name='alertas',
        verbose_name="Producto"
    )
    umbral = models.IntegerField(
        verbose_name="Umbral de stock",
        help_text="Stock mínimo antes de generar alerta"
    )
    activa = models.BooleanField(default=True, verbose_name="Alerta activa")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    class Meta:
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['activa', 'producto']),
        ]

    def __str__(self):
        return f"Alerta: {self.producto.nombre} (Umbral: {self.umbral})"


class Device(models.Model):
    """
    Representa una impresora/dispositivo que puede reportar niveles de consumibles.
    Se mapea a un `Producto` (ej. Toner) para actualizar el stock automáticamente.
    """
    nombre = models.CharField(max_length=150, verbose_name="Nombre del dispositivo")
    ip = models.GenericIPAddressField(verbose_name="IP del dispositivo")
    marca = models.CharField(max_length=50, blank=True, verbose_name="Marca")
    modelo = models.CharField(max_length=100, blank=True, verbose_name="Modelo")
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='dispositivos',
        verbose_name="Producto consumible"
    )
    protocolo = models.CharField(max_length=20, default='SNMP', verbose_name="Protocolo")
    version_snmp = models.CharField(max_length=10, default='2c', verbose_name="SNMP Version")
    comunidad_snmp = models.CharField(max_length=100, blank=True, verbose_name="SNMP Community")
    activo = models.BooleanField(default=True, verbose_name="Activo")
    ultima_lectura = models.DateTimeField(null=True, blank=True, verbose_name="Última lectura")

    class Meta:
        verbose_name = 'Dispositivo'
        verbose_name_plural = 'Dispositivos'
        indexes = [
            models.Index(fields=['ip']),
            models.Index(fields=['activo', 'producto']),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.ip})"
