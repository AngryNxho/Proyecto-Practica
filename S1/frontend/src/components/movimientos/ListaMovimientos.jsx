import ItemMovimiento from './ItemMovimiento';
import './ListaMovimientos.css';

function ListaMovimientos({ movimientos, cargando, error, onVerDetalle }) {
  if (cargando) {
    return (
      <div className="panel">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center', color: '#7c819b', marginTop: '12px' }}>Cargando movimientos...</p>
      </div>
    );
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
        <ItemMovimiento 
          key={movimiento.id} 
          movimiento={movimiento}
          onVerDetalle={onVerDetalle}
        />
      ))}
    </div>
  );
}

export default ListaMovimientos;
