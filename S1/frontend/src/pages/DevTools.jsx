import { useState } from 'react';
import './DevTools.css';

function DevTools() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const resetDatabase = async () => {
    if (!window.confirm('⚠️ ¿Estás seguro? Esto borrará TODOS los datos de la base de datos.')) {
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
        setMessage({ type: 'success', text: '✅ Base de datos limpiada exitosamente' });
      } else {
        setMessage({ type: 'error', text: '❌ Error: ' + data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error de conexión: ' + error.message });
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
          text: `✅ Base de datos poblada: ${data.productos} productos creados` 
        });
      } else {
        setMessage({ type: 'error', text: '❌ Error: ' + data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error de conexión: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page dev-tools-page">
      <header className="page-header">
        <h1>Pruebas</h1>
        <p className="warning">Momentáneo</p>
      </header>

      <div className="dev-tools-container">
        <div className="tool-card">
          <h2>Limpiar Base de Datos</h2>
          <p>Elimina todos los productos, movimientos y alertas de la base de datos.</p>
          <button 
            className="btn btn-danger btn-lg" 
            onClick={resetDatabase}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Borrar Todo'}
          </button>
        </div>

        <div className="tool-card">
          <h2>Insertar Datos de Ejemplo</h2>
          <p>Borra los datos actuales e inserta 5 productos de ejemplo con sus alertas y movimientos.</p>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={populateDatabase}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Insertar Datos'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`dev-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dev-info">
        <h3>ℹ️ Información</h3>
        <ul>
          <li><strong>Borrar Todo:</strong> Limpia completamente la base de datos</li>
          <li><strong>Insertar Datos:</strong> Crea 5 productos con códigos de barras válidos</li>
          <li><strong>Productos incluidos:</strong> Toner HP, Tinta Epson, Papel Navigator, Toner Brother, Cartucho Canon</li>
          <li><strong>Códigos de barras:</strong> Formatos EAN-13 válidos para probar el scanner</li>
        </ul>
        
        <h3 style={{ marginTop: '2rem' }}>📊 Progreso Sprint 2 (43%)</h3>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h4>✅ Completadas (9/21):</h4>
          <ul style={{ fontSize: '0.9rem', color: '#2c3e50' }}>
            <li>S03-HU05: Buscar productos</li>
            <li>S03-HU06: Filtrar productos por stock</li>
            <li>S03-HU07: Ver productos paginados</li>
            <li>S03-HU08: Optimizar consultas</li>
            <li>S03-HU09: Interfaz responsive</li>
            <li>S03-HU10: Formularios accesibles</li>
            <li>S03-HU11: Componentes reutilizables</li>
            <li>S04-HU01: Registrar entradas de stock</li>
            <li>S04-HU02: Registrar salidas de stock</li>
          </ul>
          
          <h4 style={{ marginTop: '1rem' }}>⏳ Pendientes (12/21):</h4>
          <ul style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            <li>S03-HU12: Pruebas para componentes</li>
            <li>S04-HU03: Validar stock suficiente</li>
            <li>S04-HU04: Actualizar stock automáticamente</li>
            <li>S04-HU05: Transacciones seguras</li>
            <li>S04-HU06: Ver historial de movimientos</li>
            <li>S04-HU07: Filtrar movimientos</li>
            <li>S04-HU08: Ver detalles de movimiento</li>
            <li>S04-HU09: Exportar historial a CSV</li>
            <li>S04-HU10: Pruebas para transacciones</li>
            <li>S05-HU01: Generar alertas stock bajo</li>
            <li>S05-HU02: Crear modelo de alertas</li>
            <li>S05-HU03: Endpoint para alertas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DevTools;
