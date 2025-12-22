import { formatDateTime } from '../../utils/utils';
import './ItemAlerta.css';

function ItemAlerta({ alerta, onResolver }) {
  const handleResolver = () => {
    if (onResolver && alerta.activa) {
      onResolver(alerta.id);
    }
  };

  return (
    <article className={`alerta-item ${alerta.activa ? 'is-active' : 'is-archived'}`}>
      <div className="alerta-item__info">
        <p className="alerta-item__producto">{alerta.producto_nombre}</p>
        <small>Creada {formatDateTime(alerta.fecha_creacion)}</small>
        <div className="alerta-item__stock">
          <span className="stock-actual">Stock: {alerta.stock_actual ?? '—'}</span>
          <span className="stock-umbral">Umbral: {alerta.umbral}</span>
        </div>
      </div>
      <div className="alerta-item__meta">
        <span className={`alerta-badge ${alerta.activa ? 'badge-danger' : 'badge-success'}`}>
          {alerta.activa ? 'Activa' : 'Resuelta'}
        </span>
        {alerta.activa && onResolver && (
          <button 
            className="btn btn-resolver" 
            onClick={handleResolver}
            title="Marcar como resuelta"
          >
            Resolver
          </button>
        )}
      </div>
    </article>
  );
}

export default ItemAlerta;
