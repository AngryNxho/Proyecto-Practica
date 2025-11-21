from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Producto, Movimiento, Alerta


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

