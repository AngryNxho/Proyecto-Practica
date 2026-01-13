import { useState } from 'react';
import './DevTools.css';

function DevTools() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [testResults, setTestResults] = useState([]);

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
        body: JSON.stringify({ confirmar_borrado: true }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessage({ type: 'success', text: `Base de datos limpiada: ${data.eliminados.productos} productos, ${data.eliminados.movimientos} movimientos, ${data.eliminados.alertas} alertas eliminados` });
        // Recargar página después de 1 segundo (forzando recarga sin caché)
        setTimeout(() => {
          window.location.href = window.location.href.split('?')[0] + '?_=' + Date.now();
        }, 1500);
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
        // Recargar página después de 1 segundo (forzando recarga sin caché)
        setTimeout(() => {
          window.location.href = window.location.href.split('?')[0] + '?_=' + Date.now();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Error: ' + data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const runIntegrationTests = async () => {
    setLoading(true);
    setTestResults([]);
    setMessage(null);

    const tests = [];
    const API_URL = import.meta.env.VITE_API_URL;

    // Test 1: Verificar conexión con API
    try {
      const start = Date.now();
      const response = await fetch(`${API_URL}/productos/`);
      const time = Date.now() - start;
      tests.push({
        name: '🌐 Conexión API',
        status: response.ok ? 'success' : 'error',
        detail: `${response.status} - ${time}ms`,
        ok: response.ok
      });
    } catch (error) {
      tests.push({
        name: '🌐 Conexión API',
        status: 'error',
        detail: error.message,
        ok: false
      });
    }

    // Test 2: Verificar estadísticas
    try {
      const response = await fetch(`${API_URL}/productos/estadisticas/`);
      const data = await response.json();
      tests.push({
        name: '📊 Estadísticas',
        status: response.ok && data.total_productos !== undefined ? 'success' : 'error',
        detail: `${data.total_productos || 0} productos, ${data.movimientos_hoy || 0} movimientos hoy`,
        ok: response.ok
      });
    } catch (error) {
      tests.push({
        name: '📊 Estadísticas',
        status: 'error',
        detail: error.message,
        ok: false
      });
    }

    // Test 3: Verificar alertas
    try {
      const response = await fetch(`${API_URL}/alertas/`);
      const data = await response.json();
      tests.push({
        name: '🚨 Sistema de Alertas',
        status: response.ok ? 'success' : 'error',
        detail: `${data.count || 0} alertas activas`,
        ok: response.ok
      });
    } catch (error) {
      tests.push({
        name: '🚨 Sistema de Alertas',
        status: 'error',
        detail: error.message,
        ok: false
      });
    }

    // Test 4: Verificar movimientos
    try {
      const response = await fetch(`${API_URL}/movimientos/?page_size=1`);
      const data = await response.json();
      tests.push({
        name: '📝 Registro de Movimientos',
        status: response.ok ? 'success' : 'error',
        detail: `${data.count || 0} movimientos totales`,
        ok: response.ok
      });
    } catch (error) {
      tests.push({
        name: '📝 Registro de Movimientos',
        status: 'error',
        detail: error.message,
        ok: false
      });
    }

    // Test 5: Crear producto de prueba
    try {
      const testProduct = {
        nombre: 'Producto Test ' + Date.now(),
        marca: 'TestBrand',
        modelo: 'T-' + Math.floor(Math.random() * 1000),
        categoria: 'Otro',
        stock: 10,
        precio: 1000,
        descripcion: 'Producto de prueba automática',
        codigo_barras: 'TEST' + Date.now()
      };

      const response = await fetch(`${API_URL}/productos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProduct)
      });

      const data = await response.json();
      
      tests.push({
        name: '➕ Crear Producto',
        status: response.ok ? 'success' : 'error',
        detail: response.ok ? `ID: ${data.id} creado` : (data.detail || data.nombre?.[0] || 'Error al crear'),
        ok: response.ok
      });

      // Test 6: Actualizar producto de prueba
      if (response.ok && data.id) {
        try {
          const updateResponse = await fetch(`${API_URL}/productos/${data.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: 20 })
          });

          tests.push({
            name: '✏️ Actualizar Producto',
            status: updateResponse.ok ? 'success' : 'error',
            detail: updateResponse.ok ? 'Stock actualizado 10→20' : 'Error al actualizar',
            ok: updateResponse.ok
          });
        } catch (error) {
          tests.push({
            name: '✏️ Actualizar Producto',
            status: 'error',
            detail: error.message,
            ok: false
          });
        }

        // Test 7: Eliminar producto de prueba
        try {
          const deleteResponse = await fetch(`${API_URL}/productos/${data.id}/`, {
            method: 'DELETE'
          });

          tests.push({
            name: '🗑️ Eliminar Producto',
            status: deleteResponse.ok ? 'success' : 'error',
            detail: deleteResponse.ok ? 'Producto eliminado' : 'Error al eliminar',
            ok: deleteResponse.ok
          });
        } catch (error) {
          tests.push({
            name: '🗑️ Eliminar Producto',
            status: 'error',
            detail: error.message,
            ok: false
          });
        }
      }
    } catch (error) {
      tests.push({
        name: '➕ Crear Producto',
        status: 'error',
        detail: error.message,
        ok: false
      });
    }

    // Test 8: Verificar endpoints de dashboard
    try {
      const response = await fetch(`${API_URL}/productos/metricas_dashboard/`);
      const data = await response.json();
      tests.push({
        name: '📈 Métricas Dashboard',
        status: response.ok ? 'success' : 'error',
        detail: response.ok ? `${data.productos_criticos || 0} productos críticos` : 'Error',
        ok: response.ok
      });
    } catch (error) {
      tests.push({
        name: '📈 Métricas Dashboard',
        status: 'error',
        detail: error.message,
        ok: false
      });
    }

    setTestResults(tests);
    setLoading(false);

    const passed = tests.filter(t => t.ok).length;
    const total = tests.length;
    
    setMessage({
      type: passed === total ? 'success' : 'warning',
      text: `Pruebas completadas: ${passed}/${total} exitosas`
    });
  };

  const testQuickActions = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Verificar que existan productos
      const productosRes = await fetch(`${import.meta.env.VITE_API_URL}/productos/?page_size=1`);
      const productosData = await productosRes.json();

      if (!productosData.results || productosData.results.length === 0) {
        setMessage({
          type: 'warning',
          text: 'No hay productos. Primero inserta datos de ejemplo.'
        });
        setLoading(false);
        return;
      }

      const producto = productosData.results[0];
      const stockInicial = producto.stock;

      // Test entrada
      const entradaRes = await fetch(
        `${import.meta.env.VITE_API_URL}/productos/${producto.id}/registrar_entrada/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cantidad: 5, observaciones: 'Test entrada automática' })
        }
      );

      const entradaData = await entradaRes.json();

      // Test salida
      const salidaRes = await fetch(
        `${import.meta.env.VITE_API_URL}/productos/${producto.id}/registrar_salida/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cantidad: 3, observaciones: 'Test salida automática' })
        }
      );

      const salidaData = await salidaRes.json();

      if (entradaRes.ok && salidaRes.ok) {
        setMessage({
          type: 'success',
          text: `✅ Movimientos OK: ${producto.nombre} | Stock: ${stockInicial}→${stockInicial + 5}→${stockInicial + 2}`
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Error en pruebas de movimientos'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page dev-tools-page">
      <h1>🔧 Herramientas de Desarrollo</h1>
      <p className="subtitle">Pruebas y utilidades para demostración del sistema</p>

      <div className="dev-tools-container">
        <div className="tool-card">
          <h2>🎬 Pruebas de Integración</h2>
          <p>Ejecuta 8 pruebas automáticas para verificar todos los endpoints de la API</p>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={runIntegrationTests}
            disabled={loading}
          >
            {loading ? '🔄 Ejecutando...' : '▶️ Ejecutar Pruebas'}
          </button>

          {testResults.length > 0 && (
            <div className="test-results">
              {testResults.map((test, index) => (
                <div key={index} className={`test-result ${test.status}`}>
                  <span className="test-name">{test.name}</span>
                  <span className="test-detail">{test.detail}</span>
                  <span className="test-icon">
                    {test.ok ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tool-card">
          <h2>⚡ Prueba Rápida de Movimientos</h2>
          <p>Prueba registrar entrada (+5) y salida (-3) en el primer producto disponible</p>
          <button 
            className="btn btn-info btn-lg" 
            onClick={testQuickActions}
            disabled={loading}
          >
            {loading ? '🔄 Procesando...' : '🎯 Probar Movimientos'}
          </button>
        </div>

        <div className="tool-card">
          <h2>🎲 Insertar Datos de Ejemplo</h2>
          <p>Borra los datos actuales e inserta productos de ejemplo (impresoras, tóners, tintas, papel) con alertas y movimientos</p>
          <button 
            className="btn btn-success btn-lg" 
            onClick={populateDatabase}
            disabled={loading}
          >
            {loading ? '🔄 Procesando...' : '➕ Insertar Datos'}
          </button>
        </div>

        <div className="tool-card warning-card">
          <h2>🗑️ Limpiar Base de Datos</h2>
          <p>⚠️ Elimina todos los productos, movimientos y alertas de la base de datos</p>
          <button 
            className="btn btn-danger btn-lg" 
            onClick={resetDatabase}
            disabled={loading}
          >
            {loading ? '🔄 Procesando...' : '⚠️ Borrar Todo'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`dev-message ${message.type}`}>
          {message.type === 'success' ? '✅ ' : message.type === 'warning' ? '⚠️ ' : '❌ '}{message.text}
        </div>
      )}
    </div>
  );
}

export default DevTools;
