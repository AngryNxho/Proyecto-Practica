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

  const alertasFiltradas = filtroEstado === 'activas' 
    ? alertas.filter(a => a.activa)
    : filtroEstado === 'inactivas'
    ? alertas.filter(a => !a.activa)
    : alertas;

  return (
    <div className="page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Alertas de stock</h1>
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
            🔄 Actualizar
          </button>
        </div>
      </section>

      <div className="panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label htmlFor="filtro-estado" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500' }}>
            Mostrar:
          </label>
          <select 
            id="filtro-estado"
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ flex: '1 1 auto', padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
            aria-label="Filtro de alertas por estado"
          >
            <option value="activas">Solo alertas activas</option>
            <option value="inactivas">Solo alertas inactivas</option>
            <option value="todas">Todas las alertas</option>
          </select>
          <span style={{ fontSize: '14px', color: '#52525b', marginLeft: '8px' }}>
            {alertasFiltradas.length} {alertasFiltradas.length === 1 ? 'alerta' : 'alertas'}
          </span>
        </div>
      </div>

      <ListaAlertas alertas={alertasFiltradas} cargando={cargando} error={error} />
    </div>
  );
}

export default Alertas;
