import { useState } from 'react';
import '../styles/GeneradorCodigoBarras.css';

function GeneradorCodigoBarras() {
  const [codigo, setCodigo] = useState('');
  const [historial, setHistorial] = useState([]);

  const generarCodigoBarras = () => {
    // Genera código EAN-13 (13 dígitos)
    let codigoBase = '780'; // Prefijo común
    for (let i = 0; i < 9; i++) {
      codigoBase += Math.floor(Math.random() * 10);
    }
    
    // Calcular dígito de control EAN-13
    let suma = 0;
    for (let i = 0; i < 12; i++) {
      const digito = parseInt(codigoBase[i]);
      suma += (i % 2 === 0) ? digito : digito * 3;
    }
    const digitoControl = (10 - (suma % 10)) % 10;
    
    const codigoCompleto = codigoBase + digitoControl;
    setCodigo(codigoCompleto);
    
    // Agregar al historial
    setHistorial(prev => [
      { codigo: codigoCompleto, fecha: new Date().toLocaleString() },
      ...prev.slice(0, 9) // Mantener últimos 10
    ]);
  };

  const copiarCodigo = (codigoACopiar) => {
    navigator.clipboard.writeText(codigoACopiar);
    alert(`Código ${codigoACopiar} copiado al portapapeles`);
  };

  const limpiarHistorial = () => {
    if (window.confirm('¿Limpiar todo el historial?')) {
      setHistorial([]);
      setCodigo('');
    }
  };

  return (
    <div className="generador-container">
      <header className="page-header">
        <h1>🎲 Generador de Códigos de Barras</h1>
        <p>Genera códigos EAN-13 válidos para tus productos</p>
      </header>

      <div className="generador-content">
        <div className="generador-principal">
          <button 
            className="btn btn-primary btn-lg"
            onClick={generarCodigoBarras}
          >
            🎲 Generar Código Nuevo
          </button>

          {codigo && (
            <div className="codigo-generado">
              <p className="codigo-label">Código generado:</p>
              <div className="codigo-display">
                <span className="codigo-valor">{codigo}</span>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => copiarCodigo(codigo)}
                >
                  📋 Copiar
                </button>
              </div>
              <p className="codigo-info">
                ✅ Código EAN-13 válido con dígito de control
              </p>
            </div>
          )}

          <div className="generador-ayuda">
            <h3>💡 Cómo usar</h3>
            <ol>
              <li>Haz clic en "Generar Código Nuevo"</li>
              <li>Copia el código generado</li>
              <li>Pégalo en el formulario de producto</li>
              <li>El código será único y válido para escaneo</li>
            </ol>
            <p className="nota">
              <strong>Nota:</strong> Los códigos generados siguen el estándar EAN-13 
              con prefijo 780 y dígito de control válido.
            </p>
          </div>
        </div>

        {historial.length > 0 && (
          <div className="historial-panel">
            <div className="historial-header">
              <h3>📋 Historial (últimos {historial.length})</h3>
              <button 
                className="btn btn-danger btn-sm"
                onClick={limpiarHistorial}
              >
                🗑️ Limpiar
              </button>
            </div>
            <div className="historial-lista">
              {historial.map((item, index) => (
                <div key={index} className="historial-item">
                  <div>
                    <p className="historial-codigo">{item.codigo}</p>
                    <p className="historial-fecha">{item.fecha}</p>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => copiarCodigo(item.codigo)}
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeneradorCodigoBarras;
