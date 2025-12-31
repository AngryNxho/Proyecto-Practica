import { useState } from 'react';
import { productService } from '../../services/inventoryService';
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

    if (!datosFormulario.cantidad || Number(datosFormulario.cantidad) <= 0) {
      setMensaje({ tipo: 'error', texto: 'La cantidad debe ser mayor a 0.' });
      return;
    }

    if (Number(datosFormulario.cantidad) > 100000) {
      setMensaje({ tipo: 'error', texto: 'La cantidad no puede exceder 100,000 unidades.' });
      return;
    }

    // Validar stock suficiente para salidas
    if (datosFormulario.tipo === 'SALIDA') {
      const productoSeleccionado = productos.find(p => p.id === Number(datosFormulario.productoId));
      if (productoSeleccionado && Number(datosFormulario.cantidad) > productoSeleccionado.stock) {
        setMensaje({ 
          tipo: 'error', 
          texto: `Stock insuficiente. Disponible: ${productoSeleccionado.stock} unidades.` 
        });
        return;
      }
    }

    setCargando(true);
    setMensaje(null);

    try {
      const payload = {
        cantidad: Number(datosFormulario.cantidad) || 0,
        descripcion: datosFormulario.descripcion,
      };

      if (datosFormulario.tipo === 'ENTRADA') {
        await productService.registrarEntrada(datosFormulario.productoId, payload);
      } else {
        await productService.registrarSalida(datosFormulario.productoId, payload);
      }

      setMensaje({ tipo: 'success', texto: 'Movimiento registrado.' });
      setDatosFormulario(formularioInicial);
      alRegistrar?.();
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      
      let textoError = error.mensajeUsuario || 'No se pudo registrar el movimiento.';
      
      // Manejar errores específicos del backend
      if (error.response?.data?.detail) {
        textoError = error.response.data.detail;
      } else if (error.response?.data?.error) {
        textoError = error.response.data.error;
      } else if (error.response?.status === 400) {
        textoError = 'Datos inválidos. Verifica la información ingresada.';
      }
      
      setMensaje({
        tipo: 'error',
        texto: textoError,
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
