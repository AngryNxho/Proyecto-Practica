import { useEffect, useState } from 'react';
import { productService, movimientoService, alertService } from '../services/inventoryService';
import './Dashboard.css';

function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({
    total_productos: 0,
    stock_critico: 0,
    stock_bajo: 0,
    stock_normal: 0,
    valor_inventario: 0,
    por_categoria: {}
  });
  const [movimientosRecientes, setMovimientosRecientes] = useState([]);
  const [alertasActivas, setAlertasActivas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      const [estadisticasRes, movimientosRes, alertasRes] = await Promise.all([
        productService.obtenerEstadisticas(),
        movimientoService.buscar({ page_size: 5, ordering: '-fecha' }),
        alertService.buscar({ activa: true })
      ]);

      setEstadisticas(estadisticasRes.data);
      setMovimientosRecientes(movimientosRes.data.results || movimientosRes.data || []);
      setAlertasActivas(alertasRes.data.results || alertasRes.data || []);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(valor);
  };

  if (cargando) {
    return (
      <div className="page animate-fade-in">
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '16px', color: '#71717a' }}>⏳ Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Resumen general del inventario y actividad reciente
        </p>
      </header>

      {/* Estadísticas principales */}
      <div className="dashboard-stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <p className="stat-value">{estadisticas.total_productos}</p>
            <p className="stat-label">Productos totales</p>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <p className="stat-value">{estadisticas.stock_critico}</p>
            <p className="stat-label">Stock crítico (≤5)</p>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <p className="stat-value">{estadisticas.stock_bajo}</p>
            <p className="stat-label">Stock bajo (6-10)</p>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-value">{estadisticas.stock_normal}</p>
            <p className="stat-label">Stock normal (&gt;10)</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-value" style={{ fontSize: '24px' }}>
              {formatearMoneda(estadisticas.valor_inventario)}
            </p>
            <p className="stat-label">Valor del inventario</p>
          </div>
        </div>

        <div className="stat-card stat-card-alert">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <p className="stat-value">{alertasActivas.length}</p>
            <p className="stat-label">Alertas activas</p>
          </div>
        </div>
      </div>

      {/* Productos por categoría */}
      {Object.keys(estadisticas.por_categoria || {}).length > 0 && (
        <div className="panel" style={{ marginTop: '24px' }}>
          <h2 className="section-title">Productos por categoría</h2>
          <div className="categoria-grid">
            {Object.entries(estadisticas.por_categoria).map(([categoria, datos]) => (
              <div key={categoria} className="categoria-card">
                <div className="categoria-nombre">{categoria}</div>
                <div className="categoria-stats">
                  <div>
                    <span className="categoria-label">Productos:</span>
                    <span className="categoria-value">{datos.cantidad}</span>
                  </div>
                  <div>
                    <span className="categoria-label">Stock total:</span>
                    <span className="categoria-value">{datos.stock_total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de contenido */}
      <div className="dashboard-content-grid">
        {/* Movimientos recientes */}
        <div className="panel">
          <h2 className="section-title">Movimientos recientes</h2>
          {movimientosRecientes.length > 0 ? (
            <div className="movimientos-lista">
              {movimientosRecientes.map((mov) => (
                <div key={mov.id} className="movimiento-item">
                  <div className="movimiento-icon">
                    {mov.tipo_movimiento === 'entrada' ? '📥' : '📤'}
                  </div>
                  <div className="movimiento-info">
                    <div className="movimiento-producto">{mov.producto_nombre}</div>
                    <div className="movimiento-descripcion">{mov.descripcion}</div>
                    <div className="movimiento-fecha">{formatearFecha(mov.fecha)}</div>
                  </div>
                  <div className={`movimiento-cantidad ${mov.tipo_movimiento}`}>
                    {mov.tipo_movimiento === 'entrada' ? '+' : '-'}{mov.cantidad}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No hay movimientos registrados</p>
          )}
        </div>

        {/* Alertas activas */}
        <div className="panel">
          <h2 className="section-title">Alertas activas</h2>
          {alertasActivas.length > 0 ? (
            <div className="alertas-lista">
              {alertasActivas.map((alerta) => (
                <div key={alerta.id} className="alerta-item">
                  <div className="alerta-icon">🚨</div>
                  <div className="alerta-info">
                    <div className="alerta-producto">{alerta.producto_nombre}</div>
                    <div className="alerta-mensaje">{alerta.mensaje}</div>
                    <div className="alerta-fecha">{formatearFecha(alerta.fecha_creacion)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">✅ No hay alertas activas</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
