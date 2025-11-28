from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet, MovimientoViewSet, AlertaViewSet, reset_database, populate_database

# Router de Django Rest Framework para generar URLs automáticamente
router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'movimientos', MovimientoViewSet, basename='movimiento')
router.register(r'alertas', AlertaViewSet, basename='alerta')

urlpatterns = [
    path('', include(router.urls)),
    # Endpoints de desarrollo - ELIMINAR EN PRODUCCIÓN
    path('dev/reset/', reset_database, name='reset-database'),
    path('dev/populate/', populate_database, name='populate-database'),
]
