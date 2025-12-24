"""
Excepciones personalizadas para operaciones de inventario
Proporciona manejo específico de errores de negocio
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class ErrorInventario(APIException):
    """Excepción base para errores de inventario"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Error en operación de inventario'
    default_code = 'error_inventario'


class StockInsuficienteError(ErrorInventario):
    """Error cuando no hay stock suficiente para una operación"""
    default_detail = 'Stock insuficiente para completar la operación'
    default_code = 'stock_insuficiente'
    
    def __init__(self, producto, cantidad_solicitada, stock_disponible):
        self.producto = producto
        self.cantidad_solicitada = cantidad_solicitada
        self.stock_disponible = stock_disponible
        detail = (
            f"Stock insuficiente para '{producto}'. "
            f"Disponible: {stock_disponible}, "
            f"Solicitado: {cantidad_solicitada}, "
            f"Faltante: {cantidad_solicitada - stock_disponible}"
        )
        super().__init__(detail)


class CantidadInvalidaError(ErrorInventario):
    """Error cuando la cantidad no cumple los requisitos"""
    default_detail = 'La cantidad especificada no es válida'
    default_code = 'cantidad_invalida'


class ProductoNoEncontradoError(ErrorInventario):
    """Error cuando el producto no existe"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Producto no encontrado'
    default_code = 'producto_no_encontrado'


class ErrorConcurrencia(ErrorInventario):
    """Error cuando hay conflicto de concurrencia"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Conflicto de concurrencia en la operación'
    default_code = 'error_concurrencia'


class OperacionNoPermitidaError(ErrorInventario):
    """Error cuando la operación no está permitida"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Operación no permitida'
    default_code = 'operacion_no_permitida'
