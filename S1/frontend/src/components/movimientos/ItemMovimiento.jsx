import { formatearFechaHora } from '../../utils/utilidades';
import './ItemMovimiento.css';

function ItemMovimiento({ movimiento }) {
  return (
    <article className={`movimiento-item tipo-${movimiento.tipo.toLowerCase()}`}>
      <div>
        <p className="movimiento-item__producto">{movimiento.producto_nombre}</p>
        <small>{formatearFechaHora(movimiento.fecha)}</small>
      </div>
      <div className="movimiento-item__meta">
        <span>{movimiento.tipo}</span>
        <strong>{movimiento.cantidad} u.</strong>
      </div>
      {movimiento.descripcion && (
        <p className="movimiento-item__descripcion">{movimiento.descripcion}</p>
      )}
    </article>
  );
}

export default ItemMovimiento;
