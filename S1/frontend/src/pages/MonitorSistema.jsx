import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './MonitorSistema.css';

function MonitorSistema() {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const cargarEstado = async () => {
    try {
      setCargando(true);
      const respuesta = await api.get('/estado/');
      setEstado(respuesta.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el estado del sistema');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstado();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const intervalo = setInterval(cargarEstado, 5000);
      return () => clearInterval(intervalo);
    }
  }, [autoRefresh]);

  const formatearFecha = (marcaTiempo) => {
    return new Date(marcaTiempo * 1000).toLocaleString('es-CL');
  };

  const obtenerColorEstado = (estado) => {
    switch(estado) {
      case 'ok': return 'verde';
      case 'degradado': return 'amarillo';
      case 'error': return 'rojo';
      default: return 'gris';
    }
  };

  if (cargando && !estado) {
    return (
      <div className="monitor-page">
        <p>Cargando estado del sistema...</p>
      </div>
    );
  }

  if (error && !estado) {
    return (
      <div className="monitor-page">
        <p className="error">{error}</p>
        <button onClick={cargarEstado}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="monitor-page">
      <header className="monitor-header">
        <h1>Monitor del Sistema</h1>
        <div className="monitor-controles">
          <label>
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (5s)
          </label>
          <button onClick={cargarEstado} disabled={cargando}>
            {cargando ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </header>

      {estado && (
        <>
          <section className="monitor-resumen">
            <div className={`estado-badge ${obtenerColorEstado(estado.estado)}`}>
              {estado.estado.toUpperCase()}
            </div>
            <div className="metrica">
              <span>Última actualización:</span>
              <strong>{formatearFecha(estado.marca_tiempo)}</strong>
            </div>
            <div className="metrica">
              <span>Tiempo de respuesta:</span>
              <strong>{estado.tiempo_respuesta_ms} ms</strong>
            </div>
          </section>

          <section className="monitor-grid">
            <div className="monitor-card">
              <h3>Componentes</h3>
              <div className="componente-lista">
                <div className="componente">
                  <span>Base de datos</span>
                  <span className={`estado-componente ${estado.salud.base_datos.status}`}>
                    {estado.salud.base_datos.status}
                  </span>
                </div>
                <div className="componente">
                  <span>Cache</span>
                  <span className={`estado-componente ${estado.salud.cache.status}`}>
                    {estado.salud.cache.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="monitor-card">
              <h3>Sistema</h3>
              {estado.sistema?.cpu && (
                <>
                  <div className="metrica-item">
                    <span>CPU:</span>
                    <strong>{estado.sistema.cpu.porcentaje_uso}%</strong>
                    <small>({estado.sistema.cpu.nucleos} núcleos)</small>
                  </div>
                  <div className="metrica-item">
                    <span>Memoria:</span>
                    <strong>{estado.sistema.memoria.porcentaje_uso}%</strong>
                    <small>
                      {estado.sistema.memoria.disponible_mb} MB disponible / {estado.sistema.memoria.total_mb} MB
                    </small>
                  </div>
                  <div className="metrica-item">
                    <span>Disco:</span>
                    <strong>{estado.sistema.disco.porcentaje_uso}%</strong>
                    <small>
                      {estado.sistema.disco.libre_gb} GB libre / {estado.sistema.disco.total_gb} GB
                    </small>
                  </div>
                </>
              )}
            </div>

            <div className="monitor-card">
              <h3>Aplicación</h3>
              {estado.aplicacion?.base_datos && (
                <>
                  <div className="metrica-item">
                    <span>Productos:</span>
                    <strong>{estado.aplicacion.base_datos.productos}</strong>
                  </div>
                  <div className="metrica-item">
                    <span>Movimientos:</span>
                    <strong>{estado.aplicacion.base_datos.movimientos}</strong>
                  </div>
                  <div className="metrica-item">
                    <span>Alertas activas:</span>
                    <strong>{estado.aplicacion.base_datos.alertas_activas}</strong>
                  </div>
                  <div className="metrica-item">
                    <span>BD:</span>
                    <strong>{estado.aplicacion.configuracion.base_datos}</strong>
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default MonitorSistema;
