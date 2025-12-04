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
