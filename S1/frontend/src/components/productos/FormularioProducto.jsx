import { useState, useEffect } from 'react';
import { productService } from '../../services/inventoryService';
import './FormularioProducto.css';

const formularioInicial = {
  nombre: '',
  descripcion: '',
  marca: '',
  modelo: '',
  categoria: '',
  precio: '',
  stock: '',
  codigo_barras: '',
};

function FormularioProducto({ alCrear, productoEditar, alCancelar }) {
  const [datosFormulario, setDatosFormulario] = useState(formularioInicial);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const modoEdicion = Boolean(productoEditar);

  useEffect(() => {
    if (productoEditar) {
      setDatosFormulario({
        nombre: productoEditar.nombre || '',
        descripcion: productoEditar.descripcion || '',
        marca: productoEditar.marca || '',
        modelo: productoEditar.modelo || '',
        categoria: productoEditar.categoria || '',
        precio: productoEditar.precio || '',
        stock: productoEditar.stock || '',
        codigo_barras: productoEditar.codigo_barras || '',
      });
    } else {
      setDatosFormulario(formularioInicial);
    }
  }, [productoEditar]);

  const manejarCambio = (event) => {
    const { name, value } = event.target;
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarEnvio = async (event) => {
    event.preventDefault();

    // Validaciones básicas
    if (!datosFormulario.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre del producto es obligatorio.' });
      return;
    }

    if (datosFormulario.precio && Number(datosFormulario.precio) < 0) {
      setMensaje({ tipo: 'error', texto: 'El precio no puede ser negativo.' });
      return;
    }

    if (datosFormulario.stock && Number(datosFormulario.stock) < 0) {
      setMensaje({ tipo: 'error', texto: 'El stock no puede ser negativo.' });
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      const payload = {
        ...datosFormulario,
        stock: Number(datosFormulario.stock) || 0,
        precio: Number(datosFormulario.precio) || 0,
      };
      
      if (modoEdicion) {
        await productService.actualizar(productoEditar.id, payload);
        setMensaje({ tipo: 'success', texto: 'Producto actualizado correctamente.' });
      } else {
        await productService.crear(payload);
        setMensaje({ tipo: 'success', texto: 'Producto registrado correctamente.' });
      }
      
      setDatosFormulario(formularioInicial);
      alCrear?.();
      alCancelar?.();
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.detail || `No se pudo ${modoEdicion ? 'actualizar' : 'crear'} el producto.`,
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
        <label>
          <span>Código de barras</span>
          <input
            name="codigo_barras"
            value={datosFormulario.codigo_barras}
            onChange={manejarCambio}
            placeholder="Opcional"
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
        {modoEdicion && (
          <button className="btn btn-secondary" type="button" onClick={alCancelar}>
            Cancelar
          </button>
        )}
        {!modoEdicion && (
          <button className="btn btn-secondary" type="button" onClick={() => setDatosFormulario(formularioInicial)}>
            Limpiar
          </button>
        )}
        <button className="btn btn-primary" type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : (modoEdicion ? 'Actualizar producto' : 'Guardar producto')}
        </button>
      </div>
    </form>
  );
}

export default FormularioProducto;
