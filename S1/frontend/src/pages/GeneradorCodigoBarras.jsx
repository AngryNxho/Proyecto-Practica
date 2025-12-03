import { useState, useEffect } from 'react';
import { productService } from '../services/inventoryService';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/GeneradorCodigoBarras.css';

function GeneradorCodigoBarras() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [cantidadEtiquetas, setCantidadEtiquetas] = useState(1);
  const [formatoBarcode, setFormatoBarcode] = useState('CODE128');

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

  const productosFiltrados = productos.filter(p => {
    const cumpleBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          (p.marca && p.marca.toLowerCase().includes(busqueda.toLowerCase())) ||
                          (p.modelo && p.modelo.toLowerCase().includes(busqueda.toLowerCase()));
    
    const cumpleCategoria = categoriaFiltro === 'todas' || p.categoria === categoriaFiltro;
    
    return cumpleBusqueda && cumpleCategoria;
  });

  const categorias = ['todas', ...new Set(productos.map(p => p.categoria).filter(Boolean))];

  const obtenerEstadisticas = () => {
    return {
      total: productos.length,
      conCodigo: productos.filter(p => p.codigo_barras).length,
      porCategoria: categorias.filter(c => c !== 'todas').reduce((acc, cat) => {
        acc[cat] = productos.filter(p => p.categoria === cat).length;
        return acc;
      }, {})
    };
  };

  const generarImagenBarcode = (codigo) => {
    try {
      // Limpiar el SVG anterior
      const svgElement = document.getElementById("barcode-svg");
      if (svgElement) {
        svgElement.innerHTML = '';
      }
      
      JsBarcode("#barcode-svg", codigo, {
        format: formatoBarcode,
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

  const descargarEtiqueta = () => {
    const etiqueta = document.querySelector('.etiqueta-contenido');
    if (!etiqueta) return;

    // Crear canvas temporal
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Implementación pendiente de descarga PNG
    alert('Función de descarga en desarrollo');
  };

  return (
    <div className="page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Generador de etiquetas</h1>
        <p className="page-description">
          Genera e imprime etiquetas con códigos de barras y QR para tus productos
        </p>
      </header>

      {/* Estadísticas */}
      <div className="estadisticas-etiquetas">
        <div className="stat-card">
          <span className="stat-numero">{obtenerEstadisticas().total}</span>
          <span className="stat-label">Total productos</span>
        </div>
        <div className="stat-card">
          <span className="stat-numero">{obtenerEstadisticas().conCodigo}</span>
          <span className="stat-label">Con código de barras</span>
        </div>
        <div className="stat-card">
          <span className="stat-numero">{productosFiltrados.length}</span>
          <span className="stat-label">Resultados filtrados</span>
        </div>
      </div>

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
              {/* Filtros */}
              <div className="filtros-etiquetas">
                <div className="filtro-grupo">
                  <label htmlFor="busqueda">Buscar producto:</label>
                  <input
                    id="busqueda"
                    type="text"
                    placeholder="Nombre, marca o modelo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="form-control"
                  />
                </div>
                
                <div className="filtro-grupo">
                  <label htmlFor="categoria-filtro">Categoría:</label>
                  <select
                    id="categoria-filtro"
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="form-control"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'todas' ? 'Todas las categorías' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-grupo">
                  <label htmlFor="formato-barcode">Formato código de barras:</label>
                  <select
                    id="formato-barcode"
                    value={formatoBarcode}
                    onChange={(e) => {
                      setFormatoBarcode(e.target.value);
                      if (productoSeleccionado?.codigo_barras) {
                        setTimeout(() => generarImagenBarcode(productoSeleccionado.codigo_barras), 100);
                      }
                    }}
                    className="form-control"
                  >
                    <option value="CODE128">CODE128</option>
                    <option value="CODE39">CODE39</option>
                    <option value="EAN13">EAN-13</option>
                    <option value="UPC">UPC</option>
                  </select>
                </div>
              </div>

              <div className="opciones-etiqueta">
                <div className="filtro-grupo">
                  <label htmlFor="cantidad">Cantidad de etiquetas:</label>
                  <input
                    id="cantidad"
                    type="number"
                    min="1"
                    max="100"
                    value={cantidadEtiquetas}
                    onChange={(e) => setCantidadEtiquetas(parseInt(e.target.value) || 1)}
                    className="form-control"
                  />
                </div>
              </div>

                  <div className="etiqueta-contenido">
                    <div className="info-producto-etiqueta">
                      <h3>{productoSeleccionado.nombre}</h3>
                      {productoSeleccionado.marca && <p><strong>Marca:</strong> {productoSeleccionado.marca}</p>}
                      {productoSeleccionado.modelo && <p><strong>Modelo:</strong> {productoSeleccionado.modelo}</p>}
                      {productoSeleccionado.categoria && <p><strong>Categoría:</strong> {productoSeleccionado.categoria}</p>}
                      <p><strong>Stock actual:</strong> {productoSeleccionado.stock} unidades</p>
                      <p className="precio-etiqueta"><strong>Precio:</strong> ${productoSeleccionado.precio?.toLocaleString('es-CL')}</p>
                    </div>
                    
                    <div className="codigos-container">
                      <div className="barcode-section">
                        <p className="codigo-tipo">Código {formatoBarcode}</p>
                        <svg id="barcode-svg"></svg>
                      </div>
                      
                      <div className="qr-section">
                        <p className="codigo-tipo">Código QR</p>
                        <QRCodeSVG 
                          value={productoSeleccionado.codigo_barras}
                          size={100}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>

                    <div className="acciones-etiqueta">
                      <button className="btn btn-primary" type="button" onClick={imprimirCodigo}>
                        🖨️ Imprimir
                      </button>
                      <button className="btn btn-secondary" type="button" onClick={descargarEtiqueta}>
                        💾 Descargar PNG
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="empty-state">Selecciona un producto para generar su etiqueta</p>
              )}
            </div>
          </div>

          <div className="panel">
            <h3>Cómo usar</h3>
            <ol>
              <li>Usa los filtros para encontrar el producto</li>
              <li>Selecciona el formato de código de barras deseado</li>
              <li>Ajusta la cantidad de etiquetas a imprimir</li>
              <li>Haz clic en Imprimir o Descargar</li>
              <li>Pega las etiquetas en los productos físicos</li>
            </ol>
          </div>
          
          <div className="panel">
            <h4>Formatos disponibles</h4>
            <ul>
              <li><strong>CODE128:</strong> Más usado, soporta alfanuméricos</li>
              <li><strong>CODE39:</strong> Formato industrial estándar</li>
              <li><strong>EAN13:</strong> Productos comerciales (13 dígitos)</li>
              <li><strong>UPC:</strong> Estándar estadounidense (12 dígitos)</li>
            </ul>
          </div>

          <div className="panel">
            <p>
              El código QR permite escaneo rápido con smartphones. El código de barras es para lectores láser tradicionales. Ambos contienen el mismo código del producto.
            </p>
          </div>

          <div className="categoria-stats">
            <h4>📊 Productos por categoría</h4>
            <ul>
              {Object.entries(obtenerEstadisticas().porCategoria).map(([cat, count]) => (
                <li key={cat}>
                  <strong>{cat}:</strong> {count} producto{count !== 1 ? 's' : ''}
                </li>
              ))}
            </ul>
          </div     <div className="acciones-etiqueta">
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={imprimirCodigo}
                    >
                      🖨️ Imprimir {cantidadEtiquetas > 1 ? `${cantidadEtiquetas} etiquetas` : 'etiqueta'}
                    </button>
                    <button 
                      className="btn btn-secondary btn-lg"
                      onClick={descargarEtiqueta}
                    >
                      💾 Descargar imagen
                    </button>
                  </div

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
                    
                    <div className="codigos-container">
                      <div className="barcode-section">
                        <svg id="barcode-svg"></svg>
                      </div>
                      
                      <div className="qr-section">
                        <QRCodeSVG 
                          value={productoSeleccionado.codigo_barras}
                          size={120}
                          level="M"
                          includeMargin={true}
                        />
                        <p className="qr-label">Escanear con móvil</p>
                      </div>
                    </div>
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
            <li>Se generará automáticamente la etiqueta con código de barras y QR</li>
            <li>Haz clic en "Imprimir Etiqueta"</li>
            <li>Configura tu impresora y imprime</li>
            <li>Pega la etiqueta en el producto físico</li>
          </ol>
          <p className="nota">
            <strong>Nota:</strong> El código QR permite escaneo rápido con smartphones. El código de barras es para lectores láser tradicionales.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GeneradorCodigoBarras;
