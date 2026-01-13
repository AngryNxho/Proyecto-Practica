import { useState } from 'react';
import './ModalMovimiento.css';

function ModalMovimiento({ producto, tipo, alCerrar, alConfirmar }) {
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!cantidad || cantidad <= 0) return;

    setCargando(true);
    await alConfirmar({ cantidad: Number(cantidad), descripcion });
    setCargando(false);
  };

  const tituloModal = tipo === 'entrada' ? 'Registrar entrada de stock' : 'Registrar salida de stock';
  const colorBoton = tipo === 'entrada' ? 'primary' : 'secondary';

  return (
    <div className="modal-overlay" onClick={alCerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-encabezado">
          <h3>{tituloModal}</h3>
          <button className="modal-cerrar" onClick={alCerrar}>×</button>
        </div>

        <div className="modal-cuerpo">
          <p className="modal-producto">
            <strong>{producto.nombre}</strong>
            <span>Stock actual: {producto.stock}</span>
          </p>

          <form onSubmit={manejarEnvio}>
            <label>
              <span>Cantidad</span>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="Ingresa la cantidad"
                required
                autoFocus
              />
            </label>

            <label>
              <span>Descripción</span>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Motivo del movimiento (requerido)"
                rows="3"
                required
              />
            </label>

            <div className="modal-acciones">
              <button type="button" className="btn btn-secondary" onClick={alCerrar}>
                Cancelar
              </button>
              <button type="submit" className={`btn btn-${colorBoton}`} disabled={cargando}>
                {cargando ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModalMovimiento;
