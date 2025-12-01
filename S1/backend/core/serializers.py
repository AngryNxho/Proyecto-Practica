from rest_framework import serializers
from .models import Producto, Movimiento, Alerta
from django.db import transaction


class ProductoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Producto"""
    class Meta:
        model = Producto
        fields = '__all__'
        read_only_fields = ['fecha_creacion']


class MovimientoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Movimiento"""
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    
    class Meta:
        model = Movimiento
        fields = '__all__'
        read_only_fields = ['fecha']


class AlertaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Alerta"""
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    
    class Meta:
        model = Alerta
        fields = '__all__'
        read_only_fields = ['fecha_creacion']
