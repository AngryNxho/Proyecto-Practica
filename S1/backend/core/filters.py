from django_filters import rest_framework as filters
from .models import Producto, Movimiento, Alerta


class ProductoFilter(filters.FilterSet):
    """Filtros para productos: nombre, marca, modelo, categoria, stock y precio"""
    nombre = filters.CharFilter(lookup_expr='icontains')
    marca = filters.CharFilter(lookup_expr='icontains')
    modelo = filters.CharFilter(lookup_expr='icontains')
    categoria = filters.CharFilter(lookup_expr='icontains')
    stock_min = filters.NumberFilter(field_name='stock', lookup_expr='gte')
    stock_max = filters.NumberFilter(field_name='stock', lookup_expr='lte')
    precio_min = filters.NumberFilter(field_name='precio', lookup_expr='gte')
    precio_max = filters.NumberFilter(field_name='precio', lookup_expr='lte')

    class Meta:
        model = Producto
        fields = ['nombre', 'marca', 'modelo', 'categoria', 'stock_min', 'stock_max', 'precio_min', 'precio_max']


class MovimientoFilter(filters.FilterSet):
    """Filtros para movimientos: tipo, producto y rango de fechas"""
    tipo = filters.ChoiceFilter(choices=Movimiento.TIPO_CHOICES)
    producto = filters.NumberFilter(field_name='producto__id')
    fecha_desde = filters.DateTimeFilter(field_name='fecha', lookup_expr='gte')
    fecha_hasta = filters.DateTimeFilter(field_name='fecha', lookup_expr='lte')

    class Meta:
        model = Movimiento
        fields = ['tipo', 'producto', 'fecha_desde', 'fecha_hasta']


class AlertaFilter(filters.FilterSet):
    """Filtros para alertas: estado activo y producto"""
    activa = filters.BooleanFilter()
    producto = filters.NumberFilter(field_name='producto__id')

    class Meta:
        model = Alerta
        fields = ['activa', 'producto']
