import { useState, useEffect } from 'react';
import { productService } from '../services/inventoryService';
import JsBarcode from 'jsbarcode';
import '../styles/GeneradorCodigoBarras.css';

function GeneradorCodigoBarras() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (productoSeleccionado?.codigo_barras) {
      generarImagenBarcode(productoSeleccionado.codigo_barras);
    }
  }, [productoSeleccionado]);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const response = await productService.obtenerTodos();
      const data = response.data.results || response.data || [];
      const producosConCodigo = data.filter(p => p.codigo_barras);
      setProductos(producosConCodigo);
      if (producosConCodigo.length > 0) {
        setProductoSeleccionado(producosConCodigo[0]);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  const generarImagenBarcode = (codigo) => {
    try {
      // Limpiar el SVG anterior
      const svgElement = document.getElementById("barcode-svg");
      if (svgElement) {
        svgElement.innerHTML = '';
      }
      
      JsBarcode("#barcode-svg", codigo, {
        format: "EAN13",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 20,
        margin: 10
      });
    } catch (error) {
      console.error('Error al generar código de barras:', error);
    }
  };

  const imprimirCodigo = () => {
    window.print();
  };

  return (
    <div className="generador-container">
      <header className="page-header">
        <h1>Etiquetas de Productos</h1>
        <p>Selecciona un producto para imprimir su etiqueta con código de barras</p>
      </header>

      <div className="generador-content">
        <div className="generador-principal">
          {cargando ? (
            <p>Cargando productos...</p>
          ) : productos.length === 0 ? (
            <div className="generador-ayuda">
              <h3>No hay productos con código de barras</h3>
              <p>Para generar etiquetas, primero crea productos y asígnales códigos de barras desde la sección Productos.</p>
            </div>
          ) : (
            <>
              <div className="selector-producto">
                <label htmlFor="producto-select">Seleccionar producto:</label>
                <select 
                  id="producto-select"
                  value={productoSeleccionado?.id || ''}
                  onChange={(e) => {
                    const producto = productos.find(p => p.id === parseInt(e.target.value));
                    setProductoSeleccionado(producto);
                  }}
                  className="form-control"
                >
                  {productos.map(producto => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} - {producto.codigo_barras}
                    </option>
                  ))}
                </select>
              </div>

              {productoSeleccionado && (
                <div className="etiqueta-preview">
                  <div className="etiqueta-contenido">
                    <h3>{productoSeleccionado.nombre}</h3>
                    {productoSeleccionado.marca && <p>Marca: {productoSeleccionado.marca}</p>}
                    {productoSeleccionado.modelo && <p>Modelo: {productoSeleccionado.modelo}</p>}
                    <svg id="barcode-svg"></svg>
                  </div>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={imprimirCodigo}
                  >
                    Imprimir Etiqueta
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="generador-ayuda">
          <h3>Cómo usar</h3>
          <ol>
            <li>Selecciona un producto de la lista</li>
            <li>Se generará automáticamente la etiqueta con código de barras</li>
            <li>Haz clic en "Imprimir Etiqueta"</li>
            <li>Configura tu impresora y imprime</li>
            <li>Pega la etiqueta en el producto físico</li>
          </ol>
          <p className="nota">
            <strong>Nota:</strong> Solo se muestran productos que tienen código de barras asignado.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GeneradorCodigoBarras;
