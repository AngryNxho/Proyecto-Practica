from django.contrib import admin
from .models import Producto, Movimiento, Alerta


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'categoria', 'precio', 'stock', 'fecha_creacion']
    list_filter = ['categoria', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion']
    ordering = ['-fecha_creacion']


@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ['producto', 'tipo', 'cantidad', 'fecha']
    list_filter = ['tipo', 'fecha']
    search_fields = ['producto__nombre', 'descripcion']
    ordering = ['-fecha']


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ['producto', 'umbral', 'activa', 'fecha_creacion']
    list_filter = ['activa', 'fecha_creacion']
    search_fields = ['producto__nombre']
    ordering = ['-fecha_creacion']
