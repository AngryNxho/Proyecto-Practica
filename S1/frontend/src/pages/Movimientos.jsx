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

  const movimientosFiltrados = filtroTipo
    ? movimientos.filter((m) => m.tipo === filtroTipo)
    : movimientos;

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
            Entradas: <strong>{movimientos.filter((m) => m.tipo === 'ENTRADA').length}</strong>
          </p>
          <p>
            Salidas: <strong>{movimientos.filter((m) => m.tipo === 'SALIDA').length}</strong>
          </p>
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
          {filtroTipo && (
            <button className="btn btn-secondary" type="button" onClick={() => setFiltroTipo('')}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <ListaMovimientos movimientos={movimientosFiltrados} cargando={cargando} error={error} />
    </div>
  );
}

export default Movimientos;
