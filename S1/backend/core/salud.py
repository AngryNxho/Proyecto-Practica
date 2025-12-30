"""
Sistema de health checks para monitoreo
Verifica el estado de componentes críticos del sistema
"""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from rest_framework.decorators import api_view
import time
import psutil
import os


def verificar_base_datos():
    """Verifica que la base de datos esté respondiendo"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return {'status': 'ok', 'latencia_ms': 0}
    except Exception as e:
        return {'status': 'error', 'mensaje': str(e)}


def verificar_cache():
    """Verifica que el sistema de caché funcione"""
    try:
        clave_test = 'health_check_test'
        cache.set(clave_test, 'test', 1)
        valor = cache.get(clave_test)
        cache.delete(clave_test)
        
        if valor == 'test':
            return {'status': 'ok'}
        return {'status': 'error', 'mensaje': 'Cache no retorna valores correctos'}
    except Exception as e:
        return {'status': 'error', 'mensaje': str(e)}


def obtener_metricas_sistema():
    """Obtiene métricas del sistema operativo"""
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memoria = psutil.virtual_memory()
        disco = psutil.disk_usage('/')
        
        return {
            'cpu': {
                'porcentaje_uso': cpu_percent,
                'nucleos': psutil.cpu_count()
            },
            'memoria': {
                'total_mb': round(memoria.total / (1024 * 1024), 2),
                'disponible_mb': round(memoria.available / (1024 * 1024), 2),
                'porcentaje_uso': memoria.percent
            },
            'disco': {
                'total_gb': round(disco.total / (1024 * 1024 * 1024), 2),
                'usado_gb': round(disco.used / (1024 * 1024 * 1024), 2),
                'libre_gb': round(disco.free / (1024 * 1024 * 1024), 2),
                'porcentaje_uso': disco.percent
            }
        }
    except Exception as e:
        return {'error': str(e)}


def obtener_metricas_aplicacion():
    """Obtiene métricas específicas de la aplicación"""
    from core.models import Producto, Movimiento, Alerta
    
    try:
        return {
            'base_datos': {
                'productos': Producto.objects.count(),
                'movimientos': Movimiento.objects.count(),
                'alertas_activas': Alerta.objects.filter(activa=True).count()
            },
            'configuracion': {
                'debug': settings.DEBUG,
                'base_datos': settings.DATABASES['default']['ENGINE'].split('.')[-1]
            }
        }
    except Exception as e:
        return {'error': str(e)}


@api_view(['GET'])
def verificacion_rapida(request):
    """
    Endpoint de verificación rápida
    Retorna OK si el servicio está funcionando
    """
    return JsonResponse({
        'estado': 'ok',
        'marca_tiempo': time.time()
    })


@api_view(['GET'])
def verificacion_detallada(request):
    """
    Endpoint de verificación detallada
    Verifica todos los componentes del sistema
    """
    inicio = time.time()
    
    # Verificar componentes
    bd = verificar_base_datos()
    estado_cache = verificar_cache()
    
    # Estado general
    todos_ok = bd['status'] == 'ok' and estado_cache['status'] == 'ok'
    
    respuesta = {
        'estado': 'ok' if todos_ok else 'degradado',
        'marca_tiempo': time.time(),
        'tiempo_respuesta_ms': round((time.time() - inicio) * 1000, 2),
        'componentes': {
            'base_datos': bd,
            'cache': estado_cache,
        }
    }
    
    # Código HTTP apropiado
    codigo_http = 200 if todos_ok else 503
    
    return JsonResponse(respuesta, status=codigo_http)


@api_view(['GET'])
def obtener_metricas(request):
    """
    Endpoint de métricas del sistema
    Retorna uso de recursos y estadísticas
    """
    return JsonResponse({
        'marca_tiempo': time.time(),
        'sistema': obtener_metricas_sistema(),
        'aplicacion': obtener_metricas_aplicacion()
    })


@api_view(['GET'])
def estado_completo(request):
    """
    Endpoint de estado completo del sistema
    Combina health check + métricas
    """
    inicio = time.time()
    
    bd = verificar_base_datos()
    estado_cache = verificar_cache()
    metricas_sys = obtener_metricas_sistema()
    metricas_app = obtener_metricas_aplicacion()
    
    todos_ok = bd['status'] == 'ok' and estado_cache['status'] == 'ok'
    
    return JsonResponse({
        'estado': 'ok' if todos_ok else 'degradado',
        'marca_tiempo': time.time(),
        'tiempo_respuesta_ms': round((time.time() - inicio) * 1000, 2),
        'salud': {
            'base_datos': bd,
            'cache': estado_cache,
        },
        'sistema': metricas_sys,
        'aplicacion': metricas_app
    })
