import ItemAlerta from './ItemAlerta';
import './ListaAlertas.css';

function ListaAlertas({ alertas, cargando, error }) {
  if (cargando) {
    return (
      <div className="panel">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center', color: '#7c819b', marginTop: '12px' }}>Cargando alertas...</p>
      </div>
    );
  }

  if (error) {
    return <div className="panel error-state">{error}</div>;
  }

  if (!alertas.length) {
    return <div className="panel empty-state">No hay alertas activas.</div>;
  }

  return (
    <div className="alertas-list">
      {alertas.map((alerta) => (
        <ItemAlerta key={alerta.id} alerta={alerta} />
      ))}
    </div>
  );
}

export default ListaAlertas;
