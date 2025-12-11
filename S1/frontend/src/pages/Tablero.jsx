import { useEffect, useState } from 'react';
import { productService, movementService, alertService } from '../services/inventoryService';
import { formatCurrency, formatDateTime } from '../utils/utils';
import './Tablero.css';

function Tablero() {
  const [metricas, setMetricas] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 60000); // actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [metricasRes, movimientosRes, alertasRes] = await Promise.all([
        productService.obtenerMetricasDashboard(),
        movementService.obtenerTodos(),
        alertService.obtenerTodos(),
      ]);
      
      setMetricas(metricasRes.data);
      setMovimientos(movimientosRes.data.results || movimientosRes.data || []);
      setAlertas(alertasRes.data.results || alertasRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar tablero:', err);
      setError('Error al cargar datos del dashboard');
    } finally {
      setCargando(false);
    }
  };

  if (!metricas) {
    return <div className="page tablero"><p>Cargando dashboard...</p></div>;
  }

  const { resumen, stock, actividad_hoy, productos_mas_movidos, top_categorias, top_valor_categoria, precio_stats, movimientos_semana } = metricas;
  const recientes = movimientos.slice(0, 5);
  const alertasActivas = alertas.filter(a => a.activa).length;

  return (
    <div className="page tablero">
      <header className="page-header animate-fade-in">
        <h1 className="page-title">Dashboard operativo</h1>
        <p className="page-description">
          Estado general del inventario y últimas actividades. Actualizado cada vez que entras.
        </p>
      </header>

      {error && <div className="panel error-state">{error}</div>}

      <section className="cards-grid">
        <div className="data-card stagger-item" style={{ background: 'linear-gradient(135deg, #4f3df8, #7a72ff)' }}>
          <h3>Productos registrados</h3>
          <strong>{cargando ? '...' : resumen.total_productos}</strong>
          <span>Catálogo total</span>
        </div>
        <div className="data-card stagger-item" style={{ background: 'linear-gradient(135deg, #08aeea, #2af598)' }}>
          <h3>Stock acumulado</h3>
          <strong>{cargando ? '...' : resumen.stock_total}</strong>
          <span>Unidades disponibles</span>
        </div>
        <div className="data-card stagger-item" style={{ background: 'linear-gradient(135deg, #f7971e, #ffd200)' }}>
          <h3>Valor estimado</h3>
          <strong>{cargando ? '...' : formatCurrency(resumen.valor_total)}</strong>
          <span>En base a stock actual</span>
        </div>
        <div className="data-card stagger-item" style={{ background: 'linear-gradient(135deg, #ff5f6d, #ffc371)' }}>
          <h3>Alertas activas</h3>
          <strong>{cargando ? '...' : resumen.alertas_activas}</strong>
          <span>Productos críticos</span>
        </div>
      </section>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Análisis de inventario</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <p style={{ fontSize: '14px', color: '#991b1b', marginBottom: '4px', fontWeight: '500' }}>Stock crítico</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{cargando ? '...' : stock.critico}</p>
            <p style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>≤5 unidades</p>
          </div>
          <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px', fontWeight: '500' }}>Stock bajo</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>{cargando ? '...' : stock.bajo}</p>
            <p style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>6-10 unidades</p>
          </div>
          <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: '14px', color: '#14532d', marginBottom: '4px', fontWeight: '500' }}>Stock normal</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{cargando ? '...' : stock.normal}</p>
            <p style={{ fontSize: '12px', color: '#14532d', marginTop: '4px' }}>&gt;10 unidades</p>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Actividad del día</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '8px', fontWeight: '500' }}>Entradas</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', margin: '0' }}>{actividad_hoy.entradas}</p>
          </div>
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#991b1b', marginBottom: '8px', fontWeight: '500' }}>Salidas</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', margin: '0' }}>{actividad_hoy.salidas}</p>
          </div>
          <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#075985', marginBottom: '8px', fontWeight: '500' }}>Total movimientos</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#0284c7', margin: '0' }}>{actividad_hoy.total}</p>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Categorías principales</h2>
        {top_categorias.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {top_categorias.map((item, index) => {
              const porcentaje = ((item.cantidad / resumen.total_productos) * 100).toFixed(1);
              const colores = ['#3b82f6', '#8b5cf6', '#ec4899'];
              return (
                <div key={item.categoria} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '120px', fontSize: '14px', fontWeight: '500', color: '#52525b' }}>
                    {item.categoria}
                  </div>
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${porcentaje}%`, 
                      height: '100%', 
                      background: colores[index], 
                      borderRadius: '8px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <div style={{ width: '80px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: colores[index] }}>
                    {item.cantidad} ({porcentaje}%)
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">No hay categorías registradas</div>
        )}
      </section>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Productos más movidos</h2>
        {productos_mas_movidos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {productos_mas_movidos.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fafbff', borderRadius: '8px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#fb923c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                  {item.producto__nombre}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>
                  {item.total_movimientos} movimientos
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No hay movimientos registrados</div>
        )}
      </section>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Valor por categoría</h2>
        {top_valor_categoria.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {top_valor_categoria.map((item, index) => {
              const colores = [
                { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
                { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
                { bg: '#fef3c7', text: '#92400e', border: '#fde047' }
              ];
              const color = colores[index] || colores[0];
              return (
                <div key={item.categoria} style={{ 
                  padding: '16px', 
                  background: color.bg, 
                  borderRadius: '10px', 
                  border: `1px solid ${color.border}`,
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '13px', color: color.text, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                    {item.categoria}
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: color.text, margin: '0' }}>
                    {formatCurrency(item.valor)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">No hay categorías con valor</div>
        )}
      </section>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Estadísticas de precios</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '14px', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#3730a3', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
              Precio Promedio
            </p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#4338ca', margin: '0' }}>
              {formatCurrency(precio_stats.promedio)}
            </p>
          </div>
          <div style={{ padding: '14px', background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#14532d', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
              Precio Mínimo
            </p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#15803d', margin: '0' }}>
              {formatCurrency(precio_stats.minimo)}
            </p>
          </div>
          <div style={{ padding: '14px', background: 'linear-gradient(135deg, #fef3c7, #fde047)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#713f12', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
              Precio Máximo
            </p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#854d0e', margin: '0' }}>
              {formatCurrency(precio_stats.maximo)}
            </p>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Movimientos últimos 7 días</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {movimientos_semana.map((dia, index) => {
            const total = dia.entradas + dia.salidas;
            const maxTotal = Math.max(...movimientos_semana.map(d => d.entradas + d.salidas), 1);
            const porcentaje = (total / maxTotal) * 100;
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '90px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                  {new Date(dia.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, background: '#f1f5f9', borderRadius: '6px', height: '28px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${porcentaje}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', 
                      borderRadius: '6px',
                      transition: 'width 0.5s ease',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '8px'
                    }}>
                      <span style={{ fontSize: '11px', color: 'white', fontWeight: '600' }}>
                        {total > 0 && `${total} mov.`}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ width: '140px', display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '500' }}>
                  <span style={{ color: '#10b981' }}>↑{dia.entradas}</span>
                  <span style={{ color: '#ef4444' }}>↓{dia.salidas}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h2 className="section-title">Últimos movimientos</h2>
            <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando}>
              Actualizar
            </button>
          </div>
          {cargando ? (
            <p>Cargando movimientos...</p>
          ) : recientes.length ? (
            <table className="movimientos-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>{formatDateTime(movimiento.fecha)}</td>
                    <td>{movimiento.producto_nombre}</td>
                    <td>
                      <span className={`status-badge ${movimiento.tipo === 'SALIDA' ? 'critical' : 'ok'}`}>
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td>{movimiento.cantidad} u.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">Sin movimientos registrados.</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="section-title">Alertas activas</h2>
          </div>
          {cargando ? (
            <p>Consultando alertas...</p>
          ) : alertasActivas ? (
            <ul className="alertas-mini-list">
              {alertas
                .filter((alerta) => alerta.activa)
                .map((alerta) => (
                  <li key={alerta.id}>
                    <p>
                      <strong>{alerta.producto_nombre}</strong>
                    </p>
                    <span>Umbral {alerta.umbral} u.</span>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="empty-state">No hay alertas activas.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Tablero;
