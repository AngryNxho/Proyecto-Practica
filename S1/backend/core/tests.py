from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Producto, Movimiento, Alerta
from decimal import Decimal


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
        print(f"✓ Movimientos listados en {elapsed_time:.3f}s")
    
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
        print(f"✓ Dashboard métricas cargadas en {elapsed_time:.3f}s")
        print(f"  - Total productos: {response.data['resumen']['total_productos']}")
        print(f"  - Alertas activas: {response.data['resumen']['alertas_activas']}")

