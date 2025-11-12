from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Producto, Movimiento, Alerta
from .serializers import ProductoSerializer, MovimientoSerializer, AlertaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    """ViewSet para operaciones CRUD de productos"""
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    
    @action(detail=True, methods=['post'])
    def registrar_entrada(self, request, pk=None):
        """Registra entrada de stock"""
        producto = self.get_object()
        cantidad = request.data.get('cantidad', 0)
        descripcion = request.data.get('descripcion', '')
        
        try:
            movimiento = producto.registrar_entrada(cantidad, descripcion)
            serializer = MovimientoSerializer(movimiento)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['post'])
    def registrar_salida(self, request, pk=None):
        """Registra salida de stock"""
        producto = self.get_object()
        cantidad = request.data.get('cantidad', 0)
        descripcion = request.data.get('descripcion', '')
        
        try:
            movimiento = producto.registrar_salida(cantidad, descripcion)
            serializer = MovimientoSerializer(movimiento)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)

class MovimientoViewSet(viewsets.ModelViewSet):
    """ViewSet para movimientos de stock"""
    queryset = Movimiento.objects.all()
    serializer_class = MovimientoSerializer

class AlertaViewSet(viewsets.ModelViewSet):
    """ViewSet para alertas de stock"""
    queryset = Alerta.objects.all()
    serializer_class = AlertaSerializer
