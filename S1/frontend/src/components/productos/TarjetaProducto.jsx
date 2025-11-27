import { formatCurrency, getStockStatus, getStockLabel } from '../../utils/utils';
import './TarjetaProducto.css';

function TarjetaProducto({ producto, alerta, alEliminar, alEditar, alRegistrarMovimiento }) {
  const variante = getStockStatus(producto.stock, alerta?.umbral);

  const manejarEliminar = async () => {
    if (window.confirm(`¿Eliminar "${producto.nombre}"?`)) {
      alEliminar?.(producto.id);
    }
  };

  const manejarEditar = () => {
    alEditar?.(producto);
  };

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
        <span className={`status-badge ${variante}`}>{getStockLabel(variante)}</span>
      </header>

      <div className="producto-card__body">
        <div>
          <p className="label">Stock</p>
          <strong>{producto.stock} u.</strong>
        </div>
        <div>
          <p className="label">Precio</p>
          <strong>{formatCurrency(producto.precio)}</strong>
        </div>
        <div>
          <p className="label">Alertas</p>
          <strong>{alerta ? `Umbral ${alerta.umbral} u.` : 'Sin alertas'}</strong>
        </div>
      </div>

      {producto.codigo_barras && (
        <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '4px', marginTop: '8px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 2px 0' }}>Código de barras</p>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#18181b', margin: 0, fontFamily: 'monospace' }}>
            {producto.codigo_barras}
          </p>
        </div>
      )}

      {producto.descripcion && (
        <p className="producto-card__descripcion">{producto.descripcion}</p>
      )}

      <div className="producto-card__actions">
        <button className="btn-icon btn-success" onClick={() => alRegistrarMovimiento?.(producto, 'entrada')} title="Registrar entrada">
          ⬆️
        </button>
        <button className="btn-icon btn-warning" onClick={() => alRegistrarMovimiento?.(producto, 'salida')} title="Registrar salida">
          ⬇️
        </button>
        <button className="btn-icon btn-primary" onClick={manejarEditar} title="Editar">
          ✏️
        </button>
        <button className="btn-icon btn-danger" onClick={manejarEliminar} title="Eliminar">
          🗑️
        </button>
      </div>
    </article>
  );
}

export default TarjetaProducto;
