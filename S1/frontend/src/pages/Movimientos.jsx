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
  const [ordenamiento, setOrdenamiento] = useState('-fecha');
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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
    
    // B\u00fasqueda en nombre de producto o descripci\u00f3n
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
          <div className="stat-icono">📥</div>
          <div className="stat-info">
            <span className="stat-numero">{obtenerEstadisticas().totalEntradas}</span>
            <span className="stat-label">Entradas</span>
            <span className="stat-detalle">{obtenerEstadisticas().cantidadEntradas} unidades</span>
          </div>
        </div>
        <div className="stat-card-mov salida">
          <div className="stat-icono">📤</div>
          <div className="stat-info">
            <span className="stat-numero">{obtenerEstadisticas().totalSalidas}</span>
            <span className="stat-label">Salidas</span>
            <span className="stat-detalle">{obtenerEstadisticas().cantidadSalidas} unidades</span>
          </div>
        </div>
        <div className="stat-card-mov balance">
          <div className="stat-icono">⚖️</div>
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
          <h3>⚡ Acciones rápidas</h3>
          <div className="acciones-grid">
            <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando}>
              🔄 Actualizar lista
            </button>
            <button className="btn btn-success" type="button" onClick={exportarMovimientosCSV}>
              📊 Exportar CSV
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
              📥 Exportar CSV
            </button>
          </div>
        </div>
      </section>

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
          {(busqueda || filtroTipo || filtroProducto) && (
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={() => {
                setBusqueda('');
                setFiltroTipo('');
                setFiltroProducto('');
              }}
            >
              Limpiar filtros
            </button>
          )}
          <span style={{ fontSize: '14px', color: '#52525b', padding: '0 8px' }}>
            {movimientosFiltrados.length} {movimientosFiltrados.length === 1 ? 'resultado' : 'resultados'}
          </span>
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
        movimientos={movimientosOrdenados} 
        cargando={cargando} 
        error={error}
        onVerDetalle={abrirDetalle}
      />

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
