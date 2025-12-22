import { useState, useEffect } from 'react';
import { productService, movementService } from '../services/inventoryService';
import GraficoBarras from '../components/graficos/GraficoBarras';
import GraficoLinea from '../components/graficos/GraficoLinea';
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
              <div className="graficos-grid">
                <GraficoBarras 
                  datos={productosPorCategoria}
                  titulo="Productos por Categoría"
                />
                <GraficoBarras 
                  datos={stockPorCategoria}
                  titulo="Stock por Categoría"
                />
              </div>

              <div className="graficos-grid">
                <GraficoDona 
                  datos={valorPorCategoria}
                  titulo="Distribución de Valor por Categoría"
                />
              </div>
            </>
          )}

          {/* Vista Movimientos */}
          {tipoReporte === 'movimientos' && (
            <>
              <div className="graficos-grid">
                <GraficoBarras 
                  datos={datosGraficoTipo}
                  titulo="Movimientos por Tipo"
                />
                <GraficoLinea 
                  datos={movimientosPorDia}
                  titulo="Tendencia de Movimientos"
                  color="#3b82f6"
                />
              </div>

              {topProductos.length > 0 && (
                <div className="graficos-grid">
                  <GraficoBarras 
                    datos={topProductos}
                    titulo="Top 10 Productos Más Movidos"
                    colorPrimario="#8b5cf6"
                    colorSecundario="#ec4899"
                  />
                </div>
              )}
            </>
          )}

          {/* Vista Inventario */}
          {tipoReporte === 'inventario' && (
            <>
              <div className="graficos-grid">
                <GraficoBarras 
                  datos={stockPorCategoria}
                  titulo="Distribución de Stock"
                />
                <GraficoBarras 
                  datos={productosPorCategoria}
                  titulo="Cantidad de Productos"
                  colorPrimario="#10b981"
                  colorSecundario="#06b6d4"
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
                  titulo="Valor por Categoría"
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
