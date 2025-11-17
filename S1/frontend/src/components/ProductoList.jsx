import { useState, useEffect } from 'react';
import { productoService } from '../services/inventarioService';
import './ProductoList.css';

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
      const response = await productoService.getAll();
      setProductos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-message">Cargando productos...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="producto-list-container">
      <div className="producto-list-header">
        <h2>Lista de Productos</h2>
        <span className="badge badge-success">
          {productos.length} producto{productos.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <table className="productos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="7" className="no-productos">
                No hay productos registrados
              </td>
            </tr>
          ) : (
            productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td><strong>{producto.nombre}</strong></td>
                <td>{producto.marca || 'N/A'}</td>
                <td>{producto.modelo || 'N/A'}</td>
                <td>{producto.categoria || 'N/A'}</td>
                <td className={producto.esta_en_stock_bajo ? 'stock-bajo' : 'stock-alto'}>
                  {producto.stock} unidades
                </td>
                <td className="precio-cell">${Number(producto.precio).toLocaleString('es-CL')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductoList;
