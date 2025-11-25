import { useEffect, useState } from 'react';
import FormularioProducto from '../components/productos/FormularioProducto';
import ListaProductos from '../components/productos/ListaProductos';
import ModalMovimiento from '../components/productos/ModalMovimiento';
import { productService, alertService } from '../services/inventoryService';
import './Productos.css';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalMovimiento, setModalMovimiento] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [paginaActual]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const parametros = { page: paginaActual };
      if (busqueda) parametros.search = busqueda;
      if (filtroStock === 'bajo') parametros.stock_max = 10;
      if (filtroStock === 'critico') parametros.stock_max = 5;
      if (filtroStock === 'normal') parametros.stock_min = 11;
      
      const [productosRes, alertasRes] = await Promise.all([
        productService.buscar(parametros),
        alertService.obtenerTodos(),
      ]);
      
      const datos = productosRes.data;
      setProductos(datos.results || datos);
      if (datos.count) {
        setTotalPaginas(Math.ceil(datos.count / 10));
      }
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
    setFiltroStock('');
    setPaginaActual(1);
    setTimeout(() => cargarDatos(), 0);
  };

  const ejecutarBusqueda = () => {
    setPaginaActual(1);
    cargarDatos();
  };

  const exportarCSV = () => {
    const url = `${import.meta.env.VITE_API_URL}/productos/exportar_csv/`;
    window.open(url, '_blank');
  };

  const manejarRegistrarMovimiento = (producto, tipo) => {
    setModalMovimiento({ producto, tipo });
  };

  const confirmarMovimiento = async (datos) => {
    try {
      const accion = modalMovimiento.tipo === 'entrada' ? 'registrarEntrada' : 'registrarSalida';
      await productService[accion](modalMovimiento.producto.id, datos);
      setModalMovimiento(null);
      await cargarDatos();
    } catch (err) {
      setError(`No se pudo registrar la ${modalMovimiento.tipo}`);
    }
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Buscar por nombre, marca, modelo..."
              value={busqueda}
              onChange={manejarBusqueda}
              onKeyPress={(e) => e.key === 'Enter' && ejecutarBusqueda()}
              style={{ flex: '1 1 200px', padding: '10px 14px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px' }}
              aria-label="Campo de búsqueda de productos"
            />
            <button className="btn btn-primary" type="button" onClick={ejecutarBusqueda}>
              Buscar
            </button>
            {(busqueda || filtroStock) && (
              <button className="btn btn-secondary" type="button" onClick={limpiarBusqueda}>
                Limpiar
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label htmlFor="filtro-stock" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500' }}>
              Filtrar por stock:
            </label>
            <select 
              id="filtro-stock"
              value={filtroStock} 
              onChange={(e) => setFiltroStock(e.target.value)}
              style={{ flex: '1 1 auto', padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
              aria-label="Filtro de productos por nivel de stock"
            >
              <option value="">Todos</option>
              <option value="critico">Crítico (≤5)</option>
              <option value="bajo">Bajo (≤10)</option>
              <option value="normal">Normal (&gt;10)</option>
            </select>
            <button className="btn btn-secondary" type="button" onClick={ejecutarBusqueda}>
              Aplicar
            </button>
          </div>
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
        alRegistrarMovimiento={manejarRegistrarMovimiento}
      />

      {modalMovimiento && (
        <ModalMovimiento
          producto={modalMovimiento.producto}
          tipo={modalMovimiento.tipo}
          alCerrar={() => setModalMovimiento(null)}
          alConfirmar={confirmarMovimiento}
        />
      )}

      {totalPaginas > 1 && (
        <div className="panel" style={{ marginTop: '24px', padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setPaginaActual(pag => Math.max(1, pag - 1))}
            disabled={paginaActual === 1}
          >
            ← Anterior
          </button>
          <span style={{ padding: '0 16px', fontSize: '14px', color: '#52525b' }}>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button 
            className="btn btn-secondary" 
            onClick={() => setPaginaActual(pag => Math.min(totalPaginas, pag + 1))}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export default Productos;
