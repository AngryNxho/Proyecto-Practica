import { useEffect, useState } from 'react';
import FormularioMovimiento from '../components/movimientos/FormularioMovimiento';
import ListaMovimientos from '../components/movimientos/ListaMovimientos';
import { productService, movementService } from '../services/inventoryService';
import './Movimientos.css';

function Movimientos() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('-fecha');

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

  return (
    <div className="page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Movimientos de inventario</h1>
        <p className="page-description">Registra entradas y salidas respaldadas en la API.</p>
      </header>

      <section className="grid-two">
        <FormularioMovimiento productos={productos} alRegistrar={cargarDatos} />
        <div className="panel resumen-movimientos">
          <p>Total movimientos: <strong>{movimientos.length}</strong></p>
          <p>
            Entradas: <strong>{movimientos.filter((m) => m.tipo === 'ENTRADA').length}</strong> ({totalEntradas} u.)
          </p>
          <p>
            Salidas: <strong>{movimientos.filter((m) => m.tipo === 'SALIDA').length}</strong> ({totalSalidas} u.)
          </p>
          <div style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
            <p style={{ fontSize: '13px', color: '#52525b', marginBottom: '4px' }}>Balance neto</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: totalEntradas - totalSalidas >= 0 ? '#16a34a' : '#dc2626' }}>
              {totalEntradas - totalSalidas > 0 ? '+' : ''}{totalEntradas - totalSalidas} unidades
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando}>
              🔄 Actualizar
            </button>
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

      <ListaMovimientos movimientos={movimientosOrdenados} cargando={cargando} error={error} />
    </div>
  );
}

export default Movimientos;
