from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch
from django.utils import timezone
from django.core.cache import cache
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
    queryset = Producto.objects.select_related().prefetch_related(
        'alertas',
        'movimientos'
    ).all().order_by('-fecha_creacion')
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
    def metricas_dashboard(self, request):
        """
        Endpoint completo para el dashboard con todas las métricas necesarias
        Optimizado con caché y consultas eficientes
        """
        from django.db.models import Sum, Count, Q, F, Avg, Max, Min
        from decimal import Decimal
        
        # Verificar si hay datos en caché (TTL 5 minutos)
        cache_key = 'metricas_dashboard'
        cached_data = cache.get(cache_key)
        
        if cached_data is not None and not request.query_params.get('refresh'):
            logger.info("Métricas dashboard obtenidas desde caché")
            return Response(cached_data)
        
        logger.info("Generando métricas dashboard (no en caché)")
        
        # Optimización: usar select_related y prefetch_related para reducir queries
        productos = Producto.objects.only('id', 'nombre', 'stock', 'precio', 'categoria')
        movimientos = Movimiento.objects.select_related('producto').only(
            'id', 'producto__nombre', 'tipo', 'fecha', 'cantidad'
        )
        alertas = Alerta.objects.only('activa')
        
        # Métricas básicas de productos (optimizado con una sola query)
        stats = productos.aggregate(
            total_productos=Count('id'),
            stock_total=Sum('stock'),
            valor_total=Sum(F('stock') * F('precio')),
            precio_promedio=Avg('precio'),
            precio_max=Max('precio'),
            precio_min=Min('precio')
        )
        
        # Clasificación por stock (optimizado con una sola query)
        stock_clasificacion = productos.aggregate(
            critico=Count('id', filter=Q(stock__lte=5)),
            bajo=Count('id', filter=Q(stock__gt=5, stock__lte=10)),
            normal=Count('id', filter=Q(stock__gt=10))
        )
        
        # Alertas activas
        alertas_activas = alertas.filter(activa=True).count()
        
        # Top 5 productos más movidos
        from django.db.models import Count as CountAgg
        productos_mas_movidos = list(
            movimientos.values('producto__nombre').annotate(
                total_movimientos=CountAgg('id')
            ).order_by('-total_movimientos')[:5]
        )
        
        # Movimientos del día (optimizado)
        hoy = timezone.now().date()
        movimientos_hoy_stats = movimientos.filter(fecha__date=hoy).aggregate(
            entradas=Count('id', filter=Q(tipo='ENTRADA')),
            salidas=Count('id', filter=Q(tipo='SALIDA'))
        )
        
        # Top 3 categorías por cantidad
        top_categorias = list(
            productos.values('categoria').annotate(
                cantidad=CountAgg('id')
            ).order_by('-cantidad')[:3]
        )
        
        # Top 3 categorías por valor
        top_valor_categoria = [
            {
                'categoria': item['categoria'],
                'valor': round(float(item['valor'] or 0), 2)
            }
            for item in productos.values('categoria').annotate(
                valor=Sum(F('stock') * F('precio'))
            ).order_by('-valor')[:3]
        ]
        
        # Movimientos de última semana (optimizado con una query)
        hace_7_dias = timezone.now() - timezone.timedelta(days=7)
        movimientos_semana = movimientos.filter(fecha__gte=hace_7_dias)
        
        # Generar datos por día usando agregación
        movimientos_por_dia = []
        for i in range(7):
            dia = timezone.now() - timezone.timedelta(days=i)
            stats_dia = movimientos_semana.filter(fecha__date=dia.date()).aggregate(
                entradas=Count('id', filter=Q(tipo='ENTRADA')),
                salidas=Count('id', filter=Q(tipo='SALIDA'))
            )
            movimientos_por_dia.append({
                'fecha': dia.strftime('%Y-%m-%d'),
                'entradas': stats_dia['entradas'],
                'salidas': stats_dia['salidas']
            })
        
        data = {
            'resumen': {
                'total_productos': stats['total_productos'] or 0,
                'stock_total': stats['stock_total'] or 0,
                'valor_total': round(float(stats['valor_total'] or 0), 2),
                'alertas_activas': alertas_activas,
            },
            'stock': {
                'critico': stock_clasificacion['critico'],
                'bajo': stock_clasificacion['bajo'],
                'normal': stock_clasificacion['normal']
            },
            'actividad_hoy': {
                'entradas': movimientos_hoy_stats['entradas'],
                'salidas': movimientos_hoy_stats['salidas'],
                'total': movimientos_hoy_stats['entradas'] + movimientos_hoy_stats['salidas']
            },
            'productos_mas_movidos': productos_mas_movidos,
            'top_categorias': top_categorias,
            'top_valor_categoria': top_valor_categoria,
            'precio_stats': {
                'promedio': round(float(stats['precio_promedio'] or 0), 2),
                'maximo': round(float(stats['precio_max'] or 0), 2),
                'minimo': round(float(stats['precio_min'] or 0), 2)
            },
            'movimientos_semana': movimientos_por_dia
        }
        
        # Guardar en caché por 5 minutos (300 segundos)
        cache.set(cache_key, data, 300)
        logger.info("Métricas dashboard guardadas en caché")
        
        return Response(data)
    
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

    @action(detail=False, methods=['post'])
    def importar_csv(self, request):
        """
        Importa productos desde un archivo CSV
        Formato esperado: nombre,marca,modelo,categoria,stock,precio,descripcion,codigo_barras
        """
        if 'archivo' not in request.FILES:
            return Response(
                {'error': 'No se proporcionó ningún archivo'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        archivo = request.FILES['archivo']
        
        if not archivo.name.endswith('.csv'):
            return Response(
                {'error': 'El archivo debe ser un CSV'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Leer el archivo CSV
            contenido = archivo.read().decode('utf-8-sig')  # utf-8-sig maneja el BOM
            lineas = contenido.split('\n')
            
            creados = 0
            actualizados = 0
            errores = []
            
            # Procesar cada línea (saltando la cabecera)
            for i, linea in enumerate(lineas[1:], start=2):
                if not linea.strip():
                    continue
                
                try:
                    partes = linea.strip().split(',')
                    if len(partes) < 5:
                        errores.append(f'Línea {i}: formato incorrecto (faltan campos)')
                        continue
                    
                    nombre = partes[0].strip()
                    marca = partes[1].strip() if len(partes) > 1 else ''
                    modelo = partes[2].strip() if len(partes) > 2 else ''
                    categoria = partes[3].strip() if len(partes) > 3 else ''
                    stock = int(partes[4].strip()) if len(partes) > 4 and partes[4].strip() else 0
                    precio = float(partes[5].strip()) if len(partes) > 5 and partes[5].strip() else 0
                    descripcion = partes[6].strip() if len(partes) > 6 else ''
                    codigo_barras = partes[7].strip() if len(partes) > 7 else None
                    
                    # Buscar si existe el producto (por código de barras o nombre+marca+modelo)
                    producto_existente = None
                    if codigo_barras:
                        producto_existente = Producto.objects.filter(codigo_barras=codigo_barras).first()
                    
                    if not producto_existente and nombre and marca and modelo:
                        producto_existente = Producto.objects.filter(
                            nombre=nombre,
                            marca=marca,
                            modelo=modelo
                        ).first()
                    
                    if producto_existente:
                        # Actualizar producto existente
                        producto_existente.stock = stock
                        producto_existente.precio = precio
                        if descripcion:
                            producto_existente.descripcion = descripcion
                        producto_existente.save()
                        actualizados += 1
                    else:
                        # Crear nuevo producto
                        Producto.objects.create(
                            nombre=nombre,
                            marca=marca,
                            modelo=modelo,
                            categoria=categoria,
                            stock=stock,
                            precio=precio,
                            descripcion=descripcion,
                            codigo_barras=codigo_barras if codigo_barras else None
                        )
                        creados += 1
                
                except Exception as e:
                    errores.append(f'Línea {i}: {str(e)}')
            
            return Response({
                'creados': creados,
                'actualizados': actualizados,
                'errores': errores,
                'total_procesados': creados + actualizados
            })
        
        except Exception as e:
            return Response(
                {'error': f'Error al procesar el archivo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def exportar_reporte(self, request):
        """
        Exporta reporte filtrado de productos con análisis adicional
        Parámetros opcionales:
        - categoria: filtrar por categoría
        - fecha_desde: fecha inicio (YYYY-MM-DD)
        - fecha_hasta: fecha fin (YYYY-MM-DD)
        - formato: csv (por defecto)
        """
        from django.db.models import Sum, F
        
        categoria = request.query_params.get('categoria')
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        
        productos = Producto.objects.all()
        
        if categoria and categoria != 'todas':
            productos = productos.filter(categoria=categoria)
        
        if fecha_desde:
            productos = productos.filter(fecha_creacion__gte=fecha_desde)
        
        if fecha_hasta:
            productos = productos.filter(fecha_creacion__lte=fecha_hasta + ' 23:59:59')
        
        productos = productos.order_by('categoria', 'nombre')
        
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="reporte_inventario_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        
        # Encabezado del reporte
        writer.writerow(['REPORTE DE INVENTARIO'])
        writer.writerow(['Generado:', datetime.now().strftime('%d/%m/%Y %H:%M:%S')])
        writer.writerow(['Categoría:', categoria if categoria and categoria != 'todas' else 'Todas'])
        writer.writerow([])
        
        # Datos de productos
        writer.writerow(['ID', 'Nombre', 'Marca', 'Modelo', 'Categoría', 'Stock', 'Precio Unit.', 'Valor Total', 'Estado Stock'])
        
        total_productos = 0
        stock_total = 0
        valor_total = 0
        tz_chile = pytz.timezone('America/Santiago')
        
        for producto in productos:
            valor_producto = float(producto.precio) * producto.stock
            
            # Determinar estado del stock
            if producto.stock <= 5:
                estado = 'CRÍTICO'
            elif producto.stock <= 10:
                estado = 'BAJO'
            else:
                estado = 'NORMAL'
            
            writer.writerow([
                producto.id,
                producto.nombre,
                producto.marca,
                producto.modelo,
                producto.categoria,
                producto.stock,
                f"${producto.precio:,.0f}",
                f"${valor_producto:,.0f}",
                estado
            ])
            
            total_productos += 1
            stock_total += producto.stock
            valor_total += valor_producto
        
        # Resumen
        writer.writerow([])
        writer.writerow(['RESUMEN'])
        writer.writerow(['Total Productos:', total_productos])
        writer.writerow(['Stock Total:', stock_total])
        writer.writerow(['Valor Total Inventario:', f"${valor_total:,.0f}"])
        
        # Análisis por categoría
        if not categoria or categoria == 'todas':
            writer.writerow([])
            writer.writerow(['ANÁLISIS POR CATEGORÍA'])
            writer.writerow(['Categoría', 'Cantidad Productos', 'Stock Total', 'Valor Total'])
            
            from django.db.models import Count
            categorias = Producto.objects.values('categoria').annotate(
                cantidad=Count('id'),
                stock_total=Sum('stock'),
                valor=Sum(F('stock') * F('precio'))
            ).order_by('-valor')
            
            for cat in categorias:
                writer.writerow([
                    cat['categoria'],
                    cat['cantidad'],
                    cat['stock_total'],
                    f"${cat['valor']:,.0f}"
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
            usuario_str = str(request.user) if request.user.is_authenticated else 'Anónimo'
            logger.info(
                f"Registrando entrada - Producto: {producto.id} ({producto.nombre}), "
                f"Cantidad: {cantidad}, Usuario: {usuario_str}"
            )
            movimiento = producto.registrar_entrada(cantidad, descripcion, usuario=usuario_str)
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
            usuario_str = str(request.user) if request.user.is_authenticated else 'Anónimo'
            logger.info(
                f"Registrando salida - Producto: {producto.id} ({producto.nombre}), "
                f"Cantidad: {cantidad}, Stock actual: {producto.stock}, Usuario: {usuario_str}"
            )
            movimiento = producto.registrar_salida(cantidad, descripcion, usuario=usuario_str)
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
        """
        Exporta movimientos a CSV con optimización de queries
        Aplica filtros de la queryset actual para exportar solo datos relevantes
        """
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="movimientos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Producto', 'Tipo', 'Cantidad', 'Fecha', 'Descripción'])
        
        # Optimización: usar select_related para evitar N+1 queries
        # Aplicar filtros del request para exportar solo datos filtrados
        movimientos = self.filter_queryset(self.get_queryset()).select_related('producto').order_by('-fecha')
        tz_chile = pytz.timezone('America/Santiago')
        
        # Usar iterator() para manejar grandes datasets sin cargar todo en memoria
        for mov in movimientos.iterator(chunk_size=1000):
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
        """
        Obtiene solo las alertas activas con caché de 5 minutos
        para reducir carga en la base de datos
        """
        # Intentar obtener desde caché
        cache_key = 'alertas_activas'
        alertas_cached = cache.get(cache_key)
        
        if alertas_cached is not None:
            return Response(alertas_cached)
        
        # Si no está en caché, consultar BD
        alertas_activas = self.queryset.filter(activa=True)
        serializer = self.get_serializer(alertas_activas, many=True)
        
        response_data = {
            'total': alertas_activas.count(),
            'alertas': serializer.data
        }
        
        # Guardar en caché por 5 minutos
        cache.set(cache_key, response_data, 300)
        
        return Response(response_data)
    
    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        """Marca una alerta como resuelta (desactiva)"""
        alerta = self.get_object()
        alerta.activa = False
        alerta.save()
        serializer = self.get_serializer(alerta)
        return Response(serializer.data)


# ========== ENDPOINTS DE DESARROLLO - ELIMINAR EN PRODUCCIÓN ==========

from .decoradores import solo_desarrollo, requiere_confirmacion, registrar_operacion

@api_view(['POST'])
@solo_desarrollo
@requiere_confirmacion('confirmar_borrado')
@registrar_operacion('limpieza de base de datos')
def reset_database(request):
    """SOLO DESARROLLO: Borra todos los datos de la base de datos"""
    try:
        cantidad_movimientos = Movimiento.objects.count()
        cantidad_alertas = Alerta.objects.count()
        cantidad_productos = Producto.objects.count()
        
        Movimiento.objects.all().delete()
        Alerta.objects.all().delete()
        Producto.objects.all().delete()
        
        return Response({
            'message': 'Base de datos limpiada exitosamente',
            'status': 'success',
            'eliminados': {
                'productos': cantidad_productos,
                'movimientos': cantidad_movimientos,
                'alertas': cantidad_alertas
            }
        })
    except Exception as e:
        logger.error(f"Error al limpiar base de datos: {str(e)}", exc_info=True)
        return Response({'message': str(e), 'status': 'error'}, status=500)


@api_view(['POST'])
@solo_desarrollo
@registrar_operacion('población de base de datos')
def populate_database(request):
    """SOLO DESARROLLO: Inserta catálogo completo de productos con stock variado"""
    try:
        from catalogo_productos import CATALOGO_PRODUCTOS
        import random
        
        # Limpiar primero
        Movimiento.objects.all().delete()
        Alerta.objects.all().delete()
        Producto.objects.all().delete()
        
        productos_creados = []
        for data in CATALOGO_PRODUCTOS:
            # Asignar stock aleatorio para simular inventario real
            producto_data = data.copy()
            
            # Stock variado según categoría
            if producto_data['categoria'] == 'Impresora':
                producto_data['stock'] = random.randint(0, 8)  # 0-8 impresoras
            elif producto_data['categoria'] == 'Toner':
                producto_data['stock'] = random.randint(5, 25)  # 5-25 toners
            elif producto_data['categoria'] == 'Tinta':
                producto_data['stock'] = random.randint(10, 40)  # 10-40 tintas
            elif producto_data['categoria'] == 'Papel':
                producto_data['stock'] = random.randint(20, 100)  # 20-100 resmas
            elif producto_data['categoria'] == 'Repuesto':
                producto_data['stock'] = random.randint(0, 10)  # 0-10 repuestos
            elif producto_data['categoria'] == 'Accesorio':
                producto_data['stock'] = random.randint(5, 30)  # 5-30 accesorios
            elif producto_data['categoria'] == 'Cinta':
                producto_data['stock'] = random.randint(3, 15)  # 3-15 cintas
            else:
                producto_data['stock'] = random.randint(0, 20)  # Por defecto
            
            producto = Producto.objects.create(**producto_data)
            productos_creados.append(producto)
        
        # Crear alertas para productos con stock crítico
        alertas_creadas = 0
        for producto in productos_creados:
            if producto.stock <= 5:
                Alerta.objects.create(
                    producto=producto,
                    umbral=10,
                    activa=True
                )
                alertas_creadas += 1
        
        return Response({
            'message': f'Catálogo completo insertado con stock variado',
            'status': 'success',
            'productos': len(productos_creados),
            'alertas_creadas': alertas_creadas,
            'detalle': {
                'impresoras': len([p for p in CATALOGO_PRODUCTOS if p['categoria'] == 'Impresora']),
                'toners': len([p for p in CATALOGO_PRODUCTOS if p['categoria'] == 'Toner']),
                'tintas': len([p for p in CATALOGO_PRODUCTOS if p['categoria'] == 'Tinta']),
                'papel': len([p for p in CATALOGO_PRODUCTOS if p['categoria'] == 'Papel']),
                'repuestos': len([p for p in CATALOGO_PRODUCTOS if p['categoria'] == 'Repuesto']),
                'accesorios': len([p for p in CATALOGO_PRODUCTOS if p['categoria'] == 'Accesorio']),
                'cintas': len([p for p in CATALOGO_PRODUCTOS if p['categoria'] == 'Cinta']),
            }
        })
    except Exception as e:
        return Response({'message': str(e), 'status': 'error'}, status=500)


@api_view(['GET'])
def analisis_inventario(request):
    """
    Endpoint de análisis avanzado del inventario
    Proporciona métricas detalladas, proyecciones y recomendaciones
    """
    from django.db.models import Avg, StdDev, Max, Min, Sum
    from datetime import timedelta
    
    productos = Producto.objects.all()
    
    # Análisis de stock
    stock_stats = productos.aggregate(
        promedio=Avg('stock'),
        desviacion=StdDev('stock'),
        maximo=Max('stock'),
        minimo=Min('stock')
    )
    
    # Productos críticos
    criticos = productos.filter(stock__lte=5).values('id', 'nombre', 'stock', 'categoria')
    
    # Análisis de movimientos recientes (últimos 30 días)
    hace_30_dias = timezone.now() - timedelta(days=30)
    movimientos_recientes = Movimiento.objects.filter(fecha__gte=hace_30_dias)
    
    entradas_recientes = movimientos_recientes.filter(tipo='ENTRADA').count()
    salidas_recientes = movimientos_recientes.filter(tipo='SALIDA').count()
    
    # Productos más movidos
    from django.db.models import Count
    productos_activos = movimientos_recientes.values('producto__nombre').annotate(
        total_movimientos=Count('id')
    ).order_by('-total_movimientos')[:10]
    
    # Análisis de valor
    from django.db.models import F
    valor_inventario = productos.aggregate(
        total=Sum(F('stock') * F('precio'))
    )['total'] or 0
    
    # Distribución por categoría
    distribucion = productos.values('categoria').annotate(
        cantidad_productos=Count('id'),
        stock_total=Sum('stock'),
        valor_categoria=Sum(F('stock') * F('precio'))
    ).order_by('-valor_categoria')
    
    # Productos sin movimientos
    productos_sin_movimiento = productos.filter(
        movimientos__isnull=True
    ).count()
    
    # Recomendaciones
    recomendaciones = []
    if criticos.count() > 5:
        recomendaciones.append("Alto número de productos críticos. Considere reabastecer.")
    if productos_sin_movimiento > 0:
        recomendaciones.append(f"{productos_sin_movimiento} productos sin movimientos registrados.")
    if salidas_recientes > entradas_recientes * 2:
        recomendaciones.append("Salidas superan significativamente a entradas. Revisar política de compras.")
    
    return Response({
        'fecha_analisis': timezone.now().isoformat(),
        'stock_estadisticas': {
            'promedio': round(stock_stats['promedio'] or 0, 2),
            'desviacion_estandar': round(stock_stats['desviacion'] or 0, 2),
            'maximo': stock_stats['maximo'] or 0,
            'minimo': stock_stats['minimo'] or 0
        },
        'productos_criticos': {
            'cantidad': len(criticos),
            'lista': list(criticos)
        },
        'movimientos_30_dias': {
            'entradas': entradas_recientes,
            'salidas': salidas_recientes,
            'ratio': round(salidas_recientes / entradas_recientes, 2) if entradas_recientes > 0 else 0
        },
        'productos_mas_activos': list(productos_activos),
        'valor_inventario': float(valor_inventario),
        'distribucion_categorias': list(distribucion),
        'productos_sin_movimiento': productos_sin_movimiento,
        'recomendaciones': recomendaciones
    })
