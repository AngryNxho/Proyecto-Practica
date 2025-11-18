import { useState } from 'react';
import { servicioProducto } from '../../services/servicioInventario';
import './FormularioProducto.css';

const formularioInicial = {
  nombre: '',
  descripcion: '',
  marca: '',
  modelo: '',
  categoria: '',
  precio: '',
  stock: '',
};

function FormularioProducto({ alCrear }) {
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
    setCargando(true);
    setMensaje(null);

    try {
      const payload = {
        ...datosFormulario,
        stock: Number(datosFormulario.stock) || 0,
        precio: Number(datosFormulario.precio) || 0,
      };
      await servicioProducto.crear(payload);
      setMensaje({ tipo: 'success', texto: 'Producto registrado correctamente.' });
      setDatosFormulario(formularioInicial);
      alCrear?.();
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.detail || 'No se pudo crear el producto.',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="producto-form" onSubmit={manejarEnvio}>
      <div className="form-grid">
        <label>
          <span>Nombre *</span>
          <input
            name="nombre"
            value={datosFormulario.nombre}
            onChange={manejarCambio}
            required
            placeholder="Ej. Toner HP 80A"
          />
        </label>
        <label>
          <span>Categoría</span>
          <input
            name="categoria"
            value={datosFormulario.categoria}
            onChange={manejarCambio}
            placeholder="Impresora, Toner, etc."
          />
        </label>
        <label>
          <span>Marca</span>
          <input name="marca" value={datosFormulario.marca} onChange={manejarCambio} />
        </label>
        <label>
          <span>Modelo</span>
          <input name="modelo" value={datosFormulario.modelo} onChange={manejarCambio} />
        </label>
        <label>
          <span>Precio (CLP)</span>
          <input
            name="precio"
            type="number"
            min="0"
            step="1000"
            value={datosFormulario.precio}
            onChange={manejarCambio}
          />
        </label>
        <label>
          <span>Stock inicial</span>
          <input
            name="stock"
            type="number"
            min="0"
            value={datosFormulario.stock}
            onChange={manejarCambio}
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
          placeholder="Notas internas o compatibilidades"
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
          {cargando ? 'Guardando...' : 'Guardar producto'}
        </button>
      </div>
    </form>
  );
}

export default FormularioProducto;
