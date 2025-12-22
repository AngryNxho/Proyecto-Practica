import { useEffect, useState } from 'react';
import FormularioMovimiento from '../components/movimientos/FormularioMovimiento';
import ListaMovimientos from '../components/movimientos/ListaMovimientos';
import ModalDetalleMovimiento from '../components/movimientos/ModalDetalleMovimiento';
import { productService, movementService } from '../services/inventoryService';
import './Movimientos.css';
import '../styles/EstadisticasMovimientos.css';

function Movimientos() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('-fecha');
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [itemsPorPagina, setItemsPorPagina] = useState(20);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [productosRes, movimientosRes] = await Promise.all([
        productService.obtenerTodos(),
        movementService.obtenerTodos(),
      ]);
      setProductos(productosRes.data.results || productosRes.data || []);
      setMovimientos(movimientosRes.data.results || movimientosRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar movimientos:', err);
      setMovimientos([]);
      setProductos([]);
      setError(null);
    } finally {
      setCargando(false);
    }
  };

  const movimientosFiltrados = movimientos.filter(m => {
    // Filtro por tipo
    if (filtroTipo && m.tipo !== filtroTipo) return false;
    
    // Filtro por producto
    if (filtroProducto && m.producto !== parseInt(filtroProducto)) return false;
    
    // Filtro por categoría
    if (filtroCategoria) {
      const producto = productos.find(p => p.id === m.producto);
      if (!producto || producto.categoria !== filtroCategoria) return false;
    }
    
    // Filtro por fecha desde
    if (fechaDesde) {
      const fechaMov = new Date(m.fecha);
      const fechaDesdeObj = new Date(fechaDesde + 'T00:00:00');
      if (fechaMov < fechaDesdeObj) return false;
    }
    
    // Filtro por fecha hasta
    if (fechaHasta) {
      const fechaMov = new Date(m.fecha);
      const fechaHastaObj = new Date(fechaHasta + 'T23:59:59');
      if (fechaMov > fechaHastaObj) return false;
    }
    
    // Búsqueda en nombre de producto o descripción
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const matchNombre = (m.producto_nombre || '').toLowerCase().includes(searchLower);
      const matchDescripcion = (m.descripcion || '').toLowerCase().includes(searchLower);
      if (!matchNombre && !matchDescripcion) return false;
    }
    
    return true;
  });

  // Ordenar movimientos
  const movimientosOrdenados = [...movimientosFiltrados].sort((a, b) => {
    switch (ordenamiento) {
      case '-fecha':
        return new Date(b.fecha) - new Date(a.fecha);
      case 'fecha':
        return new Date(a.fecha) - new Date(b.fecha);
      case 'producto':
        return (a.producto_nombre || '').localeCompare(b.producto_nombre || '');
      case '-producto':
        return (b.producto_nombre || '').localeCompare(a.producto_nombre || '');
      case '-cantidad':
        return (b.cantidad || 0) - (a.cantidad || 0);
      case 'cantidad':
        return (a.cantidad || 0) - (b.cantidad || 0);
      default:
        return 0;
    }
  });

  const totalEntradas = movimientos.filter((m) => m.tipo === 'ENTRADA')
    .reduce((sum, m) => sum + (m.cantidad || 0), 0);
  const totalSalidas = movimientos.filter((m) => m.tipo === 'SALIDA')
    .reduce((sum, m) => sum + (m.cantidad || 0), 0);

  const exportarCSV = () => {
    const url = `${import.meta.env.VITE_API_URL}/movimientos/exportar_csv/`;
    window.open(url, '_blank');
  };

  const abrirDetalle = (movimiento) => {
    setMovimientoSeleccionado(movimiento);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setMovimientoSeleccionado(null);
  };

  const obtenerEstadisticas = () => {
    const entradas = movimientos.filter(m => m.tipo === 'ENTRADA');
    const salidas = movimientos.filter(m => m.tipo === 'SALIDA');
    
    const totalEntradas = entradas.reduce((sum, m) => sum + (m.cantidad || 0), 0);
    const totalSalidas = salidas.reduce((sum, m) => sum + (m.cantidad || 0), 0);
    
    return {
      totalMovimientos: movimientos.length,
      totalEntradas: entradas.length,
      totalSalidas: salidas.length,
      cantidadEntradas: totalEntradas,
      cantidadSalidas: totalSalidas,
      balance: totalEntradas - totalSalidas
    };
  };

  // Obtener productos más movidos
  const obtenerProductosMasMovidos = () => {
    const productosCount = {};
    movimientos.forEach(m => {
      const nombre = m.producto_nombre || 'Sin nombre';
      productosCount[nombre] = (productosCount[nombre] || 0) + m.cantidad;
    });
    return Object.entries(productosCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  // Calcular paginación
  const totalPaginas = Math.ceil(movimientosOrdenados.length / itemsPorPagina);
  const indexInicio = (paginaActual - 1) * itemsPorPagina;
  const indexFin = indexInicio + itemsPorPagina;
  const movimientosPaginados = movimientosOrdenados.slice(indexInicio, indexFin);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cambiarItemsPorPagina = (nuevoValor) => {
    setItemsPorPagina(parseInt(nuevoValor));
    setPaginaActual(1);
  };

  const exportarMovimientosCSV = async () => {
    try {
      const response = await movementService.exportarCSV();
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `movimientos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar movimientos');
    }
  };

  return (
    <div className="page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Movimientos de inventario</h1>
        <p className="page-description">Registra entradas y salidas de stock con validación automática.</p>
      </header>

      {/* Estadísticas mejoradas */}
      <div className="estadisticas-movimientos">
        <div className="stat-card-mov entrada">
          <div className="stat-icono">E</div>
          <div className="stat-info">
            <span className="stat-numero">{obtenerEstadisticas().totalEntradas}</span>
            <span className="stat-label">Entradas</span>
            <span className="stat-detalle">{obtenerEstadisticas().cantidadEntradas} unidades</span>
          </div>
        </div>
        <div className="stat-card-mov salida">
          <div className="stat-icono">S</div>
          <div className="stat-info">
            <span className="stat-numero">{obtenerEstadisticas().totalSalidas}</span>
            <span className="stat-label">Salidas</span>
            <span className="stat-detalle">{obtenerEstadisticas().cantidadSalidas} unidades</span>
          </div>
        </div>
        <div className="stat-card-mov balance">
          <div className="stat-icono">B</div>
          <div className="stat-info">
            <span className="stat-numero">{obtenerEstadisticas().balance}</span>
            <span className="stat-label">Balance neto</span>
            <span className="stat-detalle">{obtenerEstadisticas().totalMovimientos} movimientos</span>
          </div>
        </div>
      </div>

      <section className="grid-two">
        <FormularioMovimiento productos={productos} alRegistrar={cargarDatos} />
        <div className="panel resumen-movimientos-acciones">
          <h3>Acciones rápidas</h3>
          <div className="acciones-grid">
            <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando}>
              Actualizar lista
            </button>
            <button className="btn btn-success" type="button" onClick={exportarMovimientosCSV}>
              Exportar CSV
            </button>
          </div>
          
          <div className="info-balance">
            <p className="info-label">Balance total del sistema</p>
            <p className={`balance-valor ${obtenerEstadisticas().balance >= 0 ? 'positivo' : 'negativo'}`}>
              {obtenerEstadisticas().balance > 0 ? '+' : ''}{obtenerEstadisticas().balance} unidades
            </p>
            <p className="info-detalle">
              Último movimiento: {movimientos.length > 0 ? new Date(movimientos[0]?.fecha).toLocaleDateString('es-CL') : 'N/A'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button className="btn btn-primary" type="button" onClick={exportarCSV} disabled={!movimientos.length}>
              Exportar CSV
            </button>
          </div>
        </div>
      </section>

      <div className="panel" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#52525b' }}>Productos más movidos</h3>
        {obtenerProductosMasMovidos().length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {obtenerProductosMasMovidos().map(([producto, cantidad], index) => (
              <div key={producto} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '12px',
                  color: 'white'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: '#3f3f46' }}>
                  {producto}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#6366f1',
                  background: '#eef2ff',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}>
                  {cantidad} unidades
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No hay movimientos registrados</div>
        )}
      </div>

      <div className="panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Buscar por producto o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: '1 1 250px', padding: '10px 14px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px' }}
            aria-label="Campo de búsqueda de movimientos"
          />
          <input
            type="date"
            placeholder="Fecha desde"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px' }}
            aria-label="Filtro fecha desde"
          />
          <input
            type="date"
            placeholder="Fecha hasta"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px' }}
            aria-label="Filtro fecha hasta"
          />
          {(busqueda || filtroTipo || filtroProducto || fechaDesde || fechaHasta || filtroCategoria) && (
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={() => {
                setBusqueda('');
                setFiltroTipo('');
                setFiltroProducto('');
                setFechaDesde('');
                setFechaHasta('');
                setFiltroCategoria('');
              }}
            >
              Limpiar filtros
            </button>
          )}
          <span style={{ fontSize: '14px', color: '#52525b', padding: '0 8px' }}>
            {movimientosFiltrados.length} {movimientosFiltrados.length === 1 ? 'resultado' : 'resultados'}
          </span>
          <label htmlFor="items-por-pagina" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500' }}>
            Mostrar:
          </label>
          <select 
            id="items-por-pagina"
            value={itemsPorPagina} 
            onChange={(e) => cambiarItemsPorPagina(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
            aria-label="Cantidad de items por página"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label htmlFor="filtro-producto" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500' }}>
            Producto:
          </label>
          <select 
            id="filtro-producto"
            value={filtroProducto} 
            onChange={(e) => setFiltroProducto(e.target.value)}
            style={{ flex: '1 1 auto', padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
            aria-label="Filtro de movimientos por producto"
          >
            <option value="">Todos los productos</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <label htmlFor="filtro-tipo" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500' }}>
            Filtrar por tipo:
          </label>
          <select 
            id="filtro-tipo"
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{ flex: '1 1 auto', padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
            aria-label="Filtro de movimientos por tipo"
          >
            <option value="">Todos los movimientos</option>
            <option value="ENTRADA">Solo entradas</option>
            <option value="SALIDA">Solo salidas</option>
          </select>
          <label htmlFor="filtro-categoria" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500' }}>
            Categoría:
          </label>
          <select 
            id="filtro-categoria"
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value)}
            style={{ flex: '1 1 auto', padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
            aria-label="Filtro de movimientos por categoría"
          >
            <option value="">Todas las categorías</option>
            <option value="Impresora">Impresora</option>
            <option value="Toner">Toner</option>
            <option value="Tinta">Tinta</option>
            <option value="Papel">Papel</option>
            <option value="Tambor">Tambor</option>
            <option value="Kit">Kit</option>
            <option value="Repuesto">Repuesto</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
          <label htmlFor="ordenamiento" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500' }}>
            Ordenar por:
          </label>
          <select 
            id="ordenamiento"
            value={ordenamiento} 
            onChange={(e) => setOrdenamiento(e.target.value)}
            style={{ flex: '1 1 auto', padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
            aria-label="Ordenamiento de movimientos"
          >
            <option value="-fecha">Más recientes</option>
            <option value="fecha">Más antiguos</option>
            <option value="producto">Producto (A-Z)</option>
            <option value="-producto">Producto (Z-A)</option>
            <option value="-cantidad">Mayor cantidad</option>
            <option value="cantidad">Menor cantidad</option>
          </select>
        </div>
      </div>

      <ListaMovimientos 
        movimientos={movimientosPaginados} 
        cargando={cargando} 
        error={error}
        onVerDetalle={abrirDetalle}
      />

      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => cambiarPagina(1)}
            disabled={paginaActual === 1}
          >
            ««
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            « Anterior
          </button>
          <span style={{ fontSize: '14px', color: '#52525b', padding: '0 16px' }}>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button 
            className="btn btn-secondary" 
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente »
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => cambiarPagina(totalPaginas)}
            disabled={paginaActual === totalPaginas}
          >
            »»
          </button>
        </div>
      )}

      {mostrarModal && movimientoSeleccionado && (
        <ModalDetalleMovimiento 
          movimiento={movimientoSeleccionado}
          onCerrar={cerrarModal}
        />
      )}
    </div>
  );
}

export default Movimientos;
