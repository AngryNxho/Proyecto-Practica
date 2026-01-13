import { useState, useEffect } from 'react';
import { productService, movementService } from '../services/inventoryService';
import GraficoDona from '../components/graficos/GraficoDona';
import { formatCurrency } from '../utils/utils';
import './Reportes.css';

function Reportes() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Filtros
  const [fechaInicio, setFechaInicio] = useState(() => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30);
    return fecha.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [tipoReporte, setTipoReporte] = useState('general');

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000); // actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [prodRes, movRes] = await Promise.all([
        productService.obtenerTodos(),
        movementService.obtenerTodos()
      ]);
      setProductos(prodRes.data.results || prodRes.data || []);
      setMovimientos(movRes.data.results || movRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const exportarReporte = () => {
    const params = {
      categoria: categoriaSeleccionada,
      fecha_desde: fechaInicio,
      fecha_hasta: fechaFin
    };
    const url = productService.exportarReporte(params);
    window.open(url, '_blank');
  };

  // Filtrar movimientos por fecha
  const movimientosFiltrados = movimientos.filter(mov => {
    const fechaMov = new Date(mov.fecha).toISOString().split('T')[0];
    return fechaMov >= fechaInicio && fechaMov <= fechaFin;
  });

  // Filtrar productos por categoría
  const productosFiltrados = categoriaSeleccionada === 'todas' 
    ? productos 
    : productos.filter(p => p.categoria === categoriaSeleccionada);

  // Categorías únicas
  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];

  // Datos para gráfico de movimientos por tipo
  const movimientosPorTipo = {
    entradas: movimientosFiltrados.filter(m => m.tipo === 'ENTRADA').length,
    salidas: movimientosFiltrados.filter(m => m.tipo === 'SALIDA').length
  };

  const datosGraficoTipo = [
    { label: 'Entradas', valor: movimientosPorTipo.entradas, color: '#10b981' },
    { label: 'Salidas', valor: movimientosPorTipo.salidas, color: '#ef4444' }
  ];

  // Datos para gráfico de productos por categoría
  const productosPorCategoria = categorias.map(cat => ({
    label: cat,
    valor: productos.filter(p => p.categoria === cat).length
  }));

  // Datos para gráfico de stock por categoría
  const stockPorCategoria = categorias.map((cat, index) => {
    const colores = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
    return {
      label: cat,
      valor: productos.filter(p => p.categoria === cat).reduce((sum, p) => sum + p.stock, 0),
      color: colores[index % colores.length]
    };
  });

  // Datos para gráfico de valor por categoría (dona)
  const valorPorCategoria = categorias.map((cat, index) => {
    const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const productosCategoria = productos.filter(p => p.categoria === cat);
    const valor = productosCategoria.reduce((sum, p) => sum + (p.precio * p.stock), 0);
    return {
      nombre: cat,
      label: cat,
      valor: Math.round(valor),
      color: colores[index % colores.length]
    };
  }).filter(item => item.valor > 0);

  // Movimientos por día (últimos 7 días del rango)
  const diasRango = [];
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diasDiff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
  const diasMostrar = Math.min(diasDiff + 1, 14);
  
  for (let i = 0; i < diasMostrar; i++) {
    const fecha = new Date(fin);
    fecha.setDate(fecha.getDate() - (diasMostrar - 1 - i));
    diasRango.push(fecha);
  }

  const movimientosPorDia = diasRango.map(fecha => {
    const fechaStr = fecha.toISOString().split('T')[0];
    const movsDelDia = movimientosFiltrados.filter(m => 
      new Date(m.fecha).toISOString().split('T')[0] === fechaStr
    );
    return {
      label: fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }),
      valor: movsDelDia.length
    };
  });

  // Productos más movidos en el rango
  const contadorMovimientos = {};
  movimientosFiltrados.forEach(m => {
    contadorMovimientos[m.producto] = (contadorMovimientos[m.producto] || 0) + 1;
  });
  
  const topProductos = Object.entries(contadorMovimientos)
    .map(([id, cantidad]) => {
      const producto = productos.find(p => p.id === parseInt(id));
      return {
        label: producto?.nombre || 'Desconocido',
        valor: cantidad
      };
    })
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);

  // Estadísticas generales
  const totalProductos = productosFiltrados.length;
  const stockTotal = productosFiltrados.reduce((sum, p) => sum + p.stock, 0);
  const valorTotal = productosFiltrados.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  const movimientosTotales = movimientosFiltrados.length;

  return (
    <div className="page reportes">
      <header className="page-header">
        <div>
          <h1 className="page-title">📈 Reportes y Análisis</h1>
          <p className="page-description">
            Visualiza métricas y tendencias con filtros personalizados
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={exportarReporte}
          disabled={cargando}
        >
          📄 Exportar Reporte CSV
        </button>
      </header>

      {/* Panel de filtros */}
      <section className="panel filtros-panel">
        <h2 className="section-title">Filtros</h2>
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label htmlFor="fecha-inicio">Fecha inicio</label>
            <input
              id="fecha-inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              max={fechaFin}
              className="input"
            />
          </div>
          
          <div className="filtro-grupo">
            <label htmlFor="fecha-fin">Fecha fin</label>
            <input
              id="fecha-fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              min={fechaInicio}
              max={new Date().toISOString().split('T')[0]}
              className="input"
            />
          </div>

          <div className="filtro-grupo">
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="input"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="tipo-reporte">Tipo de reporte</label>
            <select
              id="tipo-reporte"
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="input"
            >
              <option value="general">Vista general</option>
              <option value="movimientos">Movimientos</option>
              <option value="inventario">Inventario</option>
              <option value="financiero">Financiero</option>
            </select>
          </div>
        </div>
      </section>

      {/* Tarjetas de resumen */}
      <section className="stats-cards">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <span className="stat-label">Productos</span>
          <strong className="stat-value">{totalProductos}</strong>
          <span className="stat-sublabel">En categoría seleccionada</span>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <span className="stat-label">Stock Total</span>
          <strong className="stat-value">{stockTotal}</strong>
          <span className="stat-sublabel">Unidades disponibles</span>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <span className="stat-label">Valor Inventario</span>
          <strong className="stat-value">{formatCurrency(valorTotal)}</strong>
          <span className="stat-sublabel">Filtrado</span>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <span className="stat-label">Movimientos</span>
          <strong className="stat-value">{movimientosTotales}</strong>
          <span className="stat-sublabel">En rango de fechas</span>
        </div>
      </section>

      {cargando ? (
        <div className="panel">
          <p>Cargando reportes...</p>
        </div>
      ) : (
        <>
          {/* Vista General */}
          {tipoReporte === 'general' && (
            <>
              {/* Gráficos de Torta - Principales */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#2c3e50' }}>
                  🎨 Distribución Visual
                </h2>
                <div className="graficos-grid">
                  <GraficoDona 
                    datos={productosPorCategoria.map((cat, index) => ({
                      nombre: cat.label,
                      valor: cat.valor,
                      color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#14b8a6'][index % 8]
                    }))}
                    titulo="📦 Productos por Categoría"
                    tamano={260}
                    grosor={50}
                  />
                  <GraficoDona 
                    datos={stockPorCategoria.map(cat => ({
                      nombre: cat.label,
                      valor: cat.valor,
                      color: cat.color
                    }))}
                    titulo="📊 Stock por Categoría"
                    tamano={260}
                    grosor={50}
                  />
                  <GraficoDona 
                    datos={valorPorCategoria}
                    titulo="💰 Valor por Categoría"
                    tamano={260}
                    grosor={50}
                  />
                </div>
              </div>

              {/* Gráficos de Donas - Detalles */}
              <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', marginTop: '24px', color: '#2c3e50' }}>
                📊 Análisis Detallado
              </h2>
              <div className="graficos-grid">
                <GraficoDona 
                  datos={productosPorCategoria.map((cat, index) => ({
                    nombre: cat.label,
                    valor: cat.valor,
                    color: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6', '#f97316', '#a855f7'][index % 10]
                  }))}
                  titulo="📦 Productos por Categoría (Detalle)"
                  tamano={240}
                  grosor={45}
                />
                <GraficoDona 
                  datos={stockPorCategoria.map(cat => ({
                    nombre: cat.label,
                    valor: cat.valor,
                    color: cat.color
                  }))}
                  titulo="📊 Stock por Categoría (Detalle)"
                  tamano={240}
                  grosor={45}
                />
              </div>
            </>
          )}

          {/* Vista Movimientos */}
          {tipoReporte === 'movimientos' && (
            <>
              {/* Gráficos de Donas para Movimientos */}
              <div className="graficos-grid">
                <GraficoDona 
                  datos={datosGraficoTipo.map(item => ({
                    nombre: item.label,
                    valor: item.valor,
                    color: item.color
                  }))}
                  titulo="📝 Movimientos por Tipo"
                  tamano={240}
                  grosor={45}
                />
                {topProductos.length > 0 && (
                  <GraficoDona 
                    datos={topProductos.slice(0, 8).map((item, index) => ({
                      nombre: item.label.length > 20 ? item.label.substring(0, 20) + '...' : item.label,
                      valor: item.valor,
                      color: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#14b8a6'][index % 8]
                    }))}
                    titulo="🔝 Top 8 Productos Más Movidos"
                    tamano={240}
                    grosor={45}
                  />
                )}
              </div>
            </>
          )}

          {/* Vista Inventario */}
          {tipoReporte === 'inventario' && (
            <>
              {/* Gráficos de Torta para Inventario */}
              <div className="graficos-grid">
                <GraficoDona 
                  datos={stockPorCategoria.map(cat => ({
                    nombre: cat.label,
                    valor: cat.valor,
                    color: cat.color
                  }))}
                  titulo="📊 Distribución de Stock"
                  tamano={240}
                  grosor={45}
                />
                <GraficoDona 
                  datos={productosPorCategoria.map((cat, index) => ({
                    nombre: cat.label,
                    valor: cat.valor,
                    color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6'][index % 6]
                  }))}
                  titulo="📦 Cantidad de Productos"
                  tamano={240}
                  grosor={45}
                />
              </div>

              {/* Gráficos de Donas - Detalles */}
              <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', marginTop: '24px', color: '#2c3e50' }}>
                📊 Análisis Detallado
              </h2>
              <div className="graficos-grid">
                <GraficoDona 
                  datos={stockPorCategoria.map(cat => ({
                    nombre: cat.label,
                    valor: cat.valor,
                    color: cat.color
                  }))}
                  titulo="📊 Stock por Categoría (Detalle)"
                  tamano={240}
                  grosor={45}
                />
                <GraficoDona 
                  datos={productosPorCategoria.map((cat, index) => ({
                    nombre: cat.label,
                    valor: cat.valor,
                    color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#14b8a6'][index % 8]
                  }))}
                  titulo="📦 Productos por Categoría (Detalle)"
                  tamano={240}
                  grosor={45}
                />
              </div>
            </>
          )}

          {/* Vista Financiero */}
          {tipoReporte === 'financiero' && (
            <>
              <div className="graficos-grid">
                <GraficoDona 
                  datos={valorPorCategoria}
                  titulo="💰 Valor del Inventario por Categoría"
                  tamano={260}
                  grosor={50}
                />
                <GraficoDona 
                  datos={productosPorCategoria.map((cat, index) => ({
                    nombre: cat.label,
                    valor: cat.valor,
                    color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][index % 6]
                  }))}
                  titulo="📦 Distribución de Productos"
                  tamano={260}
                  grosor={50}
                />
              </div>

              {/* Detalles financieros */}
              <div className="graficos-grid">
                <GraficoDona 
                  datos={valorPorCategoria}
                  titulo="💰 Valor por Categoría (Detalle en CLP)"
                  tamano={260}
                  grosor={50}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Reportes;
