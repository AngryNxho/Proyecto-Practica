import { useEffect, useState } from 'react';
import { productService, movementService, alertService } from '../services/inventoryService';
import { formatCurrency, formatDateTime } from '../utils/utils';
import './Tablero.css';

function Tablero() {
  const [datos, setDatos] = useState({ productos: [], movimientos: [], alertas: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [productosRes, movimientosRes, alertasRes] = await Promise.all([
        productService.obtenerTodos(),
        movementService.obtenerTodos(),
        alertService.obtenerTodos(),
      ]);
      setDatos({
        productos: productosRes.data.results || productosRes.data || [],
        movimientos: movimientosRes.data.results || movimientosRes.data || [],
        alertas: alertasRes.data.results || alertasRes.data || [],
      });
      setError(null);
    } catch (err) {
      console.error('Error al cargar tablero:', err);
      setDatos({ productos: [], movimientos: [], alertas: [] });
      setError(null);
    } finally {
      setCargando(false);
    }
  };

  const stockTotal = datos.productos.reduce((acc, producto) => acc + (producto.stock || 0), 0);
  const valorTotal = datos.productos.reduce(
    (acc, producto) => acc + (Number(producto.precio) || 0) * (producto.stock || 0),
    0
  );
  const alertasActivas = datos.alertas.filter((alerta) => alerta.activa).length;
  const productosRegistrados = datos.productos.length;
  const stockCritico = datos.productos.filter(p => p.stock <= 5).length;
  const stockBajo = datos.productos.filter(p => p.stock > 5 && p.stock <= 10).length;
  const recientes = datos.movimientos.slice(0, 5);

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
          <strong>{cargando ? '...' : productosRegistrados}</strong>
          <span>Catálogo total</span>
        </div>
        <div className="data-card stagger-item" style={{ background: 'linear-gradient(135deg, #08aeea, #2af598)' }}>
          <h3>Stock acumulado</h3>
          <strong>{cargando ? '...' : stockTotal}</strong>
          <span>Unidades disponibles</span>
        </div>
        <div className="data-card stagger-item" style={{ background: 'linear-gradient(135deg, #f7971e, #ffd200)' }}>
          <h3>Valor estimado</h3>
          <strong>{cargando ? '...' : formatCurrency(valorTotal)}</strong>
          <span>En base a stock actual</span>
        </div>
        <div className="data-card stagger-item" style={{ background: 'linear-gradient(135deg, #ff5f6d, #ffc371)' }}>
          <h3>Alertas activas</h3>
          <strong>{cargando ? '...' : alertasActivas}</strong>
          <span>Productos críticos</span>
        </div>
      </section>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Análisis de inventario</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <p style={{ fontSize: '14px', color: '#991b1b', marginBottom: '4px', fontWeight: '500' }}>Stock crítico</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{cargando ? '...' : stockCritico}</p>
            <p style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>≤5 unidades</p>
          </div>
          <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px', fontWeight: '500' }}>Stock bajo</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>{cargando ? '...' : stockBajo}</p>
            <p style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>6-10 unidades</p>
          </div>
          <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: '14px', color: '#14532d', marginBottom: '4px', fontWeight: '500' }}>Stock normal</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
              {cargando ? '...' : productosRegistrados - stockCritico - stockBajo}
            </p>
            <p style={{ fontSize: '12px', color: '#14532d', marginTop: '4px' }}>&gt;10 unidades</p>
          </div>
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
              {datos.alertas
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
