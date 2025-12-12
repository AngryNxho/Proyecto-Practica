from rest_framework.pagination import PageNumberPagination


class PaginacionEstandar(PageNumberPagination):
    """
    Paginación estándar optimizada para la mayoría de endpoints
    - 20 items por página por defecto (balance entre UX y performance)
    - Permite hasta 100 items por página máximo
    - Mejora significativa en tiempo de carga con datasets grandes
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PaginacionGrande(PageNumberPagination):
    """
    Paginación para listados extensos (reportes, exportaciones)
    - 50 items por página
    - Límite de 500 items para prevenir timeouts
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 500
