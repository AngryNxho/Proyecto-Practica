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

// Función para generar código de barras EAN-13
const generarCodigoBarras = () => {
  // Genera 12 dígitos aleatorios (el último es dígito de control)
  let codigo = '780'; // Prefijo común para códigos de barras
  for (let i = 0; i < 9; i++) {
    codigo += Math.floor(Math.random() * 10);
  }
  
  // Calcular dígito de control EAN-13
  let suma = 0;
  for (let i = 0; i < 12; i++) {
    const digito = parseInt(codigo[i]);
    suma += (i % 2 === 0) ? digito : digito * 3;
  }
  const digitoControl = (10 - (suma % 10)) % 10;
  
  return codigo + digitoControl;
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

  const generarCodigo = () => {
    const codigoGenerado = generarCodigoBarras();
    setDatosFormulario((prev) => ({
      ...prev,
      codigo_barras: codigoGenerado,
    }));
    setMensaje({ tipo: 'success', texto: `Código generado: ${codigoGenerado}` });
  };

  const manejarEnvio = async (event) => {
    event.preventDefault();

    // Validaciones mejoradas
    if (!datosFormulario.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre del producto es obligatorio.' });
      return;
    }

    if (datosFormulario.nombre.trim().length < 3) {
      setMensaje({ tipo: 'error', texto: 'El nombre debe tener al menos 3 caracteres.' });
      return;
    }

    if (datosFormulario.precio && Number(datosFormulario.precio) < 0) {
      setMensaje({ tipo: 'error', texto: 'El precio no puede ser negativo.' });
      return;
    }

    if (datosFormulario.precio && Number(datosFormulario.precio) > 99999999) {
      setMensaje({ tipo: 'error', texto: 'El precio es demasiado alto.' });
      return;
    }

    if (datosFormulario.stock && Number(datosFormulario.stock) < 0) {
      setMensaje({ tipo: 'error', texto: 'El stock no puede ser negativo.' });
      return;
    }

    if (datosFormulario.stock && Number(datosFormulario.stock) > 999999) {
      setMensaje({ tipo: 'error', texto: 'El stock es demasiado alto.' });
      return;
    }

    if (datosFormulario.codigo_barras && datosFormulario.codigo_barras.length > 0 && datosFormulario.codigo_barras.length < 8) {
      setMensaje({ tipo: 'error', texto: 'El código de barras debe tener al menos 8 dígitos.' });
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
        setMensaje({ tipo: 'success', texto: '✓ Producto actualizado correctamente.' });
      } else {
        await productService.crear(payload);
        setMensaje({ tipo: 'success', texto: '✓ Producto registrado correctamente.' });
      }
      
      setTimeout(() => {
        setDatosFormulario(formularioInicial);
        setMensaje(null);
        alCrear?.();
        alCancelar?.();
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data;
      let textoError = `No se pudo ${modoEdicion ? 'actualizar' : 'crear'} el producto.`;
      
      if (errorMsg?.codigo_barras) {
        textoError = 'Este código de barras ya está registrado.';
      } else if (errorMsg?.nombre) {
        textoError = 'Ya existe un producto con este nombre.';
      } else if (errorMsg?.detail) {
        textoError = errorMsg.detail;
      }
      
      setMensaje({ tipo: 'error', texto: textoError });
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              name="codigo_barras"
              value={datosFormulario.codigo_barras}
              onChange={manejarCambio}
              placeholder="Ej. 7801234567890"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={generarCodigo}
              title="Generar código automáticamente"
            >
              🎲 Generar
            </button>
          </div>
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
