import { formatearFechaHora } from '../../utils/utilidades';
import './ItemAlerta.css';

function ItemAlerta({ alerta }) {
  return (
    <article className={`alerta-item ${alerta.activa ? 'is-active' : 'is-archived'}`}>
      <div>
        <p className="alerta-item__producto">{alerta.producto_nombre}</p>
        <small>Creada {formatearFechaHora(alerta.fecha_creacion)}</small>
      </div>
      <div className="alerta-item__meta">
        <span>Umbral {alerta.umbral} u.</span>
        <strong>{alerta.activa ? 'Activa' : 'Resuelta'}</strong>
      </div>
    </article>
  );
}

export default ItemAlerta;
