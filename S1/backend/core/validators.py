from rest_framework import serializers
from decimal import Decimal

def validar_stock(valor):
    """Valida que el stock sea un número válido y no negativo"""
    if valor is None:
        raise serializers.ValidationError("El stock no puede estar vacío")
    
    try:
        valor_int = int(valor)
    except (ValueError, TypeError):
        raise serializers.ValidationError("El stock debe ser un número entero")
    
    if valor_int < 0:
        raise serializers.ValidationError("El stock no puede ser negativo")
    
    if valor_int > 999999:
        raise serializers.ValidationError("El stock no puede exceder 999,999 unidades")
    
    return valor_int

def validar_precio(valor):
    """Valida que el precio sea un número válido y positivo"""
    if valor is None:
        raise serializers.ValidationError("El precio no puede estar vacío")
    
    try:
        valor_decimal = Decimal(str(valor))
    except (ValueError, TypeError):
        raise serializers.ValidationError("El precio debe ser un número válido")
    
    if valor_decimal < 0:
        raise serializers.ValidationError("El precio no puede ser negativo")
    
    if valor_decimal == 0:
        raise serializers.ValidationError("El precio debe ser mayor a cero")
    
    if valor_decimal > Decimal('99999999.99'):
        raise serializers.ValidationError("El precio no puede exceder $99,999,999.99")
    
    return valor_decimal

def validar_cantidad_movimiento(valor):
    """Valida cantidades en movimientos de stock"""
    if valor is None:
        raise serializers.ValidationError("La cantidad no puede estar vacía")
    
    try:
        valor_int = int(valor)
    except (ValueError, TypeError):
        raise serializers.ValidationError("La cantidad debe ser un número entero")
    
    if valor_int <= 0:
        raise serializers.ValidationError("La cantidad debe ser mayor a cero")
    
    if valor_int > 100000:
        raise serializers.ValidationError("La cantidad no puede exceder 100,000 unidades por movimiento")
    
    return valor_int

def validar_codigo_barras(valor):
    """Valida formato básico de código de barras"""
    if not valor:
        return valor
    
    if not isinstance(valor, str):
        raise serializers.ValidationError("El código de barras debe ser texto")
    
    valor_limpio = valor.strip()
    
    if len(valor_limpio) < 8:
        raise serializers.ValidationError("El código de barras debe tener al menos 8 caracteres")
    
    if len(valor_limpio) > 50:
        raise serializers.ValidationError("El código de barras no puede exceder 50 caracteres")
    
    if not valor_limpio.replace('-', '').replace(' ', '').isalnum():
        raise serializers.ValidationError("El código de barras solo puede contener letras, números, guiones y espacios")
    
    return valor_limpio
