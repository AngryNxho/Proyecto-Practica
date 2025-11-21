import { useState } from 'react';
import { alertService } from '../../services/inventoryService';
import './FormularioAlerta.css';

function FormularioAlerta({ productos, alCrear }) {
  const [datosFormulario, setDatosFormulario] = useState({
    producto: '',
    umbral: 5,
  });
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
    if (!datosFormulario.producto) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un producto.' });
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      const payload = {
        producto: Number(datosFormulario.producto),
        umbral: Number(datosFormulario.umbral) || 5,
        activa: true,
      };
      await alertService.create(payload);
      setMensaje({ tipo: 'success', texto: 'Alerta configurada correctamente.' });
      setDatosFormulario({ producto: '', umbral: 5 });
      alCrear?.();
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.detail || 'No se pudo crear la alerta.',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="alerta-form" onSubmit={manejarEnvio}>
      <h3>Configurar nueva alerta</h3>
      <div className="form-grid">
        <label>
          <span>Producto *</span>
          <select
            name="producto"
            value={datosFormulario.producto}
            onChange={manejarCambio}
            required
          >
            <option value="">Selecciona un producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} (Stock: {producto.stock})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Umbral de stock *</span>
          <input
            type="number"
            name="umbral"
            min="1"
            value={datosFormulario.umbral}
            onChange={manejarCambio}
            required
            placeholder="Ej. 5"
          />
        </label>
      </div>

      {mensaje && (
        <p className={`form-message ${mensaje.tipo}`}>{mensaje.texto}</p>
      )}

      <div className="form-actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => setDatosFormulario({ producto: '', umbral: 5 })}
        >
          Limpiar
        </button>
        <button className="btn btn-primary" type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Crear alerta'}
        </button>
      </div>
    </form>
  );
}

export default FormularioAlerta;
