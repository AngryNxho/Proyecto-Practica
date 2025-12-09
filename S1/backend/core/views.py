from rest_framework import viewsets, filters, status
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
import logging

# Configurar logger para esta aplicación
logger = logging.getLogger(__name__)

class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD de productos con paginación y filtros
    
    Endpoints disponibles:
    - GET /api/productos/ - Lista todos los productos (paginado)
    - POST /api/productos/ - Crea un nuevo producto
    - GET /api/productos/{id}/ - Obtiene un producto específico
    - PUT /api/productos/{id}/ - Actualiza un producto completo
    - PATCH /api/productos/{id}/ - Actualiza parcialmente un producto
    - DELETE /api/productos/{id}/ - Elimina un producto
    - GET /api/productos/estadisticas/ - Estadísticas del inventario
    - GET /api/productos/exportar_csv/ - Exporta productos a CSV
    - POST /api/productos/{id}/registrar_entrada/ - Registra entrada de stock
    - POST /api/productos/{id}/registrar_salida/ - Registra salida de stock
    
    Filtros disponibles:
    - categoria: Filtra por categoría exacta
    - marca: Filtra por marca exacta
    - stock_min: Filtra productos con stock mayor o igual
    - stock_max: Filtra productos con stock menor o igual
    
    Búsqueda (search): Busca en nombre, marca, modelo, descripción, categoría
    
    Ordenamiento (ordering): nombre, stock, precio, fecha_creacion, categoria
    """
    queryset = Producto.objects.all().order_by('-fecha_creacion')
    serializer_class = ProductoSerializer
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductoFilter
    search_fields = ['nombre', 'marca', 'modelo', 'descripcion', 'categoria']
    ordering_fields = ['nombre', 'stock', 'precio', 'fecha_creacion', 'categoria']
    ordering = ['-fecha_creacion']
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Obtiene estadísticas generales del inventario
        
        Optimizado con agregaciones de base de datos para mejorar performance.
        
        Returns:
            Response con estadísticas completas del inventario incluyendo:
            - total_productos: Número total de productos
            - stock_critico: Productos con stock <= 5
            - stock_bajo: Productos con stock entre 6 y 10
            - stock_normal: Productos con stock > 10
            - valor_inventario: Valor total del inventario
            - por_categoria: Estadísticas agrupadas por categoría
        """
        from django.db.models import Sum, Count, Q, F
        from decimal import Decimal
        
        # Optimización: usar agregaciones en lugar de iterar
        productos = Producto.objects.all()
        
        # Contadores de stock
        total = productos.count()
        critico = productos.filter(stock__lte=5).count()
        bajo = productos.filter(stock__gt=5, stock__lte=10).count()
        normal = productos.filter(stock__gt=10).count()
        
        # Calcular valor total usando agregación de base de datos
        valor_total = productos.aggregate(
            total=Sum(F('stock') * F('precio'))
        )['total'] or Decimal('0')
        
        # Productos por categoría usando agregación
        categorias_stats = productos.values('categoria').annotate(
            cantidad=Count('id'),
            stock_total=Sum('stock'),
            valor_total=Sum(F('stock') * F('precio'))
        ).order_by('-cantidad')
        
        categorias = {
            stat['categoria']: {
                'cantidad': stat['cantidad'],
                'stock_total': stat['stock_total'] or 0,
                'valor_total': float(stat['valor_total'] or 0)
            }
            for stat in categorias_stats
        }
        
        return Response({
            'total_productos': total,
            'stock_critico': critico,
            'stock_bajo': bajo,
            'stock_normal': normal,
            'valor_inventario': round(float(valor_total), 2),
            'por_categoria': categorias
        })
    
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
        """
        Registra entrada de stock para un producto
        
        Args:
            cantidad (int): Cantidad a ingresar (debe ser > 0)
            descripcion (str): Descripción del movimiento
        
        Returns:
            MovimientoSerializer con los datos del movimiento creado
        
        Raises:
            400: Si la cantidad es inválida o hay error en el registro
        """
        producto = self.get_object()
        cantidad = request.data.get('cantidad', 0)
        descripcion = request.data.get('descripcion', '')
        
        try:
            logger.info(
                f"Registrando entrada - Producto: {producto.id} ({producto.nombre}), "
                f"Cantidad: {cantidad}, Usuario: {request.user}"
            )
            movimiento = producto.registrar_entrada(cantidad, descripcion)
            serializer = MovimientoSerializer(movimiento)
            logger.info(f"Entrada registrada exitosamente - Movimiento ID: {movimiento.id}")
            return Response(serializer.data)
        except ValueError as e:
            logger.warning(
                f"Error al registrar entrada - Producto: {producto.id}, "
                f"Cantidad: {cantidad}, Error: {str(e)}"
            )
            return Response(
                {'error': str(e), 'producto': producto.nombre},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(
                f"Error inesperado al registrar entrada - Producto: {producto.id}, "
                f"Error: {str(e)}", exc_info=True
            )
            return Response(
                {'error': 'Error interno al procesar la entrada'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def registrar_salida(self, request, pk=None):
        """
        Registra salida de stock para un producto
        
        Args:
            cantidad (int): Cantidad a retirar (debe ser > 0 y <= stock actual)
            descripcion (str): Descripción del movimiento
        
        Returns:
            MovimientoSerializer con los datos del movimiento creado
        
        Raises:
            400: Si la cantidad es inválida o hay stock insuficiente
        """
        producto = self.get_object()
        cantidad = request.data.get('cantidad', 0)
        descripcion = request.data.get('descripcion', '')
        
        try:
            logger.info(
                f"Registrando salida - Producto: {producto.id} ({producto.nombre}), "
                f"Cantidad: {cantidad}, Stock actual: {producto.stock}, Usuario: {request.user}"
            )
            movimiento = producto.registrar_salida(cantidad, descripcion)
            serializer = MovimientoSerializer(movimiento)
            logger.info(
                f"Salida registrada exitosamente - Movimiento ID: {movimiento.id}, "
                f"Stock restante: {producto.stock}"
            )
            return Response(serializer.data)
        except ValueError as e:
            logger.warning(
                f"Error al registrar salida - Producto: {producto.id}, "
                f"Cantidad solicitada: {cantidad}, Stock disponible: {producto.stock}, "
                f"Error: {str(e)}"
            )
            return Response(
                {
                    'error': str(e),
                    'producto': producto.nombre,
                    'stock_disponible': producto.stock,
                    'cantidad_solicitada': cantidad
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(
                f"Error inesperado al registrar salida - Producto: {producto.id}, "
                f"Error: {str(e)}", exc_info=True
            )
            return Response(
                {'error': 'Error interno al procesar la salida'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MovimientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para movimientos de stock con paginación y filtros
    
    Endpoints disponibles:
    - GET /api/movimientos/ - Lista todos los movimientos (paginado)
    - POST /api/movimientos/ - Crea un nuevo movimiento (no recomendado, usar endpoints de producto)
    - GET /api/movimientos/{id}/ - Obtiene un movimiento específico
    - DELETE /api/movimientos/{id}/ - Elimina un movimiento
    - GET /api/movimientos/exportar_csv/ - Exporta movimientos a CSV
    
    Filtros disponibles:
    - tipo: Filtra por tipo de movimiento (ENTRADA/SALIDA)
    - producto: Filtra por ID de producto
    - fecha_desde: Filtra movimientos desde esta fecha
    - fecha_hasta: Filtra movimientos hasta esta fecha
    
    Ordenamiento (ordering): fecha, cantidad
    
    Nota: Se recomienda usar los endpoints registrar_entrada y registrar_salida
    del ProductoViewSet en lugar de crear movimientos directamente.
    """
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
    """
    ViewSet para alertas de stock con paginación y filtros
    
    Endpoints disponibles:
    - GET /api/alertas/ - Lista todas las alertas (paginadas)
    - POST /api/alertas/ - Crea una nueva alerta
    - GET /api/alertas/{id}/ - Obtiene una alerta específica
    - PUT /api/alertas/{id}/ - Actualiza una alerta completa
    - PATCH /api/alertas/{id}/ - Actualiza parcialmente una alerta
    - DELETE /api/alertas/{id}/ - Elimina una alerta
    - GET /api/alertas/activas/ - Lista solo alertas activas
    
    Filtros disponibles:
    - activa: Filtra por estado de alerta (true/false)
    - producto: Filtra por ID de producto
    
    Ordenamiento (ordering): fecha_creacion, umbral
    
    Nota: Las alertas se activan/desactivan automáticamente cuando el stock
    del producto cambia según el umbral configurado.
    """
    queryset = Alerta.objects.all().select_related('producto').order_by('-fecha_creacion')
    serializer_class = AlertaSerializer
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = AlertaFilter
    ordering_fields = ['fecha_creacion', 'umbral']
    ordering = ['-fecha_creacion']
    
    @action(detail=False, methods=['get'])
    def activas(self, request):
        """Obtiene solo las alertas activas"""
        alertas_activas = self.queryset.filter(activa=True)
        serializer = self.get_serializer(alertas_activas, many=True)
        return Response({
            'total': alertas_activas.count(),
            'alertas': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        """Marca una alerta como resuelta (desactiva)"""
        alerta = self.get_object()
        alerta.activa = False
        alerta.save()
        serializer = self.get_serializer(alerta)
        return Response(serializer.data)


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
            # Impresoras
            {
                'nombre': 'Impresora HP LaserJet Pro M404dn',
                'marca': 'HP',
                'modelo': 'M404dn',
                'categoria': 'Impresora',
                'stock': 3,
                'precio': 285000,
                'descripcion': 'Impresora láser monocromática, 38 ppm, dúplex',
                'codigo_barras': '7801234567890'
            },
            {
                'nombre': 'Impresora Canon Pixma G3110',
                'marca': 'Canon',
                'modelo': 'G3110',
                'categoria': 'Impresora',
                'stock': 5,
                'precio': 195000,
                'descripcion': 'Multifuncional de tinta continua WiFi',
                'codigo_barras': '7801234567891'
            },
            {
                'nombre': 'Impresora Epson EcoTank L3250',
                'marca': 'Epson',
                'modelo': 'L3250',
                'categoria': 'Impresora',
                'stock': 4,
                'precio': 220000,
                'descripcion': 'Multifuncional con tanque de tinta WiFi',
                'codigo_barras': '7801234567892'
            },
            {
                'nombre': 'Impresora Brother DCP-L2540DW',
                'marca': 'Brother',
                'modelo': 'DCP-L2540DW',
                'categoria': 'Impresora',
                'stock': 2,
                'precio': 175000,
                'descripcion': 'Multifuncional láser monocromática WiFi',
                'codigo_barras': '7801234567893'
            },
            # Tóners Negro
            {
                'nombre': 'Tóner HP 414A Negro',
                'marca': 'HP',
                'modelo': 'W2020A',
                'categoria': 'Toner',
                'stock': 15,
                'precio': 48000,
                'descripcion': 'Tóner original negro para HP Color LaserJet Pro',
                'codigo_barras': '7801234567894'
            },
            {
                'nombre': 'Tóner Canon 046 Negro',
                'marca': 'Canon',
                'modelo': '046BK',
                'categoria': 'Toner',
                'stock': 12,
                'precio': 45000,
                'descripcion': 'Tóner original negro para Canon i-SENSYS',
                'codigo_barras': '7801234567895'
            },
            {
                'nombre': 'Tóner Brother TN-760',
                'marca': 'Brother',
                'modelo': 'TN-760',
                'categoria': 'Toner',
                'stock': 8,
                'precio': 52000,
                'descripcion': 'Tóner original alto rendimiento negro',
                'codigo_barras': '7801234567896'
            },
            # Tóners Cyan
            {
                'nombre': 'Tóner HP 414A Cyan',
                'marca': 'HP',
                'modelo': 'W2021A',
                'categoria': 'Toner',
                'stock': 10,
                'precio': 62000,
                'descripcion': 'Tóner original cyan para HP Color LaserJet Pro',
                'codigo_barras': '7801234567897'
            },
            {
                'nombre': 'Tóner Canon 046 Cyan',
                'marca': 'Canon',
                'modelo': '046C',
                'categoria': 'Toner',
                'stock': 9,
                'precio': 58000,
                'descripcion': 'Tóner original cyan para Canon i-SENSYS',
                'codigo_barras': '7801234567898'
            },
            # Tóners Magenta
            {
                'nombre': 'Tóner HP 414A Magenta',
                'marca': 'HP',
                'modelo': 'W2023A',
                'categoria': 'Toner',
                'stock': 11,
                'precio': 62000,
                'descripcion': 'Tóner original magenta para HP Color LaserJet Pro',
                'codigo_barras': '7801234567899'
            },
            {
                'nombre': 'Tóner Canon 046 Magenta',
                'marca': 'Canon',
                'modelo': '046M',
                'categoria': 'Toner',
                'stock': 7,
                'precio': 58000,
                'descripcion': 'Tóner original magenta para Canon i-SENSYS',
                'codigo_barras': '7801234567900'
            },
            # Tóners Yellow
            {
                'nombre': 'Tóner HP 414A Amarillo',
                'marca': 'HP',
                'modelo': 'W2022A',
                'categoria': 'Toner',
                'stock': 10,
                'precio': 62000,
                'descripcion': 'Tóner original amarillo para HP Color LaserJet Pro',
                'codigo_barras': '7801234567901'
            },
            {
                'nombre': 'Tóner Canon 046 Amarillo',
                'marca': 'Canon',
                'modelo': '046Y',
                'categoria': 'Toner',
                'stock': 8,
                'precio': 58000,
                'descripcion': 'Tóner original amarillo para Canon i-SENSYS',
                'codigo_barras': '7801234567902'
            },
            # Tintas
            {
                'nombre': 'Tinta Epson 544 Negro',
                'marca': 'Epson',
                'modelo': 'T544120',
                'categoria': 'Tinta',
                'stock': 20,
                'precio': 12000,
                'descripcion': 'Botella de tinta negra 65ml para EcoTank',
                'codigo_barras': '7801234567903'
            },
            {
                'nombre': 'Tinta Epson 544 Cyan',
                'marca': 'Epson',
                'modelo': 'T544220',
                'categoria': 'Tinta',
                'stock': 18,
                'precio': 12000,
                'descripcion': 'Botella de tinta cyan 65ml para EcoTank',
                'codigo_barras': '7801234567904'
            },
            {
                'nombre': 'Tinta Canon GI-790 Negro',
                'marca': 'Canon',
                'modelo': 'GI-790BK',
                'categoria': 'Tinta',
                'stock': 16,
                'precio': 11500,
                'descripcion': 'Botella de tinta negra para Pixma G',
                'codigo_barras': '7801234567905'
            },
            # Consumibles
            {
                'nombre': 'Papel Bond Carta Navigator',
                'marca': 'Navigator',
                'modelo': 'A4-75g',
                'categoria': 'Papel',
                'stock': 50,
                'precio': 3500,
                'descripcion': 'Resma 500 hojas papel bond carta 75g',
                'codigo_barras': '7801234567906'
            },
            {
                'nombre': 'Papel Fotográfico HP Premium',
                'marca': 'HP',
                'modelo': 'Q8692A',
                'categoria': 'Papel',
                'stock': 25,
                'precio': 8500,
                'descripcion': 'Papel fotográfico glossy 50 hojas A4',
                'codigo_barras': '7801234567907'
            },
            {
                'nombre': 'Tambor Brother DR-2340',
                'marca': 'Brother',
                'modelo': 'DR-2340',
                'categoria': 'Tambor',
                'stock': 4,
                'precio': 85000,
                'descripcion': 'Unidad de tambor original 12000 páginas',
                'codigo_barras': '7801234567908'
            },
            {
                'nombre': 'Kit Mantenimiento HP M404',
                'marca': 'HP',
                'modelo': 'J8J88A',
                'categoria': 'Kit',
                'stock': 2,
                'precio': 125000,
                'descripcion': 'Kit de mantenimiento 225K páginas',
                'codigo_barras': '7801234567909'
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
