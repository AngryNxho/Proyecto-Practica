"""
Decoradores para protección y validación de endpoints
"""
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def solo_desarrollo(func):
    """
    Decorador que protege endpoints que solo deben funcionar en desarrollo
    Retorna 403 Forbidden si se intenta usar en producción
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not settings.DEBUG:
            logger.warning(
                f"Intento de acceso a endpoint de desarrollo en producción: {func.__name__}"
            )
            return Response(
                {
                    'error': 'Este endpoint solo está disponible en modo desarrollo',
                    'code': 'endpoint_desarrollo'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        return func(*args, **kwargs)
    return wrapper


def requiere_confirmacion(param_nombre='confirmar'):
    """
    Decorador que requiere confirmación explícita para operaciones destructivas
    
    Args:
        param_nombre: Nombre del parámetro que debe contener 'true' o True
    
    Ejemplo:
        @requiere_confirmacion('confirmar_borrado')
        def eliminar_todo(request):
            ...
    """
    def decorador(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            confirmacion = request.data.get(param_nombre) or request.query_params.get(param_nombre)
            
            if confirmacion not in ['true', True, 'True', '1', 1]:
                logger.warning(
                    f"Operación sin confirmación rechazada: {func.__name__}"
                )
                return Response(
                    {
                        'error': f'Esta operación requiere confirmación explícita',
                        'mensaje': f'Proporcione {param_nombre}=true para confirmar',
                        'code': 'confirmacion_requerida'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"Operación confirmada: {func.__name__}")
            return func(request, *args, **kwargs)
        return wrapper
    return decorador


def registrar_operacion(descripcion_operacion):
    """
    Decorador para registrar operaciones críticas en logs
    
    Args:
        descripcion_operacion: Descripción de la operación para logs
    """
    def decorador(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            usuario = getattr(request.user, 'username', 'Anónimo')
            logger.info(
                f"Iniciando {descripcion_operacion} - Usuario: {usuario}, "
                f"Función: {func.__name__}"
            )
            
            try:
                resultado = func(request, *args, **kwargs)
                logger.info(
                    f"Completado {descripcion_operacion} - Usuario: {usuario}"
                )
                return resultado
            except Exception as e:
                logger.error(
                    f"Error en {descripcion_operacion} - Usuario: {usuario}, "
                    f"Error: {str(e)}", exc_info=True
                )
                raise
        return wrapper
    return decorador
