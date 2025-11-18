import { useState } from 'react';
import { servicioProducto } from '../../services/servicioInventario';
import './FormularioMovimiento.css';

const formularioInicial = {
  productoId: '',
  tipo: 'ENTRADA',
  cantidad: 1,
  descripcion: '',
};

function FormularioMovimiento({ productos, alRegistrar }) {
  const [datosFormulario, setDatosFormulario] = useState(formularioInicial);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const manejarCambio = (event) => {
    const { name, value } = event.target;
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarEnvio = async (event) => {
    event.preventDefault();
    if (!datosFormulario.productoId) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un producto.' });
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      const payload = {
        cantidad: Number(datosFormulario.cantidad) || 0,
        descripcion: datosFormulario.descripcion,
      };

      if (datosFormulario.tipo === 'ENTRADA') {
        await servicioProducto.registrarEntrada(datosFormulario.productoId, payload);
      } else {
        await servicioProducto.registrarSalida(datosFormulario.productoId, payload);
      }

      setMensaje({ tipo: 'success', texto: 'Movimiento registrado.' });
      setDatosFormulario(formularioInicial);
      alRegistrar?.();
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto:
          error.response?.data?.detail ||
          error.response?.data?.error ||
          'No se pudo registrar el movimiento.',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="movimiento-form" onSubmit={manejarEnvio}>
      <div className="form-grid">
        <label>
          <span>Producto *</span>
          <select
            name="productoId"
            value={datosFormulario.productoId}
            onChange={manejarCambio}
            required
          >
            <option value="">Selecciona una opción</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} ({producto.stock} u.)
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tipo *</span>
          <select name="tipo" value={datosFormulario.tipo} onChange={manejarCambio}>
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
          </select>
        </label>
        <label>
          <span>Cantidad *</span>
          <input
            type="number"
            min="1"
            name="cantidad"
            value={datosFormulario.cantidad}
            onChange={manejarCambio}
            required
          />
        </label>
      </div>

      <label>
        <span>Descripción</span>
        <textarea
          name="descripcion"
          rows={3}
          value={datosFormulario.descripcion}
          onChange={manejarCambio}
          placeholder="Ej. Lectura mensual o entrega en bodega"
        />
      </label>

      {mensaje && (
        <p className={`form-message ${mensaje.tipo}`}>{mensaje.texto}</p>
      )}

      <div className="form-actions">
        <button className="btn btn-secondary" type="button" onClick={() => setDatosFormulario(formularioInicial)}>
          Limpiar
        </button>
        <button className="btn btn-primary" type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Registrar movimiento'}
        </button>
      </div>
    </form>
  );
}

export default FormularioMovimiento;
