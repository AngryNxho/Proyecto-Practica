from django.contrib import admin
from .models import Producto, Movimiento, Alerta
from .models import Device


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'marca', 'modelo', 'categoria', 'precio', 'stock', 'stock_status', 'fecha_creacion']
    list_filter = ['marca', 'categoria', 'fecha_creacion']
    search_fields = ['nombre', 'marca', 'modelo', 'descripcion']
    ordering = ['-fecha_creacion']
    readonly_fields = ['fecha_creacion']
    
    def stock_status(self, obj):
        if obj.stock == 0:
            return '🔴 Agotado'
        elif obj.stock < 5:
            return '🟡 Bajo'
        return '🟢 OK'
    stock_status.short_description = 'Estado'


@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ['producto', 'tipo', 'cantidad', 'fecha', 'descripcion_corta']
    list_filter = ['tipo', 'fecha']
    search_fields = ['producto__nombre', 'descripcion']
    ordering = ['-fecha']
    readonly_fields = ['fecha']
    
    def descripcion_corta(self, obj):
        return obj.descripcion[:50] + '...' if len(obj.descripcion) > 50 else obj.descripcion
    descripcion_corta.short_description = 'Descripción'


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ['producto', 'umbral', 'stock_actual', 'estado_alerta', 'fecha_creacion']
    list_filter = ['activa', 'fecha_creacion']
    search_fields = ['producto__nombre']
    ordering = ['-fecha_creacion']
    readonly_fields = ['fecha_creacion']
    
    def stock_actual(self, obj):
        return obj.producto.stock
    stock_actual.short_description = 'Stock'
    
    def estado_alerta(self, obj):
        if obj.activa:
            return '🚨 ACTIVA'
        return '✅ OK'
    estado_alerta.short_description = 'Estado'


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'ip', 'marca', 'modelo', 'producto', 'activo', 'ultimo_lectura']
    list_filter = ['marca', 'activo']
    search_fields = ['nombre', 'ip', 'producto__nombre']
    ordering = ['-ultimo_lectura']
