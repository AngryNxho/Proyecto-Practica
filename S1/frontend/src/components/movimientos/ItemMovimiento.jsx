import { formatDateTime } from '../../utils/utils';
import './ItemMovimiento.css';

function ItemMovimiento({ movimiento, onVerDetalle }) {
  return (
    <article className={`movimiento-item tipo-${movimiento.tipo.toLowerCase()}`}>
      <div>
        <p className="movimiento-item__producto">{movimiento.producto_nombre}</p>
        <small>{formatDateTime(movimiento.fecha)}</small>
      </div>
      <div className="movimiento-item__meta">
        <span>{movimiento.tipo}</span>
        <strong>{movimiento.cantidad} u.</strong>
      </div>
      {movimiento.descripcion && (
        <p className="movimiento-item__descripcion">{movimiento.descripcion}</p>
      )}
      {onVerDetalle && (
        <button 
          className="btn-ver-detalle"
          onClick={() => onVerDetalle(movimiento)}
          title="Ver detalles completos"
        >
          👁️ Ver detalles
        </button>
      )}
    </article>
  );
}

export default ItemMovimiento;
