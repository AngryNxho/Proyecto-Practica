import { formatearMonedaCLP, obtenerEstadoStock, obtenerEtiquetaStock } from '../../utils/utilidades';
import './TarjetaProducto.css';

function TarjetaProducto({ producto, alerta }) {
  const variante = obtenerEstadoStock(producto.stock, alerta?.umbral);

  return (
    <article className={`producto-card status-${variante}`}>
      <header>
        <div>
          <p className="producto-card__categoria">{producto.categoria || 'Sin categoría'}</p>
          <h3>{producto.nombre}</h3>
          {(producto.marca || producto.modelo) && (
            <small>
              {producto.marca} {producto.modelo}
            </small>
          )}
        </div>
        <span className={`status-badge ${variante}`}>{obtenerEtiquetaStock(variante)}</span>
      </header>

      <div className="producto-card__body">
        <div>
          <p className="label">Stock</p>
          <strong>{producto.stock} u.</strong>
        </div>
        <div>
          <p className="label">Precio</p>
          <strong>{formatearMonedaCLP(producto.precio)}</strong>
        </div>
        <div>
          <p className="label">Alertas</p>
          <strong>{alerta ? `Umbral ${alerta.umbral} u.` : 'Sin alertas'}</strong>
        </div>
      </div>

      {producto.descripcion && (
        <p className="producto-card__descripcion">{producto.descripcion}</p>
      )}
    </article>
  );
}

export default TarjetaProducto;
