from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """Paginación estándar para la API (10 items por página)"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class LargeResultsSetPagination(PageNumberPagination):
    """Paginación para reportes y exportaciones (50 items por página)"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 500
