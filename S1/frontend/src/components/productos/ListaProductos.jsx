import { useMemo } from 'react';
import TarjetaProducto from './TarjetaProducto';
import './ListaProductos.css';

function ListaProductos({ productos, alertas, cargando, error, alEliminar, alEditar }) {
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
      <div className="panel">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center', color: '#7c819b', marginTop: '12px' }}>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return <div className="panel error-state">{error}</div>;
  }

  if (!productos.length) {
    return <div className="panel empty-state">Aún no registras productos.</div>;
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
          />
        </div>
      ))}
    </section>
  );
}

export default ListaProductos;
