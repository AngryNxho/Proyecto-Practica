from rest_framework import serializers
from .models import Producto, Movimiento, Alerta
from django.db import transaction
from decimal import Decimal


class ProductoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Producto con validaciones extendidas"""
    
    # Categorías permitidas en el sistema
    CATEGORIAS_PERMITIDAS = [
        'Impresora', 'Toner', 'Tinta', 'Papel', 
        'Tambor', 'Kit', 'Repuesto', 'Otro'
    ]
    
    class Meta:
        model = Producto
        fields = '__all__'
        read_only_fields = ['fecha_creacion']
    
    def validate_precio(self, value):
        """Valida que el precio sea positivo y razonable"""
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a cero.")
        if value > Decimal('99999999.99'):
            raise serializers.ValidationError("El precio excede el límite permitido.")
        return value
    
    def validate_stock(self, value):
        """Valida que el stock sea no negativo"""
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo.")
        if value > 999999:
            raise serializers.ValidationError("El stock excede el límite permitido.")
        return value
    
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
        """Valida formato de código de barras si se proporciona"""
        if value:
            # Permitir solo caracteres alfanuméricos y guiones
            if not value.replace('-', '').isalnum():
                raise serializers.ValidationError(
                    "El código de barras solo puede contener caracteres alfanuméricos y guiones."
                )
            if len(value) < 8 or len(value) > 64:
                raise serializers.ValidationError(
                    "El código de barras debe tener entre 8 y 64 caracteres."
                )
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
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a cero.")
        if value > 10000:
            raise serializers.ValidationError(
                "La cantidad excede el límite permitido por movimiento (10,000 unidades)."
            )
        return value
    
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
