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

  // Calcular categorías más populares
  const categorias = {};
  datos.productos.forEach(p => {
    if (p.categoria) {
      categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
    }
  });
  const topCategorias = Object.entries(categorias)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Estadísticas de movimientos recientes
  const movimientosHoy = datos.movimientos.filter(m => {
    const hoy = new Date();
    const fechaMov = new Date(m.fecha);
    return fechaMov.toDateString() === hoy.toDateString();
  });
  const entradasHoy = movimientosHoy.filter(m => m.tipo === 'ENTRADA').length;
  const salidasHoy = movimientosHoy.filter(m => m.tipo === 'SALIDA').length;

  // Productos más movidos
  const contadorMovimientos = {};
  datos.movimientos.forEach(m => {
    const id = m.producto;
    contadorMovimientos[id] = (contadorMovimientos[id] || 0) + 1;
  });
  const productosMasMovidos = Object.entries(contadorMovimientos)
    .map(([id, cantidad]) => {
      const producto = datos.productos.find(p => p.id === parseInt(id));
      return { nombre: producto?.nombre || 'Desconocido', cantidad };
    })
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  // Valor por categoría
  const valorPorCategoria = {};
  datos.productos.forEach(p => {
    if (p.categoria) {
      const valor = (Number(p.precio) || 0) * (p.stock || 0);
      valorPorCategoria[p.categoria] = (valorPorCategoria[p.categoria] || 0) + valor;
    }
  });
  const topValorCategoria = Object.entries(valorPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

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

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Actividad del día</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '8px', fontWeight: '500' }}>Entradas</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', margin: '0' }}>{entradasHoy}</p>
          </div>
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#991b1b', marginBottom: '8px', fontWeight: '500' }}>Salidas</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', margin: '0' }}>{salidasHoy}</p>
          </div>
          <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#075985', marginBottom: '8px', fontWeight: '500' }}>Total movimientos</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#0284c7', margin: '0' }}>{movimientosHoy.length}</p>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Categorías principales</h2>
        {topCategorias.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topCategorias.map(([categoria, cantidad], index) => {
              const porcentaje = ((cantidad / productosRegistrados) * 100).toFixed(1);
              const colores = ['#3b82f6', '#8b5cf6', '#ec4899'];
              return (
                <div key={categoria} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '120px', fontSize: '14px', fontWeight: '500', color: '#52525b' }}>
                    {categoria}
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
                    {cantidad} ({porcentaje}%)
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
        {productosMasMovidos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {productosMasMovidos.map((item, index) => (
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
                  {item.nombre}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>
                  {item.cantidad} movimientos
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
        {topValorCategoria.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {topValorCategoria.map(([categoria, valor], index) => {
              const colores = [
                { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
                { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
                { bg: '#fef3c7', text: '#92400e', border: '#fde047' }
              ];
              const color = colores[index] || colores[0];
              return (
                <div key={categoria} style={{ 
                  padding: '16px', 
                  background: color.bg, 
                  borderRadius: '10px', 
                  border: `1px solid ${color.border}`,
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '13px', color: color.text, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                    {categoria}
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: color.text, margin: '0' }}>
                    {formatCurrency(valor)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">No hay categorías con valor</div>
        )}
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
