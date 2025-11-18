import ItemMovimiento from './ItemMovimiento';
import './ListaMovimientos.css';

function ListaMovimientos({ movimientos, cargando, error }) {
  if (cargando) {
    return <div className="panel">Cargando movimientos...</div>;
  }

  if (error) {
    return <div className="panel error-state">{error}</div>;
  }

  if (!movimientos.length) {
    return <div className="panel empty-state">Aún no registras movimientos.</div>;
  }

  return (
    <div className="movimientos-list">
      {movimientos.map((movimiento) => (
        <ItemMovimiento key={movimiento.id} movimiento={movimiento} />
      ))}
    </div>
  );
}

export default ListaMovimientos;
