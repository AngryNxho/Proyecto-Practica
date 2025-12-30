from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet, MovimientoViewSet, AlertaViewSet, reset_database, populate_database
from .salud import verificacion_rapida, verificacion_detallada, obtener_metricas, estado_completo

# Router de Django Rest Framework para generar URLs automáticamente
router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'movimientos', MovimientoViewSet, basename='movimiento')
router.register(r'alertas', AlertaViewSet, basename='alerta')

urlpatterns = [
    path('', include(router.urls)),
    
    # Endpoints de monitoreo
    path('salud/', verificacion_rapida, name='verificacion-rapida'),
    path('salud/detallado/', verificacion_detallada, name='verificacion-detallada'),
    path('metricas/', obtener_metricas, name='obtener-metricas'),
    path('estado/', estado_completo, name='estado-completo'),
    
    # Endpoints de desarrollo - ELIMINAR EN PRODUCCIÓN
    path('dev/reset/', reset_database, name='reset-database'),
    path('dev/populate/', populate_database, name='populate-database'),
]
