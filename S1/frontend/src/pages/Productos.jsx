import { useEffect, useState } from 'react';
import FormularioProducto from '../components/productos/FormularioProducto';
import ListaProductos from '../components/productos/ListaProductos';
import { productService, alertService } from '../services/inventoryService';
import './Productos.css';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const parametros = busqueda ? { search: busqueda } : {};
      const [productosRes, alertasRes] = await Promise.all([
        productService.buscar(parametros),
        alertService.obtenerTodos(),
      ]);
      setProductos(productosRes.data.results || productosRes.data);
      setAlertas(alertasRes.data.results || alertasRes.data);
      setError(null);
    } catch (err) {
      setError('No pudimos obtener los productos.');
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminar = async (id) => {
    try {
      await productService.eliminar(id);
      await cargarDatos();
    } catch (err) {
      setError('No se pudo eliminar el producto.');
    }
  };

  const manejarEditar = (producto) => {
    setProductoEditar(producto);
  };

  const manejarCancelarEdicion = () => {
    setProductoEditar(null);
  };

  const manejarBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  const ejecutarBusqueda = () => {
    cargarDatos();
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setTimeout(() => cargarDatos(), 0);
  };

  const exportarCSV = () => {
    const url = `${import.meta.env.VITE_API_URL}/productos/exportar_csv/`;
    window.open(url, '_blank');
  };

  return (
    <div className="page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Gestión de productos</h1>
        <p className="page-description">
          Da de alta nuevos equipos o tóners y controla su estado en tiempo real.
        </p>
      </header>

      <div className="panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por nombre, marca, modelo o descripción..."
            value={busqueda}
            onChange={manejarBusqueda}
            onKeyPress={(e) => e.key === 'Enter' && ejecutarBusqueda()}
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px' }}
          />
          <button className="btn btn-primary" type="button" onClick={ejecutarBusqueda}>
            Buscar
          </button>
          {busqueda && (
            <button className="btn btn-secondary" type="button" onClick={limpiarBusqueda}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <section className="grid-two">
        <FormularioProducto 
          alCrear={cargarDatos} 
          productoEditar={productoEditar}
          alCancelar={manejarCancelarEdicion}
        />
        <div className="panel stats-panel">
          <p className="stats-value">{productos.length}</p>
          <p className="stats-label">Productos totales</p>
          <p className="stats-value smaller">{alertas.length}</p>
          <p className="stats-label">Alertas configuradas</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando}>
              🔄 Actualizar
            </button>
            <button className="btn btn-primary" type="button" onClick={exportarCSV} disabled={!productos.length}>
              📥 Exportar CSV
            </button>
          </div>
        </div>
      </section>

      <ListaProductos
        productos={productos}
        alertas={alertas}
        cargando={cargando}
        error={error}
        alEliminar={manejarEliminar}
        alEditar={manejarEditar}
      />
    </div>
  );
}

export default Productos;
