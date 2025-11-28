from rest_framework import viewsets, filters
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch
from django.utils import timezone
from .models import Producto, Movimiento, Alerta
from .serializers import ProductoSerializer, MovimientoSerializer, AlertaSerializer
from .pagination import PaginacionEstandar
from .filters import ProductoFilter, MovimientoFilter, AlertaFilter
import csv
from datetime import datetime
import pytz

class ProductoViewSet(viewsets.ModelViewSet):
    """ViewSet para operaciones CRUD de productos con paginación y filtros"""
    queryset = Producto.objects.all().order_by('-fecha_creacion')
    serializer_class = ProductoSerializer
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductoFilter
    search_fields = ['nombre', 'marca', 'modelo', 'descripcion']
    ordering_fields = ['nombre', 'stock', 'precio', 'fecha_creacion']
    ordering = ['-fecha_creacion']
    
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
        tz_chile = pytz.timezone('America/Santiago')
        
        for producto in productos:
            # Convertir UTC a hora local de Chile
            fecha_local = producto.fecha_creacion.astimezone(tz_chile)
            
            writer.writerow([
                producto.id,
                producto.nombre,
                producto.marca,
                producto.modelo,
                producto.categoria,
                producto.stock,
                producto.precio,
                producto.descripcion,
                fecha_local.strftime('%Y-%m-%d %H:%M:%S')
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
    """ViewSet para movimientos de stock con paginación y filtros"""
    queryset = Movimiento.objects.all().select_related('producto').order_by('-fecha')
    serializer_class = MovimientoSerializer
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = MovimientoFilter
    ordering_fields = ['fecha', 'cantidad']
    ordering = ['-fecha']
    
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
        tz_chile = pytz.timezone('America/Santiago')
        
        for mov in movimientos:
            # Convertir UTC a hora local de Chile
            fecha_local = mov.fecha.astimezone(tz_chile)
            
            writer.writerow([
                mov.id,
                mov.producto.nombre,
                mov.tipo,
                mov.cantidad,
                fecha_local.strftime('%Y-%m-%d %H:%M:%S'),
                mov.descripcion
            ])
        
        return response

class AlertaViewSet(viewsets.ModelViewSet):
    """ViewSet para alertas de stock con paginación y filtros"""
    queryset = Alerta.objects.all().select_related('producto').order_by('-fecha_creacion')
    serializer_class = AlertaSerializer
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = AlertaFilter
    ordering_fields = ['fecha_creacion', 'umbral']
    ordering = ['-fecha_creacion']


# ========== ENDPOINTS DE DESARROLLO - ELIMINAR EN PRODUCCIÓN ==========

@api_view(['POST'])
def reset_database(request):
    """SOLO DESARROLLO: Borra todos los datos de la base de datos"""
    try:
        Movimiento.objects.all().delete()
        Alerta.objects.all().delete()
        Producto.objects.all().delete()
        return Response({'message': 'Base de datos limpiada', 'status': 'success'})
    except Exception as e:
        return Response({'message': str(e), 'status': 'error'}, status=500)


@api_view(['POST'])
def populate_database(request):
    """SOLO DESARROLLO: Inserta datos de ejemplo"""
    try:
        # Limpiar primero
        Movimiento.objects.all().delete()
        Alerta.objects.all().delete()
        Producto.objects.all().delete()
        
        # Crear productos de ejemplo
        productos_data = [
            {
                'nombre': 'Toner HP 85A Negro',
                'marca': 'HP',
                'modelo': 'CE285A',
                'categoria': 'Toner',
                'stock': 25,
                'precio': 45000,
                'descripcion': 'Toner original HP 85A para LaserJet Pro',
                'codigo_barras': '7801234567890'
            },
            {
                'nombre': 'Tinta Epson T504 Cyan',
                'marca': 'Epson',
                'modelo': 'T504220',
                'categoria': 'Tinta',
                'stock': 15,
                'precio': 12000,
                'descripcion': 'Tinta original Epson EcoTank',
                'codigo_barras': '7809876543210'
            },
            {
                'nombre': 'Papel Bond Carta',
                'marca': 'Navigator',
                'modelo': 'A4-75g',
                'categoria': 'Papel',
                'stock': 50,
                'precio': 3500,
                'descripcion': 'Resma 500 hojas papel bond carta',
                'codigo_barras': '7802468135790'
            },
            {
                'nombre': 'Toner Brother TN-760',
                'marca': 'Brother',
                'modelo': 'TN-760',
                'categoria': 'Toner',
                'stock': 8,
                'precio': 52000,
                'descripcion': 'Toner original Brother alto rendimiento',
                'codigo_barras': '7805551234567'
            },
            {
                'nombre': 'Cartucho Canon PG-245XL',
                'marca': 'Canon',
                'modelo': 'PG-245XL',
                'categoria': 'Cartucho',
                'stock': 3,
                'precio': 28000,
                'descripcion': 'Cartucho negro de alto rendimiento',
                'codigo_barras': '7807890123456'
            }
        ]
        
        productos_creados = []
        for data in productos_data:
            producto = Producto.objects.create(**data)
            productos_creados.append(producto)
            
            # Crear alerta para productos con stock bajo
            if producto.stock < 10:
                Alerta.objects.create(
                    producto=producto,
                    umbral=10,
                    activa=True
                )
        
        # Crear algunos movimientos de ejemplo
        if len(productos_creados) >= 2:
            Movimiento.objects.create(
                producto=productos_creados[0],
                tipo='ENTRADA',
                cantidad=10,
                descripcion='Entrada inicial de stock'
            )
            Movimiento.objects.create(
                producto=productos_creados[1],
                tipo='SALIDA',
                cantidad=5,
                descripcion='Venta a cliente'
            )
        
        return Response({
            'message': 'Base de datos poblada',
            'status': 'success',
            'productos': len(productos_creados)
        })
    except Exception as e:
        return Response({'message': str(e), 'status': 'error'}, status=500)
