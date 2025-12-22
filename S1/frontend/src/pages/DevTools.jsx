import { useState } from 'react';
import './DevTools.css';

function DevTools() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const resetDatabase = async () => {
    if (!window.confirm('¿Estás seguro? Esto borrará TODOS los datos de la base de datos.')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dev/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessage({ type: 'success', text: 'Base de datos limpiada exitosamente' });
      } else {
        setMessage({ type: 'error', text: 'Error: ' + data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const populateDatabase = async () => {
    if (!window.confirm('Esto borrará los datos actuales e insertará datos de ejemplo. ¿Continuar?')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dev/populate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessage({ 
          type: 'success', 
          text: `Base de datos poblada: ${data.productos} productos creados` 
        });
      } else {
        setMessage({ type: 'error', text: 'Error: ' + data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page dev-tools-page">
      <div className="dev-tools-container">
        <div className="tool-card">
          <h2>🗑️ Limpiar Base de Datos</h2>
          <p>Elimina todos los productos, movimientos y alertas de la base de datos.</p>
          <button 
            className="btn btn-danger btn-lg" 
            onClick={resetDatabase}
            disabled={loading}
          >
            {loading ? '🔄 Procesando...' : '⚠️ Borrar Todo'}
          </button>
        </div>

        <div className="tool-card">
          <h2>🎲 Insertar Datos de Ejemplo</h2>
          <p>Borra los datos actuales e inserta 20 productos de ejemplo (impresoras, tóners CMYK, tintas, papel) con sus alertas y movimientos.</p>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={populateDatabase}
            disabled={loading}
          >
            {loading ? '🔄 Procesando...' : '➕ Insertar Datos'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`dev-message ${message.type}`}>
          {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
        </div>
      )}
    </div>
  );
}

export default DevTools;
