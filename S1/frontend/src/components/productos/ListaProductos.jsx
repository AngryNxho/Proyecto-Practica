import { useMemo } from 'react';
import TarjetaProducto from './TarjetaProducto';
import './ListaProductos.css';

function ListaProductos({ productos, alertas, cargando, error, alEliminar }) {
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
    return <div className="panel">Cargando productos...</div>;
  }

  if (error) {
    return <div className="panel error-state">{error}</div>;
  }

  if (!productos.length) {
    return <div className="panel empty-state">Aún no registras productos.</div>;
  }

  return (
    <section className="productos-list">
      {productos.map((producto) => (
        <TarjetaProducto
          key={producto.id}
          producto={producto}
          alerta={alertasPorProducto[producto.id]}
          alEliminar={alEliminar}
        />
      ))}
    </section>
  );
}

export default ListaProductos;
