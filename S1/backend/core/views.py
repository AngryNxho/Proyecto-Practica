from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Producto, Movimiento, Alerta
from .serializers import ProductoSerializer, MovimientoSerializer, AlertaSerializer
import csv
from datetime import datetime

class ProductoViewSet(viewsets.ModelViewSet):
    """ViewSet para operaciones CRUD de productos"""
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    
    @action(detail=False, methods=['get'])
    def exportar_csv(self, request):
        """Exporta todos los productos a CSV"""
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="productos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        response.write('\ufeff')  # BOM para UTF-8 en Excel
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Nombre', 'Marca', 'Modelo', 'Categoría', 'Stock', 'Precio', 'Descripción', 'Fecha Creación'])
        
        # Forzar consulta fresca desde la base de datos
        productos = Producto.objects.all().order_by('-fecha_creacion')
        for producto in productos:
            writer.writerow([
                producto.id,
                producto.nombre,
                producto.marca,
                producto.modelo,
                producto.categoria,
                producto.stock,
                producto.precio,
                producto.descripcion,
                producto.fecha_creacion.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response
    
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
    
    @action(detail=False, methods=['get'])
    def exportar_csv(self, request):
        """Exporta todos los movimientos a CSV"""
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="movimientos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Producto', 'Tipo', 'Cantidad', 'Fecha', 'Descripción'])
        
        # Forzar consulta fresca desde la base de datos
        movimientos = Movimiento.objects.all().select_related('producto').order_by('-fecha')
        for mov in movimientos:
            writer.writerow([
                mov.id,
                mov.producto.nombre,
                mov.tipo,
                mov.cantidad,
                mov.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                mov.descripcion
            ])
        
        return response

class AlertaViewSet(viewsets.ModelViewSet):
    """ViewSet para alertas de stock"""
    queryset = Alerta.objects.all()
    serializer_class = AlertaSerializer
