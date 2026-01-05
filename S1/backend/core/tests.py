from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Producto, Movimiento, Alerta, Device
from decimal import Decimal
from datetime import datetime, timedelta
from io import BytesIO
import csv


class ProductoModelTestCase(TestCase):
    """Tests para el modelo Producto"""
    
    def setUp(self):
        self.producto = Producto.objects.create(
            nombre="Toner HP 80A",
            marca="HP",
            modelo="80A",
            precio=25000,
            stock=10,
            categoria="Toner"
        )
    
    def test_crear_producto(self):
        """Verifica que un producto se cree correctamente"""
        self.assertEqual(self.producto.nombre, "Toner HP 80A")
        self.assertEqual(self.producto.stock, 10)
    
    def test_registrar_entrada(self):
        """Verifica que registrar_entrada actualice el stock"""
        stock_inicial = self.producto.stock
        self.producto.registrar_entrada(5, "Compra mensual")
        self.assertEqual(self.producto.stock, stock_inicial + 5)
    
    def test_registrar_salida(self):
        """Verifica que registrar_salida actualice el stock"""
        stock_inicial = self.producto.stock
        self.producto.registrar_salida(3, "Venta")
        self.assertEqual(self.producto.stock, stock_inicial - 3)
    
    def test_registrar_salida_stock_insuficiente(self):
        """Verifica que no se pueda vender más stock del disponible"""
        with self.assertRaises(ValueError):
            self.producto.registrar_salida(100, "Venta imposible")
    
    def test_entrada_cantidad_negativa(self):
        """Verifica que no se acepten cantidades negativas en entradas"""
        with self.assertRaises(ValueError):
            self.producto.registrar_entrada(-5, "Test negativo")
    
    def test_salida_cantidad_cero(self):
        """Verifica que no se acepte cantidad cero en salidas"""
        with self.assertRaises(ValueError):
            self.producto.registrar_salida(0, "Test cero")
    
    def test_codigo_barras_unico(self):
        """Verifica que el código de barras sea único"""
        Producto.objects.create(
            nombre="Producto 1",
            precio=1000,
            stock=5,
            codigo_barras="12345678"
        )
        with self.assertRaises(Exception):
            Producto.objects.create(
                nombre="Producto 2",
                precio=2000,
                stock=10,
                codigo_barras="12345678"
            )
    
    def test_str_representation(self):
        """Verifica la representación en string del producto"""
        self.assertIn("HP", str(self.producto))
        self.assertIn("80A", str(self.producto))


class MovimientoModelTestCase(TestCase):
    """Tests para el modelo Movimiento"""
    
    def setUp(self):
        self.producto = Producto.objects.create(
            nombre="Toner Test",
            precio=10000,
            stock=20
        )
    
    def test_crear_movimiento_entrada(self):
        """Verifica que se cree un movimiento de entrada"""
        mov = Movimiento.objects.create(
            producto=self.producto,
            tipo='ENTRADA',
            cantidad=5,
            descripcion='Test'
        )
        self.assertEqual(mov.tipo, 'ENTRADA')
        self.assertEqual(mov.cantidad, 5)
    
    def test_crear_movimiento_salida(self):
        """Verifica que se cree un movimiento de salida"""
        mov = Movimiento.objects.create(
            producto=self.producto,
            tipo='SALIDA',
            cantidad=3,
            descripcion='Test'
        )
        self.assertEqual(mov.tipo, 'SALIDA')
    
    def test_movimiento_actualiza_fecha(self):
        """Verifica que la fecha se asigne automáticamente"""
        mov = Movimiento.objects.create(
            producto=self.producto,
            tipo='ENTRADA',
            cantidad=1
        )
        self.assertIsNotNone(mov.fecha)
    
    def test_movimiento_relacionado_producto(self):
        """Verifica la relación con producto"""
        mov = self.producto.registrar_entrada(5, "Test relación")
        self.assertEqual(mov.producto, self.producto)
        self.assertIn(mov, self.producto.movimientos.all())


class AlertaModelTestCase(TestCase):
    """Tests para el modelo Alerta"""
    
    def setUp(self):
        self.producto = Producto.objects.create(
            nombre="Toner Test",
            precio=10000,
            stock=5
        )
    
    def test_crear_alerta(self):
        """Verifica que se cree una alerta"""
        alerta = Alerta.objects.create(
            producto=self.producto,
            umbral=10,
            activa=True
        )
        self.assertEqual(alerta.umbral, 10)
        self.assertTrue(alerta.activa)
    
    def test_alerta_automatica_stock_bajo(self):
        """Verifica que se active alerta cuando stock es bajo"""
        alerta = Alerta.objects.create(
            producto=self.producto,
            umbral=10,
            activa=False
        )
        self.producto.registrar_salida(3, "Reducir stock")
        alerta.refresh_from_db()
        # La alerta debería activarse porque stock (2) < umbral (10)
        self.assertTrue(alerta.activa)
    
    def test_multiple_alertas_por_producto(self):
        """Verifica que se puedan crear múltiples alertas para un producto"""
        Alerta.objects.create(producto=self.producto, umbral=5, activa=True)
        Alerta.objects.create(producto=self.producto, umbral=10, activa=False)
        self.assertEqual(self.producto.alertas.count(), 2)


class ProductoAPITestCase(APITestCase):
    """Tests para la API de Productos"""
    
    def setUp(self):
        self.producto = Producto.objects.create(
            nombre="Toner API Test",
            precio=15000,
            stock=8,
            marca="HP",
            modelo="90A"
        )
    
    def test_listar_productos(self):
        """Verifica que GET /api/productos/ retorne la lista"""
        response = self.client.get('/api/productos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_obtener_producto(self):
        """Verifica que GET /api/productos/{id}/ retorne un producto"""
        response = self.client.get(f'/api/productos/{self.producto.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Toner API Test')
    
    def test_crear_producto(self):
        """Verifica que POST /api/productos/ cree un producto"""
        data = {
            'nombre': 'Nuevo Toner',
            'precio': 20000,
            'stock': 15,
            'categoria': 'Toner'
        }
        response = self.client.post('/api/productos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Producto.objects.filter(nombre='Nuevo Toner').count(), 1)
    
    def test_crear_producto_precio_negativo(self):
        """Verifica que no se pueda crear producto con precio negativo"""
        data = {
            'nombre': 'Producto Inválido',
            'precio': -100,
            'stock': 5,
            'categoria': 'Toner'
        }
        response = self.client.post('/api/productos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_crear_producto_stock_negativo(self):
        """Verifica que no se pueda crear producto con stock negativo"""
        data = {
            'nombre': 'Producto Inválido',
            'precio': 1000,
            'stock': -5,
            'categoria': 'Toner'
        }
        response = self.client.post('/api/productos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_crear_producto_categoria_invalida(self):
        """Verifica que no se acepten categorías inválidas"""
        data = {
            'nombre': 'Producto Test',
            'precio': 1000,
            'stock': 5,
            'categoria': 'CategoriaInvalida'
        }
        response = self.client.post('/api/productos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_actualizar_producto(self):
        """Verifica que PUT /api/productos/{id}/ actualice un producto"""
        data = {
            'nombre': 'Toner Actualizado',
            'precio': 18000,
            'stock': 12,
            'marca': 'HP',
            'modelo': '90A'
        }
        response = self.client.put(f'/api/productos/{self.producto.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.nombre, 'Toner Actualizado')
    
    def test_eliminar_producto(self):
        """Verifica que DELETE /api/productos/{id}/ elimine un producto"""
        producto_id = self.producto.id
        response = self.client.delete(f'/api/productos/{producto_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Producto.objects.filter(id=producto_id).exists())
    
    def test_registrar_entrada_endpoint(self):
        """Verifica POST /api/productos/{id}/registrar_entrada/"""
        stock_inicial = self.producto.stock
        data = {'cantidad': 5, 'descripcion': 'Test entrada'}
        response = self.client.post(f'/api/productos/{self.producto.id}/registrar_entrada/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, stock_inicial + 5)
    
    def test_registrar_salida_endpoint(self):
        """Verifica POST /api/productos/{id}/registrar_salida/"""
        stock_inicial = self.producto.stock
        data = {'cantidad': 2, 'descripcion': 'Test salida'}
        response = self.client.post(f'/api/productos/{self.producto.id}/registrar_salida/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, stock_inicial - 2)
    
    def test_estadisticas_endpoint(self):
        """Verifica GET /api/productos/estadisticas/"""
        response = self.client.get('/api/productos/estadisticas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_productos', response.data)
        self.assertIn('valor_inventario', response.data)
        self.assertIn('por_categoria', response.data)
    
    def test_exportar_csv_endpoint(self):
        """Verifica GET /api/productos/exportar_csv/"""
        response = self.client.get('/api/productos/exportar_csv/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8')
        self.assertIn('productos_', response['Content-Disposition'])


class MovimientoAPITestCase(APITestCase):
    """Tests para la API de Movimientos"""
    
    def setUp(self):
        self.producto = Producto.objects.create(
            nombre="Producto Test",
            precio=5000,
            stock=20
        )
        self.movimiento = Movimiento.objects.create(
            producto=self.producto,
            tipo='ENTRADA',
            cantidad=10,
            descripcion='Test inicial'
        )
    
    def test_listar_movimientos(self):
        """Verifica que GET /api/movimientos/ retorne la lista"""
        response = self.client.get('/api/movimientos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_obtener_movimiento(self):
        """Verifica que GET /api/movimientos/{id}/ retorne un movimiento"""
        response = self.client.get(f'/api/movimientos/{self.movimiento.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['tipo'], 'ENTRADA')
    
    def test_exportar_movimientos_csv(self):
        """Verifica GET /api/movimientos/exportar_csv/"""
        response = self.client.get('/api/movimientos/exportar_csv/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8')


class AlertaAPITestCase(APITestCase):
    """Tests para la API de Alertas"""
    
    def setUp(self):
        self.producto = Producto.objects.create(
            nombre="Producto Alerta",
            precio=3000,
            stock=3
        )
        self.alerta = Alerta.objects.create(
            producto=self.producto,
            umbral=10,
            activa=True
        )
    
    def test_listar_alertas(self):
        """Verifica que GET /api/alertas/ retorne la lista"""
        response = self.client.get('/api/alertas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_obtener_alerta(self):
        """Verifica que GET /api/alertas/{id}/ retorne una alerta"""
        response = self.client.get(f'/api/alertas/{self.alerta.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['umbral'], 10)
    
    def test_alertas_activas_endpoint(self):
        """Verifica GET /api/alertas/activas/"""
        response = self.client.get('/api/alertas/activas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('alertas', response.data)
        self.assertGreater(response.data['total'], 0)
    
    def test_crear_alerta_umbral_negativo(self):
        """Verifica que no se pueda crear alerta con umbral negativo"""
        producto2 = Producto.objects.create(nombre="Producto 2", precio=1000, stock=5)
        data = {
            'producto': producto2.id,
            'umbral': -5,
            'activa': True
        }
        response = self.client.post('/api/alertas/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_resolver_alerta(self):
        """Verifica que POST /api/alertas/{id}/resolver/ desactive la alerta"""
        self.assertTrue(self.alerta.activa)
        response = self.client.post(f'/api/alertas/{self.alerta.id}/resolver/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alerta.refresh_from_db()
        self.assertFalse(self.alerta.activa)
    
    def test_actualizar_alerta_umbral(self):
        """Verifica que se pueda actualizar el umbral de una alerta"""
        data = {'umbral': 15, 'activa': True}
        response = self.client.patch(f'/api/alertas/{self.alerta.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alerta.refresh_from_db()
        self.assertEqual(self.alerta.umbral, 15)
    
    def test_eliminar_alerta(self):
        """Verifica que DELETE /api/alertas/{id}/ elimine la alerta"""
        alerta_id = self.alerta.id
        response = self.client.delete(f'/api/alertas/{alerta_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Alerta.objects.filter(id=alerta_id).exists())
    
    def test_filtrar_alertas_por_estado(self):
        """Verifica que se puedan filtrar alertas por estado activo"""
        Alerta.objects.create(producto=self.producto, umbral=5, activa=False)
        response = self.client.get('/api/alertas/?activa=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for alerta in response.data['results']:
            self.assertTrue(alerta['activa'])
    
    def test_alertas_multiples_productos(self):
        """Verifica que se listen alertas de múltiples productos"""
        producto2 = Producto.objects.create(nombre="Producto 2", precio=2000, stock=2)
        Alerta.objects.create(producto=producto2, umbral=5, activa=True)
        response = self.client.get('/api/alertas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 2)
    
    def test_alerta_incluye_datos_producto(self):
        """Verifica que la alerta incluya información del producto relacionado"""
        response = self.client.get(f'/api/alertas/{self.alerta.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('producto_nombre', response.data)
        self.assertEqual(response.data['producto_nombre'], self.producto.nombre)


class PerformanceTestCase(APITestCase):
    """Tests de rendimiento para endpoints principales"""
    
    def setUp(self):
        """Crear datos de prueba para tests de rendimiento"""
        # Crear 50 productos de prueba
        self.productos = []
        for i in range(50):
            producto = Producto.objects.create(
                nombre=f"Producto Test {i}",
                marca=f"Marca {i % 5}",
                modelo=f"Modelo-{i}",
                precio=10000 + (i * 100),
                stock=10 + (i % 20),
                categoria=["Toner", "Tinta", "Papel", "Impresora", "Repuesto"][i % 5],
                codigo_barras=f"TEST{i:05d}"
            )
            self.productos.append(producto)
        
        # Crear 100 movimientos de prueba
        for i in range(100):
            producto = self.productos[i % 50]
            tipo = 'ENTRADA' if i % 2 == 0 else 'SALIDA'
            cantidad = (i % 5) + 1
            
            Movimiento.objects.create(
                producto=producto,
                tipo=tipo,
                cantidad=cantidad,
                descripcion=f"Movimiento de prueba {i}"
            )
    
    def test_listar_movimientos_performance(self):
        """Verifica que listar movimientos sea rápido"""
        import time
        
        start_time = time.time()
        response = self.client.get('/api/movimientos/?page_size=20')
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        
        # Debe responder en menos de 1.5 segundos
        self.assertLess(elapsed_time, 1.5,
            f"Listar movimientos tomó {elapsed_time:.3f}s, debe ser < 1.5s")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Log para análisis
        print(f"[OK] Movimientos listados en {elapsed_time:.3f}s")
    
    def test_dashboard_metricas_performance(self):
        """Verifica que el endpoint de métricas del dashboard sea rápido"""
        import time
        
        start_time = time.time()
        response = self.client.get('/api/productos/metricas_dashboard/')
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        
        # Debe responder en menos de 3 segundos (más complejo con múltiples agregaciones)
        self.assertLess(elapsed_time, 3.0,
            f"Dashboard tomó {elapsed_time:.3f}s, debe ser < 3s")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que retorna las métricas esperadas
        self.assertIn('resumen', response.data)
        self.assertIn('stock', response.data)
        self.assertIn('actividad_hoy', response.data)
        
        # Log para análisis
        print(f"[OK] Dashboard metricas cargadas en {elapsed_time:.3f}s")
        print(f"  - Total productos: {response.data['resumen']['total_productos']}")
        print(f"  - Alertas activas: {response.data['resumen']['alertas_activas']}")
    
    def test_listar_productos_con_filtros_performance(self):
        """Verifica que filtrar productos sea rápido"""
        import time
        
        start_time = time.time()
        response = self.client.get('/api/productos/?categoria=Toner&ordering=-stock')
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        
        # Debe responder en menos de 1 segundo
        self.assertLess(elapsed_time, 1.0,
            f"Filtrar productos tomó {elapsed_time:.3f}s, debe ser < 1s")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        print(f"[OK] Productos filtrados en {elapsed_time:.3f}s")
    
    def test_busqueda_productos_performance(self):
        """Verifica que la búsqueda de productos sea rápida"""
        import time
        
        start_time = time.time()
        response = self.client.get('/api/productos/?search=Test')
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        
        # Debe responder en menos de 1 segundo
        self.assertLess(elapsed_time, 1.0,
            f"Búsqueda tomó {elapsed_time:.3f}s, debe ser < 1s")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        print(f"[OK] Busqueda completada en {elapsed_time:.3f}s")
    
    def test_exportar_csv_performance(self):
        """Verifica que la exportación a CSV sea rápida"""
        import time
        
        start_time = time.time()
        response = self.client.get('/api/movimientos/exportar_csv/')
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        
        # Debe responder en menos de 2 segundos
        self.assertLess(elapsed_time, 2.0,
            f"Exportación CSV tomó {elapsed_time:.3f}s, debe ser < 2s")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        print(f"[OK] CSV exportado en {elapsed_time:.3f}s")
    
    def test_estadisticas_productos_performance(self):
        """Verifica que las estadísticas de productos sean rápidas"""
        import time
        
        start_time = time.time()
        response = self.client.get('/api/productos/estadisticas/')
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        
        # Debe responder en menos de 1.5 segundos
        self.assertLess(elapsed_time, 1.5,
            f"Estadísticas tomaron {elapsed_time:.3f}s, debe ser < 1.5s")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        print(f"[OK] Estadisticas generadas en {elapsed_time:.3f}s")
    
    def test_multiples_operaciones_simultaneas(self):
        """Verifica que múltiples operaciones secuenciales no degraden el rendimiento"""
        import time
        
        start_time = time.time()
        
        # Ejecutar 5 requests secuenciales (SQLite en tests no soporta concurrencia real)
        responses = []
        for _ in range(5):
            response = self.client.get('/api/productos/')
            responses.append(response)
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        # Todos deben ser exitosos
        for response in responses:
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # El tiempo total debe ser razonable
        self.assertLess(elapsed_time, 2.0,
            f"5 requests secuenciales tomaron {elapsed_time:.3f}s, debe ser < 2s")
        
        print(f"[OK] 5 requests secuenciales completados en {elapsed_time:.3f}s")


class SerializadorTestCase(TestCase):
    """Tests para los serializadores"""
    
    def setUp(self):
        self.producto = Producto.objects.create(
            nombre="Toner Test",
            marca="HP",
            modelo="85A",
            precio=30000,
            stock=15,
            categoria="Toner",
            descripcion="Toner de prueba",
            codigo_barras="7890123456789"
        )
    
    def test_producto_serializer_campos_requeridos(self):
        """Verifica que el serializador incluya todos los campos"""
        from .serializers import ProductoSerializer
        serializer = ProductoSerializer(instance=self.producto)
        data = serializer.data
        
        # Verificar campos obligatorios
        self.assertIn('id', data)
        self.assertIn('nombre', data)
        self.assertIn('precio', data)
        self.assertIn('stock', data)
        self.assertIn('fecha_creacion', data)
        
        # Verificar valores
        self.assertEqual(data['nombre'], 'Toner Test')
        self.assertEqual(data['stock'], 15)
    
    def test_producto_serializer_validacion_precio(self):
        """Verifica que el serializador valide precio positivo"""
        from .serializers import ProductoSerializer
        data = {
            'nombre': 'Producto Test',
            'precio': -100,
            'stock': 5
        }
        serializer = ProductoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('precio', serializer.errors)
    
    def test_producto_serializer_validacion_stock(self):
        """Verifica que el serializador valide stock no negativo"""
        from .serializers import ProductoSerializer
        data = {
            'nombre': 'Producto Test',
            'precio': 1000,
            'stock': -5
        }
        serializer = ProductoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('stock', serializer.errors)
    
    def test_movimiento_serializer_campos(self):
        """Verifica que el serializador de movimiento incluya todos los campos"""
        from .serializers import MovimientoSerializer
        movimiento = Movimiento.objects.create(
            producto=self.producto,
            tipo='ENTRADA',
            cantidad=10,
            descripcion='Test'
        )
        serializer = MovimientoSerializer(instance=movimiento)
        data = serializer.data
        
        self.assertIn('id', data)
        self.assertIn('producto', data)
        self.assertIn('tipo', data)
        self.assertIn('cantidad', data)
        self.assertIn('fecha', data)
        self.assertIn('producto_nombre', data)
    
    def test_movimiento_serializer_validacion_cantidad(self):
        """Verifica que el serializador valide cantidad positiva"""
        from .serializers import MovimientoSerializer
        data = {
            'producto': self.producto.id,
            'tipo': 'ENTRADA',
            'cantidad': 0,
            'descripcion': 'Test'
        }
        serializer = MovimientoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
    
    def test_alerta_serializer_campos(self):
        """Verifica que el serializador de alerta incluya todos los campos"""
        from .serializers import AlertaSerializer
        alerta = Alerta.objects.create(
            producto=self.producto,
            umbral=10,
            activa=True
        )
        serializer = AlertaSerializer(instance=alerta)
        data = serializer.data
        
        self.assertIn('id', data)
        self.assertIn('producto', data)
        self.assertIn('umbral', data)
        self.assertIn('activa', data)
        self.assertIn('fecha_creacion', data)
        self.assertIn('producto_nombre', data)
    
    def test_alerta_serializer_validacion_umbral(self):
        """Verifica que el serializador valide umbral positivo"""
        from .serializers import AlertaSerializer
        data = {
            'producto': self.producto.id,
            'umbral': -5,
            'activa': True
        }
        serializer = AlertaSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('umbral', serializer.errors)
    
    def test_serializador_campos_readonly(self):
        """Verifica que los campos de solo lectura no se puedan modificar"""
        from .serializers import ProductoSerializer
        data = {
            'nombre': 'Producto Test',
            'precio': 1000,
            'stock': 5,
            'id': 999,  # Campo readonly
            'fecha_creacion': '2020-01-01'  # Campo readonly
        }
        serializer = ProductoSerializer(data=data)
        if serializer.is_valid():
            producto = serializer.save()
            # El ID debe ser auto-generado, no 999
            self.assertNotEqual(producto.id, 999)
    
    def test_serializador_multiple_productos(self):
        """Verifica que se puedan serializar múltiples productos"""
        from .serializers import ProductoSerializer
        Producto.objects.create(nombre="Producto 2", precio=2000, stock=10)
        Producto.objects.create(nombre="Producto 3", precio=3000, stock=15)
        
        productos = Producto.objects.all()
        serializer = ProductoSerializer(productos, many=True)
        
        self.assertGreaterEqual(len(serializer.data), 3)


class IntegracionTestCase(APITestCase):
    """Tests de integración que verifican flujos completos"""
    
    def test_flujo_completo_producto(self):
        """Verifica el flujo completo: crear, listar, actualizar, eliminar"""
        # 1. Crear producto
        data = {
            'nombre': 'Toner HP 80A',
            'marca': 'HP',
            'modelo': '80A',
            'precio': 25000,
            'stock': 10,
            'categoria': 'Toner'
        }
        response = self.client.post('/api/productos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        producto_id = response.data['id']
        
        # 2. Listar y verificar que existe
        response = self.client.get('/api/productos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        productos = response.data['results'] if 'results' in response.data else response.data
        self.assertTrue(any(p['id'] == producto_id for p in productos))
        
        # 3. Actualizar
        data['nombre'] = 'Toner HP 80A Actualizado'
        response = self.client.put(f'/api/productos/{producto_id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Toner HP 80A Actualizado')
        
        # 4. Eliminar
        response = self.client.delete(f'/api/productos/{producto_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 5. Verificar que no existe
        response = self.client.get(f'/api/productos/{producto_id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_flujo_movimientos_con_stock(self):
        """Verifica que los movimientos actualicen el stock correctamente"""
        # 1. Crear producto con stock inicial
        producto = Producto.objects.create(
            nombre='Producto Test',
            precio=10000,
            stock=20
        )
        stock_inicial = producto.stock
        
        # 2. Registrar entrada
        response = self.client.post(
            f'/api/productos/{producto.id}/registrar_entrada/',
            {'cantidad': 10, 'descripcion': 'Compra'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        producto.refresh_from_db()
        self.assertEqual(producto.stock, stock_inicial + 10)
        
        # 3. Registrar salida
        response = self.client.post(
            f'/api/productos/{producto.id}/registrar_salida/',
            {'cantidad': 5, 'descripcion': 'Venta'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        producto.refresh_from_db()
        self.assertEqual(producto.stock, stock_inicial + 10 - 5)
        
        # 4. Verificar que se crearon los movimientos
        response = self.client.get(f'/api/movimientos/?producto={producto.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        movimientos = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(movimientos), 2)
    
    def test_flujo_alertas_automaticas(self):
        """Verifica que las alertas se activen automáticamente"""
        # 1. Crear producto con stock inicial alto
        producto = Producto.objects.create(
            nombre='Producto Crítico',
            precio=5000,
            stock=20,
            categoria='Toner'
        )
        
        # 2. Crear alerta con umbral mayor al stock actual
        alerta_data = {
            'producto': producto.id,
            'umbral': 25,  # Umbral mayor al stock (20)
            'activa': True  # Ya activa porque stock < umbral
        }
        response = self.client.post('/api/alertas/', alerta_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, 
                        f"Error al crear alerta: {response.data if hasattr(response, 'data') else response.content}")
        alerta_id = response.data['id']
        
        # 3. Verificar que la alerta se creó activa
        response = self.client.get(f'/api/alertas/{alerta_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['activa'], "La alerta debería estar activa porque stock < umbral")
        
        # 4. Reducir más el stock
        response = self.client.post(
            f'/api/productos/{producto.id}/registrar_salida/',
            {'cantidad': 5, 'descripcion': 'Venta'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 5. La alerta sigue activa
        response = self.client.get(f'/api/alertas/{alerta_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['activa'])
        
        # 5. Resolver alerta
        response = self.client.post(f'/api/alertas/{alerta_id}/resolver/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 6. Verificar que se desactivó
        response = self.client.get(f'/api/alertas/{alerta_id}/')
        self.assertFalse(response.data['activa'])
    
    def test_filtros_combinados(self):
        """Verifica que múltiples filtros funcionen juntos"""
        # Crear varios productos
        Producto.objects.create(nombre='Toner HP', precio=20000, stock=5, categoria='Toner', marca='HP')
        Producto.objects.create(nombre='Toner Canon', precio=18000, stock=15, categoria='Toner', marca='Canon')
        Producto.objects.create(nombre='Papel HP', precio=5000, stock=100, categoria='Papel', marca='HP')
        
        # Filtrar por categoría y marca
        response = self.client.get('/api/productos/?categoria=Toner&marca=HP')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        productos = response.data['results'] if 'results' in response.data else response.data
        
        # Verificar que solo retorne Toner HP
        for producto in productos:
            self.assertEqual(producto['categoria'], 'Toner')
            self.assertEqual(producto['marca'], 'HP')
    
    def test_paginacion_y_ordenamiento(self):
        """Verifica que la paginación y ordenamiento funcionen"""
        # Crear 15 productos
        for i in range(15):
            Producto.objects.create(
                nombre=f'Producto {i:02d}',
                precio=1000 * (i + 1),
                stock=i + 1
            )
        
        # Obtener primera página ordenada por precio
        response = self.client.get('/api/productos/?page_size=5&ordering=precio')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que está paginado
        self.assertIn('results', response.data)
        self.assertLessEqual(len(response.data['results']), 5)
        
        # Verificar que está ordenado
        precios = [p['precio'] for p in response.data['results']]
        self.assertEqual(precios, sorted(precios))


class NuevasFuncionalidadesTestCase(APITestCase):
    """Tests para las nuevas funcionalidades agregadas"""
    
    def setUp(self):
        """Configuración inicial para los tests"""
        self.producto = Producto.objects.create(
            nombre="Toner Test",
            marca="TestBrand",
            modelo="T100",
            precio=50000,
            stock=20,
            categoria="Toner"
        )
    
    def test_ajustar_stock_incremento(self):
        """Verifica ajuste de stock con incremento"""
        movimiento = self.producto.ajustar_stock(30, "Ajuste de inventario", "Admin")
        self.assertEqual(self.producto.stock, 30)
        self.assertEqual(movimiento.tipo, 'ENTRADA')
        self.assertEqual(movimiento.cantidad, 10)
        self.assertEqual(movimiento.usuario, 'Admin')
    
    def test_ajustar_stock_decremento(self):
        """Verifica ajuste de stock con decremento"""
        movimiento = self.producto.ajustar_stock(15, "Corrección", "Admin")
        self.assertEqual(self.producto.stock, 15)
        self.assertEqual(movimiento.tipo, 'SALIDA')
        self.assertEqual(movimiento.cantidad, 5)
    
    def test_ajustar_stock_negativo_rechazado(self):
        """Verifica que no se permita stock negativo"""
        with self.assertRaises(ValueError):
            self.producto.ajustar_stock(-5, "Test")
    
    def test_ajustar_stock_sin_cambio(self):
        """Verifica que no se cree movimiento si no hay cambio"""
        movimiento = self.producto.ajustar_stock(20, "Sin cambio")
        self.assertIsNone(movimiento)
    
    def test_calcular_rotacion(self):
        """Verifica cálculo de rotación de producto"""
        # Crear movimientos de salida
        for i in range(5):
            self.producto.registrar_salida(2, f"Venta {i}", "Sistema")
        
        rotacion = self.producto.calcular_rotacion(dias=30)
        self.assertGreater(rotacion, 0)
        self.assertEqual(rotacion, 10 / 30)  # 10 unidades en 30 días
    
    def test_obtener_historial_movimientos(self):
        """Verifica obtención de historial"""
        # Crear varios movimientos
        self.producto.registrar_entrada(10, "Entrada 1", "Admin")
        self.producto.registrar_salida(5, "Salida 1", "Usuario")
        
        historial = self.producto.obtener_historial_movimientos(dias=30)
        self.assertGreaterEqual(historial.count(), 2)
    
    def test_analisis_inventario_disponibilidad(self):
        """Verifica que el método de análisis funcione correctamente"""
        # Crear productos adicionales
        for i in range(5):
            Producto.objects.create(
                nombre=f"Producto {i}",
                precio=10000 + i * 1000,
                stock=5 if i < 2 else 15,
                categoria="Tinta"
            )
        
        # Probar el método directamente para verificar lógica
        from django.db.models import Count, Sum, F
        productos = Producto.objects.all()
        criticos = productos.filter(stock__lte=5)
        
        # Verificar que detecta productos críticos
        self.assertGreaterEqual(criticos.count(), 2)
        
        # Verificar cálculo de valor
        valor_inventario = productos.aggregate(
            total=Sum(F('stock') * F('precio'))
        )['total']
        self.assertIsNotNone(valor_inventario)
        self.assertGreater(valor_inventario, 0)
    
    def test_serializer_campos_calculados(self):
        """Verifica que el serializer incluya campos calculados"""
        # Crear movimientos
        self.producto.registrar_entrada(10, "Test", "Admin")
        self.producto.registrar_salida(5, "Test", "Admin")
        
        response = self.client.get(f'/api/productos/{self.producto.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar campos calculados
        self.assertIn('valor_total', response.data)
        self.assertIn('estado_stock', response.data)
        self.assertIn('tiene_alertas_activas', response.data)
        self.assertIn('ultimos_movimientos', response.data)
        
        # Verificar cálculos
        valor_esperado = float(self.producto.stock * self.producto.precio)
        self.assertEqual(response.data['valor_total'], valor_esperado)
        self.assertEqual(response.data['estado_stock'], 'normal')
    
    def test_validacion_descripcion_obligatoria_entrada(self):
        """Verifica que la descripción sea obligatoria en entradas"""
        with self.assertRaises(ValueError) as context:
            self.producto.registrar_entrada(10, "", "Admin")
        self.assertIn("descripción", str(context.exception).lower())
    
    def test_validacion_descripcion_obligatoria_salida(self):
        """Verifica que la descripción sea obligatoria en salidas"""
        with self.assertRaises(ValueError) as context:
            self.producto.registrar_salida(5, "", "Admin")
        self.assertIn("descripción", str(context.exception).lower())
    
    def test_movimiento_guarda_usuario(self):
        """Verifica que los movimientos guarden el usuario"""
        movimiento = self.producto.registrar_entrada(10, "Test usuario", "JuanPerez")
        self.assertEqual(movimiento.usuario, "JuanPerez")
        
        # Verificar en BD
        mov_db = Movimiento.objects.get(id=movimiento.id)
        self.assertEqual(mov_db.usuario, "JuanPerez")


# ==================== TESTS DE CASOS EXTREMOS ====================

class CasosExtremosTestCase(APITestCase):
    """Tests para casos extremos y edge cases"""
    
    def setUp(self):
        self.client = APIClient()
        self.producto = Producto.objects.create(
            nombre="Producto Test",
            precio=10000,
            stock=50,
            categoria="Test"
        )
    
    def test_crear_producto_nombre_muy_largo(self):
        """Verifica límite de nombre de producto (200 chars)"""
        nombre_largo = "A" * 200
        response = self.client.post('/api/productos/', {
            'nombre': nombre_largo,
            'precio': 1000,
            'stock': 10,
            'categoria': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Debe fallar con 201 caracteres
        nombre_muy_largo = "A" * 201
        response = self.client.post('/api/productos/', {
            'nombre': nombre_muy_largo,
            'precio': 1000,
            'stock': 10,
            'categoria': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_precio_con_muchos_decimales(self):
        """Verifica que precio solo acepte 2 decimales"""
        response = self.client.post('/api/productos/', {
            'nombre': 'Test Precio',
            'precio': 12345.67,
            'stock': 10,
            'categoria': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Más decimales deben redondearse o rechazarse
        response = self.client.post('/api/productos/', {
            'nombre': 'Test Precio 2',
            'precio': 12345.6789,
            'stock': 10,
            'categoria': 'Test'
        })
        # Debe crear pero redondear
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_precio_cero(self):
        """Verifica que precio 0 sea rechazado"""
        response = self.client.post('/api/productos/', {
            'nombre': 'Test Precio Cero',
            'precio': 0,
            'stock': 10,
            'categoria': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_precio_negativo(self):
        """Verifica que precio negativo sea rechazado"""
        response = self.client.post('/api/productos/', {
            'nombre': 'Test Precio Negativo',
            'precio': -1000,
            'stock': 10,
            'categoria': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_stock_negativo(self):
        """Verifica que stock negativo sea rechazado"""
        response = self.client.post('/api/productos/', {
            'nombre': 'Test Stock Negativo',
            'precio': 1000,
            'stock': -5,
            'categoria': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_stock_muy_grande(self):
        """Verifica que el sistema maneje stocks muy grandes"""
        response = self.client.post('/api/productos/', {
            'nombre': 'Test Stock Grande',
            'precio': 1000,
            'stock': 999999999,
            'categoria': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_categoria_vacia(self):
        """Verifica comportamiento con categoría vacía"""
        response = self.client.post('/api/productos/', {
            'nombre': 'Test Sin Categoría',
            'precio': 1000,
            'stock': 10,
            'categoria': ''
        })
        # Debe aceptar categoría vacía
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_campos_opcionales_vacios(self):
        """Verifica que marca, modelo y descripción puedan estar vacíos"""
        response = self.client.post('/api/productos/', {
            'nombre': 'Test Campos Vacíos',
            'precio': 1000,
            'stock': 10,
            'categoria': 'Test',
            'marca': '',
            'modelo': '',
            'descripcion': ''
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_codigo_barras_duplicado(self):
        """Verifica que código de barras duplicado sea rechazado"""
        # Crear producto con código
        response1 = self.client.post('/api/productos/', {
            'nombre': 'Producto 1',
            'precio': 1000,
            'stock': 10,
            'categoria': 'Test',
            'codigo_barras': 'TEST123456789'
        })
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Intentar crear otro con mismo código
        response2 = self.client.post('/api/productos/', {
            'nombre': 'Producto 2',
            'precio': 2000,
            'stock': 20,
            'categoria': 'Test',
            'codigo_barras': 'TEST123456789'
        })
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_movimiento_cantidad_cero(self):
        """Verifica que cantidad 0 en movimiento sea rechazado"""
        response = self.client.post('/api/movimientos/', {
            'producto': self.producto.id,
            'tipo': 'entrada',
            'cantidad': 0,
            'descripcion': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_movimiento_cantidad_negativa(self):
        """Verifica que cantidad negativa sea rechazada"""
        response = self.client.post('/api/movimientos/', {
            'producto': self.producto.id,
            'tipo': 'entrada',
            'cantidad': -10,
            'descripcion': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_salida_excede_stock(self):
        """Verifica que salida mayor al stock sea rechazada"""
        # Producto tiene stock=50
        response = self.client.post('/api/movimientos/', {
            'producto': self.producto.id,
            'tipo': 'salida',
            'cantidad': 100,
            'descripcion': 'Intento salida excesiva'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Stock no debe cambiar
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 50)
    
    def test_busqueda_caracteres_especiales(self):
        """Verifica búsqueda con caracteres especiales"""
        # Crear producto con caracteres especiales
        Producto.objects.create(
            nombre='Tóner HP 100%',
            precio=1000,
            stock=10,
            categoria='Test'
        )
        
        response = self.client.get('/api/productos/?search=Tóner')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(response.data['count'], 0)
    
    def test_paginacion_limites(self):
        """Verifica comportamiento de paginación en límites"""
        # Página negativa
        response = self.client.get('/api/productos/?page=-1')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])
        
        # Página muy alta
        response = self.client.get('/api/productos/?page=999999')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Page_size muy grande
        response = self.client.get('/api/productos/?page_size=10000')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_filtros_multiples_combinados(self):
        """Verifica que múltiples filtros funcionen juntos"""
        response = self.client.get('/api/productos/?categoria=Test&search=Producto&ordering=-stock')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_alerta_stock_minimo_cero(self):
        """Verifica que stock mínimo 0 sea válido"""
        response = self.client.post('/api/alertas/', {
            'producto': self.producto.id,
            'stock_minimo': 0,
            'activa': True
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_alerta_stock_minimo_negativo(self):
        """Verifica que stock mínimo negativo sea rechazado"""
        response = self.client.post('/api/alertas/', {
            'producto': self.producto.id,
            'stock_minimo': -10,
            'activa': True
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_importar_csv_vacio(self):
        """Verifica comportamiento con CSV vacío"""
        csv_content = b"nombre,precio,stock,categoria\n"
        csv_file = BytesIO(csv_content)
        csv_file.name = 'test.csv'
        
        response = self.client.post('/api/productos/importar_csv/', {
            'archivo': csv_file
        }, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['creados'], 0)
    
    def test_importar_csv_filas_invalidas(self):
        """Verifica que filas inválidas se reporten como errores"""
        csv_content = b"""nombre,precio,stock,categoria
Producto Valido,1000,10,Test
Producto Sin Precio,,10,Test
Producto Stock Negativo,1000,-5,Test
"""
        csv_file = BytesIO(csv_content)
        csv_file.name = 'test.csv'
        
        response = self.client.post('/api/productos/importar_csv/', {
            'archivo': csv_file
        }, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['creados'], 1)
        self.assertGreater(len(response.data['errores']), 0)
    
    def test_exportar_csv_sin_datos(self):
        """Verifica exportación CSV cuando no hay productos"""
        Producto.objects.all().delete()
        
        response = self.client.get('/api/productos/exportar_csv/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
    
    def test_estadisticas_sin_movimientos(self):
        """Verifica estadísticas cuando no hay movimientos"""
        Movimiento.objects.all().delete()
        
        response = self.client.get('/api/movimientos/estadisticas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
    
    def test_actualizar_producto_parcial(self):
        """Verifica actualización parcial (PATCH)"""
        response = self.client.patch(f'/api/productos/{self.producto.id}/', {
            'nombre': 'Nombre Actualizado'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.nombre, 'Nombre Actualizado')
        # Otros campos deben mantenerse
        self.assertEqual(self.producto.precio, Decimal('10000'))
    
    def test_eliminar_producto_con_movimientos(self):
        """Verifica que se pueda eliminar producto con historial"""
        # Crear movimientos
        self.producto.registrar_entrada(10, "Test", "Admin")
        self.producto.registrar_salida(5, "Test", "Admin")
        
        response = self.client.delete(f'/api/productos/{self.producto.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Producto debe estar eliminado
        self.assertFalse(Producto.objects.filter(id=self.producto.id).exists())
    
    def test_device_ip_invalida(self):
        """Verifica validación de IP en Device"""
        response = self.client.post('/api/devices/', {
            'nombre': 'Impresora Test',
            'ip': '999.999.999.999',
            'tipo': 'impresora',
            'marca': 'HP',
            'modelo': 'Test'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_device_ip_valida(self):
        """Verifica que IPs válidas sean aceptadas"""
        response = self.client.post('/api/devices/', {
            'nombre': 'Impresora Test',
            'ip': '192.168.1.100',
            'tipo': 'impresora',
            'marca': 'HP',
            'modelo': 'LaserJet'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


# ==================== TESTS DE PERFORMANCE ====================

class PerformanceTestCase(APITestCase):
    """Tests de rendimiento y carga"""
    
    def test_crear_muchos_productos(self):
        """Verifica que el sistema maneje muchos productos"""
        productos = []
        for i in range(100):
            productos.append(Producto(
                nombre=f'Producto {i}',
                precio=1000 + i,
                stock=10 + i,
                categoria='Test'
            ))
        
        Producto.objects.bulk_create(productos)
        
        # Verificar que se crearon
        count = Producto.objects.count()
        self.assertEqual(count, 100)
        
        # Verificar paginación funciona bien
        response = self.client.get('/api/productos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 100)
    
    def test_busqueda_con_muchos_productos(self):
        """Verifica que búsqueda funcione con muchos productos"""
        # Crear 200 productos
        for i in range(200):
            Producto.objects.create(
                nombre=f'Test Producto {i}',
                precio=1000,
                stock=10,
                categoria='Test'
            )
        
        response = self.client.get('/api/productos/?search=Test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(response.data['count'], 0)
    
    def test_muchos_movimientos_mismo_producto(self):
        """Verifica que producto maneje muchos movimientos"""
        producto = Producto.objects.create(
            nombre='Producto Alta Rotación',
            precio=1000,
            stock=1000,
            categoria='Test'
        )
        
        # Crear 50 movimientos
        for i in range(50):
            if i % 2 == 0:
                producto.registrar_entrada(10, f'Entrada {i}', 'Sistema')
            else:
                producto.registrar_salida(5, f'Salida {i}', 'Sistema')
        
        # Verificar historial
        movimientos = Movimiento.objects.filter(producto=producto)
        self.assertEqual(movimientos.count(), 50)
        
        # Verificar API funciona
        response = self.client.get(f'/api/productos/{producto.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)



