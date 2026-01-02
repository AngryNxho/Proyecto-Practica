import { useState, useRef } from 'react';
import './ImportarDatos.css';

function ImportarDatos() {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState([]);
  const [resultado, setResultado] = useState(null);
  const inputRef = useRef(null);

  const manejarSeleccionArchivo = (e) => {
    const archivoSeleccionado = e.target.files[0];
    
    if (!archivoSeleccionado) return;
    
    if (!archivoSeleccionado.name.endsWith('.csv')) {
      setMensaje({
        tipo: 'error',
        texto: 'El archivo debe ser un CSV'
      });
      return;
    }

    setArchivo(archivoSeleccionado);
    setMensaje(null);
    setResultado(null);

    // Leer y mostrar vista previa
    const reader = new FileReader();
    reader.onload = (evento) => {
      const texto = evento.target.result;
      const lineas = texto.split('\n').filter(l => l.trim());
      
      if (lineas.length < 2) {
        setMensaje({
          tipo: 'error',
          texto: 'El archivo CSV está vacío o no tiene datos'
        });
        setVistaPrevia([]);
        return;
      }

      // Tomar primeras 5 filas para preview
      const preview = lineas.slice(0, Math.min(6, lineas.length));
      setVistaPrevia(preview);
    };
    reader.readAsText(archivoSeleccionado);
  };

  const importarCSV = async () => {
    if (!archivo) {
      setMensaje({
        tipo: 'error',
        texto: 'Selecciona un archivo CSV primero'
      });
      return;
    }

    setCargando(true);
    setMensaje(null);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/productos/importar_csv/`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const datos = await response.json();

      if (response.ok) {
        setResultado(datos);
        setMensaje({
          tipo: 'success',
          texto: `Importación completada: ${datos.creados} productos creados, ${datos.actualizados} actualizados`
        });
        
        // Limpiar formulario después del éxito
        setArchivo(null);
        setVistaPrevia([]);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      } else {
        setResultado(datos);
        setMensaje({
          tipo: 'error',
          texto: datos.error || 'Error al importar archivo'
        });
      }
    } catch (error) {
      console.error('Error al importar CSV:', error);
      setMensaje({
        tipo: 'error',
        texto: 'Error de conexión al importar el archivo'
      });
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setArchivo(null);
    setVistaPrevia([]);
    setResultado(null);
    setMensaje(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const descargarPlantilla = () => {
    const plantilla = `nombre,categoria,marca,modelo,precio,stock,descripcion,codigo_barras
Impresora HP LaserJet M404dn,Impresora,HP,M404dn,285000,5,Impresora láser monocromática 38ppm,7801234567890
Mouse Logitech MX Master 3,Accesorio,Logitech,MX Master 3,89990,15,Mouse ergonómico inalámbrico,7801234567891
Teclado Mecánico Keychron K2,Accesorio,Keychron,K2,99990,8,Teclado mecánico RGB compacto,7801234567892`;

    const blob = new Blob([plantilla], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_productos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">📤 Importar datos</h1>
        <p className="page-description">
          Carga productos masivamente desde un archivo CSV
        </p>
      </header>

      <div className="importar-container">
        <div className="importar-panel">
          <h2>Subir archivo CSV</h2>
          
          <div className="archivo-seccion">
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={manejarSeleccionArchivo}
              className="archivo-input"
              id="archivo-csv"
            />
            <label htmlFor="archivo-csv" className="archivo-label">
              📁 {archivo ? archivo.name : 'Seleccionar archivo CSV'}
            </label>
          </div>

          {mensaje && (
            <div className={`mensaje ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="botones-grupo">
            <button
              className="btn-importar"
              onClick={importarCSV}
              disabled={cargando || !archivo}
            >
              {cargando ? 'Importando...' : '📤 Importar productos'}
            </button>
            
            <button
              className="btn-limpiar"
              onClick={limpiarFormulario}
              disabled={cargando}
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {vistaPrevia.length > 0 && (
          <div className="preview-panel">
            <h3>Vista previa (primeras {vistaPrevia.length - 1} filas)</h3>
            <div className="preview-contenido">
              <pre>{vistaPrevia.join('\n')}</pre>
            </div>
          </div>
        )}

        {resultado && (
          <div className="resultado-panel">
            <h3>Resultado de la importación</h3>
            
            <div className="stats-grid">
              <div className="stat-card success">
                <span className="stat-label">Productos creados</span>
                <span className="stat-valor">{resultado.creados}</span>
              </div>
              <div className="stat-card info">
                <span className="stat-label">Productos actualizados</span>
                <span className="stat-valor">{resultado.actualizados}</span>
              </div>
              <div className="stat-card warning">
                <span className="stat-label">Errores</span>
                <span className="stat-valor">{resultado.errores?.length || 0}</span>
              </div>
            </div>

            {resultado.errores && resultado.errores.length > 0 && (
              <div className="errores-lista">
                <h4>Errores encontrados:</h4>
                <ul>
                  {resultado.errores.slice(0, 10).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                  {resultado.errores.length > 10 && (
                    <li>...y {resultado.errores.length - 10} errores más</li>
                  )}
                </ul>
              </div>
            )}

            {resultado.advertencias && resultado.advertencias.length > 0 && (
              <div className="advertencias-lista">
                <h4>Advertencias:</h4>
                <ul>
                  {resultado.advertencias.slice(0, 10).map((adv, idx) => (
                    <li key={idx}>{adv}</li>
                  ))}
                  {resultado.advertencias.length > 10 && (
                    <li>...y {resultado.advertencias.length - 10} advertencias más</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="info-panel">
          <h3>Formato del archivo CSV</h3>
          <p>El archivo debe tener las siguientes columnas (en orden):</p>
          <ul className="formato-lista">
            <li><strong>nombre</strong> (obligatorio) - Nombre del producto</li>
            <li><strong>categoria</strong> - Categoría del producto</li>
            <li><strong>marca</strong> - Marca del producto</li>
            <li><strong>modelo</strong> - Modelo del producto</li>
            <li><strong>precio</strong> (obligatorio) - Precio unitario (número)</li>
            <li><strong>stock</strong> (obligatorio) - Cantidad en inventario (número entero)</li>
            <li><strong>descripcion</strong> - Descripción del producto</li>
            <li><strong>codigo_barras</strong> - Código de barras (opcional, debe ser único)</li>
          </ul>

          <button className="btn-plantilla" onClick={descargarPlantilla}>
            📥 Descargar plantilla de ejemplo
          </button>

          <div className="notas">
            <h4>Notas importantes:</h4>
            <ul>
              <li>El archivo debe estar codificado en UTF-8</li>
              <li>Los precios pueden usar punto o coma como decimal</li>
              <li>Si un producto ya existe (mismo nombre), se actualizará</li>
              <li>Los códigos de barras deben ser únicos</li>
              <li>Las filas con errores se omitirán y se reportarán</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportarDatos;
