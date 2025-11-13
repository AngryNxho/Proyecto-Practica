import { useState, useEffect } from 'react';
import { productoService } from '../services/inventarioService';

function ProductoList() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productoService.listar();
      setProductos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Lista de Productos</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Categoría</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>
                No hay productos registrados
              </td>
            </tr>
          ) : (
            productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.nombre}</td>
                <td>{producto.marca || 'N/A'}</td>
                <td>{producto.modelo || 'N/A'}</td>
                <td>{producto.categoria || 'N/A'}</td>
                <td style={{ 
                  color: producto.stock_actual < producto.stock_minimo ? 'red' : 'green',
                  fontWeight: 'bold'
                }}>
                  {producto.stock_actual}
                </td>
                <td>{producto.stock_minimo}</td>
                <td>${producto.precio_unitario}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductoList;
