from rest_framework import serializers
from .models import Producto, Movimiento, Alerta
from .validators import validar_stock, validar_precio, validar_cantidad_movimiento, validar_codigo_barras
from django.db import transaction
from decimal import Decimal


class ProductoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Producto con validaciones extendidas"""
    
    # Categorías permitidas en el sistema
    CATEGORIAS_PERMITIDAS = [
        'Impresora', 'Toner', 'Tinta', 'Papel', 
        'Tambor', 'Kit', 'Repuesto', 'Otro'
    ]
    
    # Campos calculados
    valor_total = serializers.SerializerMethodField()
    estado_stock = serializers.SerializerMethodField()
    tiene_alertas_activas = serializers.SerializerMethodField()
    ultimos_movimientos = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = '__all__'
        read_only_fields = ['fecha_creacion']
    
    def get_valor_total(self, obj):
        """Calcula valor total del inventario de este producto"""
        return float(obj.stock * obj.precio)
    
    def get_estado_stock(self, obj):
        """Determina el estado del stock según niveles"""
        if obj.stock <= 5:
            return 'critico'
        elif obj.stock <= 10:
            return 'bajo'
        return 'normal'
    
    def get_tiene_alertas_activas(self, obj):
        """Indica si el producto tiene alertas activas"""
        return obj.alertas.filter(activa=True).exists()
    
    def get_ultimos_movimientos(self, obj):
        """Retorna los últimos 3 movimientos"""
        movimientos = obj.movimientos.order_by('-fecha')[:3]
        return [{
            'id': m.id,
            'tipo': m.tipo,
            'cantidad': m.cantidad,
            'fecha': m.fecha.isoformat(),
            'usuario': m.usuario
        } for m in movimientos]
    
    def validate_precio(self, value):
        """Valida que el precio sea positivo y razonable"""
        return validar_precio(value)
    
    def validate_stock(self, value):
        """Valida que el stock sea no negativo"""
        return validar_stock(value)
    
    def validate_codigo_barras(self, value):
        """Valida formato de código de barras"""
        return validar_codigo_barras(value)
    
    def validate_nombre(self, value):
        """Valida que el nombre no esté vacío y tenga longitud apropiada"""
        if not value or value.strip() == '':
            raise serializers.ValidationError("El nombre del producto es obligatorio.")
        if len(value) < 3:
            raise serializers.ValidationError("El nombre debe tener al menos 3 caracteres.")
        return value.strip()
    
    def validate_categoria(self, value):
        """Valida que la categoría sea una de las permitidas"""
        if value and value not in self.CATEGORIAS_PERMITIDAS:
            raise serializers.ValidationError(
                f"Categoría inválida. Debe ser una de: {', '.join(self.CATEGORIAS_PERMITIDAS)}"
            )
        return value
    
    def validate_codigo_barras(self, value):
        """Valida formato de código de barras"""
        if value:
            value = value.strip()
            if not value.isdigit():
                raise serializers.ValidationError("El código de barras solo debe contener números.")
            if len(value) < 8:
                raise serializers.ValidationError("El código de barras debe tener al menos 8 dígitos.")
            if len(value) > 13:
                raise serializers.ValidationError("El código de barras no puede tener más de 13 dígitos.")
        return value
    
    def validate(self, data):
        """Validaciones a nivel de objeto completo"""
        # Evitar nombres duplicados (case-insensitive)
        if 'nombre' in data:
            nombre = data['nombre'].strip().lower()
            queryset = Producto.objects.filter(nombre__iexact=nombre)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({
                    'nombre': 'Ya existe un producto con este nombre.'
                })
        
        # Evitar códigos de barras duplicados
        if 'codigo_barras' in data and data.get('codigo_barras'):
            codigo = data['codigo_barras'].strip()
            queryset = Producto.objects.filter(codigo_barras=codigo)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({
                    'codigo_barras': 'Este código de barras ya está registrado.'
                })
        
        return data
    
    def validate_codigo_barras(self, value):
        """Valida formato de código de barras si se proporciona"""
        if value:
            return validar_codigo_barras(value)
        return value


class MovimientoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Movimiento con validaciones extendidas"""
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_stock_actual = serializers.IntegerField(source='producto.stock', read_only=True)
    
    class Meta:
        model = Movimiento
        fields = '__all__'
        read_only_fields = ['fecha']
    
    def validate_cantidad(self, value):
        """Valida que la cantidad sea positiva y razonable"""
        return validar_cantidad_movimiento(value)
    
    def validate(self, data):
        """Validación a nivel de objeto para verificar stock en salidas"""
        if data.get('tipo') == 'SALIDA':
            producto = data.get('producto')
            cantidad = data.get('cantidad', 0)
            
            if producto and cantidad > producto.stock:
                raise serializers.ValidationError({
                    'cantidad': f"Stock insuficiente. Disponible: {producto.stock}, Solicitado: {cantidad}"
                })
        
        return data


class AlertaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Alerta con validaciones extendidas"""
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_stock = serializers.IntegerField(source='producto.stock', read_only=True)
    producto_categoria = serializers.CharField(source='producto.categoria', read_only=True)
    
    class Meta:
        model = Alerta
        fields = '__all__'
        read_only_fields = ['fecha_creacion']
    
    def validate_umbral(self, value):
        """Valida que el umbral sea positivo y razonable"""
        if value < 0:
            raise serializers.ValidationError("El umbral no puede ser negativo.")
        if value > 1000:
            raise serializers.ValidationError(
                "El umbral es muy alto. Considere un valor más razonable (máx. 1000)."
            )
        return value
    
    def validate(self, data):
        """Validaciones a nivel de objeto completo"""
        producto = data.get('producto')
        umbral = data.get('umbral')
        
        # Evitar alertas duplicadas para el mismo producto y umbral
        if producto and umbral:
            queryset = Alerta.objects.filter(producto=producto, umbral=umbral, activa=True)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError(
                    f"Ya existe una alerta activa para '{producto.nombre}' con umbral {umbral}."
                )
        
        # Validar que el umbral sea mayor que el stock actual si se crea nueva alerta
        if not self.instance and producto and umbral:
            if umbral <= producto.stock:
                raise serializers.ValidationError(
                    f"El umbral ({umbral}) debe ser mayor al stock actual ({producto.stock}) "
                    f"para que la alerta tenga sentido."
                )
        
        return data

