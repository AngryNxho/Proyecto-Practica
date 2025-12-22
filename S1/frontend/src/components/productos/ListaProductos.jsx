import { useMemo } from 'react';
import TarjetaProducto from './TarjetaProducto';
import './ListaProductos.css';

function ListaProductos({ productos, alertas, cargando, error, alEliminar, alEditar, alRegistrarMovimiento }) {
  const alertasPorProducto = useMemo(() => {
    if (!Array.isArray(alertas)) return {};
    return alertas.reduce((acc, alerta) => {
      if (!acc[alerta.producto]) {
        acc[alerta.producto] = alerta;
      }
      return acc;
    }, {});
  }, [alertas]);

  if (cargando) {
    return (
      <div className="panel loading-state" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p style={{ textAlign: 'center', color: '#7c819b', marginTop: '12px' }}>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel error-state">
        <p style={{ fontSize: '16px', color: '#dc2626', marginBottom: '8px' }}>{error}</p>
        <p style={{ fontSize: '14px', color: '#71717a' }}>Por favor, verifica que el servidor esté funcionando.</p>
      </div>
    );
  }

  if (!productos.length) {
    return (
      <div className="panel empty-state">
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>No hay productos registrados</p>
        <p style={{ fontSize: '14px', color: '#71717a' }}>Comienza agregando tu primer producto usando el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <section className="productos-list">
      {productos.map((producto, index) => (
        <div key={producto.id} className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
          <TarjetaProducto
            producto={producto}
            alerta={alertasPorProducto[producto.id]}
            alEliminar={alEliminar}
            alEditar={alEditar}
            alRegistrarMovimiento={alRegistrarMovimiento}
          />
        </div>
      ))}
    </section>
  );
}

export default ListaProductos;
