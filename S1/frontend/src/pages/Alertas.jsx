import { useEffect, useState } from 'react';
import FormularioAlerta from '../components/alertas/FormularioAlerta';
import ListaAlertas from '../components/alertas/ListaAlertas';
import { alertService, productService } from '../services/inventoryService';
import './Alertas.css';

function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('activas');
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('fecha-desc');
  const [resolviendo, setResolviendo] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [alertasRes, productosRes] = await Promise.all([
        alertService.obtenerTodos(),
        productService.obtenerTodos(),
      ]);
      setAlertas(alertasRes.data.results || alertasRes.data || []);
      setProductos(productosRes.data.results || productosRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar alertas:', err);
      setAlertas([]);
      setProductos([]);
      setError(null);
    } finally {
      setCargando(false);
    }
  };

  const resolverAlerta = async (id) => {
    try {
      setResolviendo(id);
      await alertService.resolver(id);
      // Actualizar estado local inmediatamente
      setAlertas(prev => prev.map(a => 
        a.id === id ? { ...a, activa: false } : a
      ));
    } catch (err) {
      console.error('Error al resolver alerta:', err);
      setError('No se pudo resolver la alerta');
    } finally {
      setResolviendo(null);
    }
  };

  // Aplicar filtros
  let alertasFiltradas = filtroEstado === 'activas' 
    ? alertas.filter(a => a.activa)
    : filtroEstado === 'inactivas'
    ? alertas.filter(a => !a.activa)
    : alertas;

  // Aplicar búsqueda
  if (busqueda.trim()) {
    alertasFiltradas = alertasFiltradas.filter(a =>
      a.producto_nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Aplicar ordenamiento
  alertasFiltradas = [...alertasFiltradas].sort((a, b) => {
    switch (ordenamiento) {
      case 'fecha-desc':
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
      case 'fecha-asc':
        return new Date(a.fecha_creacion) - new Date(b.fecha_creacion);
      case 'producto-asc':
        return a.producto_nombre.localeCompare(b.producto_nombre);
      case 'producto-desc':
        return b.producto_nombre.localeCompare(a.producto_nombre);
      case 'umbral-desc':
        return b.umbral - a.umbral;
      case 'umbral-asc':
        return a.umbral - b.umbral;
      default:
        return 0;
    }
  });

  return (
    <div className="page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">⚠️ Alertas de stock</h1>
        <p className="page-description">
          Configura umbrales de alerta y revisa qué productos necesitan reposición.
        </p>
      </header>

      <section className="grid-two">
        <FormularioAlerta productos={productos} alCrear={cargarDatos} />
        <div className="panel alertas-summary">
          <p>Alertas activas: <strong>{alertas.filter((a) => a.activa).length}</strong></p>
          <p>Alertas inactivas: <strong>{alertas.filter((a) => !a.activa).length}</strong></p>
          <p>Productos monitoreados: <strong>{productos.filter(p => alertas.some(a => a.producto === p.id)).length}</strong></p>
          <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando} style={{ marginTop: '12px', width: '100%' }}>
            Actualizar
          </button>
        </div>
      </section>

      <div className="panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ flex: '1 1 250px' }}>
            <input
              type="text"
              placeholder="Buscar por producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                border: '1px solid #e4e4e7', 
                borderRadius: '8px', 
                fontSize: '14px',
                backgroundColor: 'white'
              }}
              aria-label="Buscar alertas por producto"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: '1 1 auto' }}>
            <label htmlFor="filtro-estado" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Estado:
            </label>
            <select 
              id="filtro-estado"
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ flex: '1', padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
              aria-label="Filtro de alertas por estado"
            >
              <option value="activas">Solo activas</option>
              <option value="inactivas">Solo resueltas</option>
              <option value="todas">Todas</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: '1 1 auto' }}>
            <label htmlFor="ordenamiento" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Ordenar:
            </label>
            <select 
              id="ordenamiento"
              value={ordenamiento} 
              onChange={(e) => setOrdenamiento(e.target.value)}
              style={{ flex: '1', padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
              aria-label="Ordenar alertas"
            >
              <option value="fecha-desc">Más recientes</option>
              <option value="fecha-asc">Más antiguas</option>
              <option value="producto-asc">Producto A-Z</option>
              <option value="producto-desc">Producto Z-A</option>
              <option value="umbral-desc">Umbral mayor</option>
              <option value="umbral-asc">Umbral menor</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: '14px', color: '#52525b' }}>
            {alertasFiltradas.length} {alertasFiltradas.length === 1 ? 'alerta' : 'alertas'}
          </span>
          {(busqueda || filtroEstado !== 'activas' || ordenamiento !== 'fecha-desc') && (
            <button 
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('activas');
                setOrdenamiento('fecha-desc');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <ListaAlertas alertas={alertasFiltradas} cargando={cargando} error={error} onResolver={resolverAlerta} />
    </div>
  );
}

export default Alertas;
