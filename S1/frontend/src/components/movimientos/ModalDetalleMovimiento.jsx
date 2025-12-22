import { formatDateTime } from '../../utils/utils';
import './ModalDetalleMovimiento.css';

function ModalDetalleMovimiento({ movimiento, onCerrar }) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalles del Movimiento</h2>
          <button className="modal-close" onClick={onCerrar} aria-label="Cerrar modal">
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="detalle-grupo">
            <label>ID del Movimiento</label>
            <p>#{movimiento.id}</p>
          </div>

          <div className="detalle-grupo">
            <label>Producto</label>
            <p className="detalle-producto">{movimiento.producto_nombre}</p>
          </div>

          <div className="detalle-grupo">
            <label>Tipo de Movimiento</label>
            <p>
              <span className={`badge-tipo ${movimiento.tipo.toLowerCase()}`}>
                {movimiento.tipo === 'ENTRADA' ? 'ENTRADA' : 'SALIDA'}
              </span>
            </p>
          </div>

          <div className="detalle-grupo">
            <label>Cantidad</label>
            <p className="detalle-cantidad">
              {movimiento.tipo === 'ENTRADA' ? '+' : '-'}{movimiento.cantidad} unidades
            </p>
          </div>

          <div className="detalle-grupo">
            <label>Fecha y Hora</label>
            <p>{formatDateTime(movimiento.fecha)}</p>
          </div>

          {movimiento.descripcion && (
            <div className="detalle-grupo">
              <label>Descripción</label>
              <p className="detalle-descripcion">{movimiento.descripcion}</p>
            </div>
          )}

          <div className="detalle-grupo">
            <label>ID del Producto</label>
            <p>#{movimiento.producto}</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalleMovimiento;
