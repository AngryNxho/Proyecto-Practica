import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import './LogViewer.css';

function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadLogs();
    
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLogs = () => {
    const allLogs = logger.getLogs();
    setLogs(allLogs);
  };

  const filteredLogs = logs
    .filter(log => filter === 'all' || log.level === filter)
    .filter(log => 
      search === '' || 
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.data).toLowerCase().includes(search.toLowerCase())
    )
    .reverse(); // Más recientes primero

  const summary = logger.getSummary();

  const handleClear = () => {
    if (confirm('¿Limpiar todos los logs?')) {
      logger.clear();
      loadLogs();
    }
  };

  const handleExport = () => {
    logger.export();
  };

  return (
    <div className="page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Visor de Logs</h1>
        <p className="page-description">
          Sistema de registro de actividad interna de la aplicación
        </p>
      </header>

      {/* Resumen */}
      <div className="log-summary">
        <div className="log-stat">
          <span className="log-stat-value">{summary.total}</span>
          <span className="log-stat-label">Total logs</span>
        </div>
        <div className="log-stat">
          <span className="log-stat-value">{summary.byLevel.error || 0}</span>
          <span className="log-stat-label">Errores</span>
        </div>
        <div className="log-stat">
          <span className="log-stat-value">{summary.byLevel.warning || 0}</span>
          <span className="log-stat-label">Advertencias</span>
        </div>
        <div className="log-stat">
          <span className="log-stat-value">{summary.byLevel.success || 0}</span>
          <span className="log-stat-label">Éxitos</span>
        </div>
      </div>

      {/* Controles */}
      <div className="panel">
        <div className="log-controls">
          <div className="log-filters">
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
            />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">Todos los niveles</option>
              <option value="error">Errores</option>
              <option value="warning">Advertencias</option>
              <option value="success">Éxitos</option>
              <option value="info">Información</option>
              <option value="debug">Debug</option>
            </select>

            <label className="log-checkbox">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-actualizar
            </label>
          </div>

          <div className="log-actions">
            <button onClick={loadLogs} className="btn btn-secondary">
              Actualizar
            </button>
            <button onClick={handleExport} className="btn btn-secondary">
              Exportar JSON
            </button>
            <button onClick={handleClear} className="btn btn-danger">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="panel">
        <div className="log-list">
          {filteredLogs.length === 0 ? (
            <div className="empty-state">
              <p>No hay logs que mostrar</p>
              <small>Los logs aparecerán automáticamente cuando se registren eventos</small>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className={`log-entry log-${log.level}`}>
                <div className="log-header">
                  <span className={`log-badge log-badge-${log.level}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleString('es-CL')}
                  </span>
                  <span className="log-url">{log.url}</span>
                </div>
                <div className="log-message">{log.message}</div>
                {log.data && (
                  <details className="log-details">
                    <summary>Ver datos</summary>
                    <pre>{JSON.stringify(log.data, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comandos de consola */}
      <div className="panel">
        <h3>Comandos de consola</h3>
        <p>Abre la consola del navegador (F12) y usa:</p>
        <ul>
          <li><code>logger.info("mensaje", data)</code> - Log de información</li>
          <li><code>logger.error("mensaje", error)</code> - Log de error</li>
          <li><code>logger.warning("mensaje")</code> - Log de advertencia</li>
          <li><code>logger.success("mensaje")</code> - Log de éxito</li>
          <li><code>logger.getLogs()</code> - Obtener todos los logs</li>
          <li><code>logger.getSummary()</code> - Resumen de logs</li>
          <li><code>logger.clear()</code> - Limpiar logs</li>
          <li><code>logger.toggle(true/false)</code> - Habilitar/deshabilitar</li>
        </ul>
      </div>
    </div>
  );
}

export default LogViewer;
