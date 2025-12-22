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
  const [mensaje, setMensaje] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [modalMovimiento, setModalMovimiento] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState('-fecha_creacion');

  useEffect(() => {
    cargarDatos();
  }, [paginaActual]);

  // Búsqueda automática con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (paginaActual === 1) {
        cargarDatos();
      } else {
        setPaginaActual(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda, filtroStock, ordenamiento]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const parametros = { page: paginaActual };
      if (busqueda) parametros.search = busqueda;
      if (filtroStock === 'bajo') parametros.stock_max = 10;
      if (filtroStock === 'critico') parametros.stock_max = 5;
      if (filtroStock === 'normal') parametros.stock_min = 11;
      if (ordenamiento) parametros.ordering = ordenamiento;
      
      const [productosRes, alertasRes] = await Promise.all([
        productService.buscar(parametros),
        alertService.obtenerTodos(),
      ]);
      
      const datos = productosRes.data;
      setProductos(datos.results || datos || []);
      if (datos.count !== undefined) {
        setTotalResultados(datos.count);
        setTotalPaginas(Math.ceil(datos.count / 10));
      } else {
        setTotalResultados(datos.length || 0);
      }
      setAlertas(alertasRes.data.results || alertasRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setProductos([]);
      setAlertas([]);
      setError(null); // No mostrar error si simplemente no hay datos
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminar = async (id) => {
    const producto = productos.find(p => p.id === id);
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar "${producto?.nombre}"?\n\nEsta acción no se puede deshacer y se eliminará:\n- El producto\n- Su historial de movimientos\n- Sus alertas asociadas`
    );
    
    if (!confirmar) return;

    try {
      await productService.eliminar(id);
      setMensaje({ tipo: 'success', texto: '✓ Producto eliminado correctamente.' });
      await cargarDatos();
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'No se pudo eliminar el producto. Inténtalo de nuevo.' });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const manejarEditar = (producto) => {
    setProductoEditar(producto);
  };

  const manejarCancelarEdicion = () => {
    setProductoEditar(null);
  };

  const alCrearProducto = () => {
    setBusqueda('');
    setFiltroStock('');
    if (paginaActual === 1) {
      cargarDatos(); // Si ya estamos en página 1, recargar manualmente
    } else {
      setPaginaActual(1); // Si no, cambiar a página 1 disparará el useEffect
    }
  };

  const manejarBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setFiltroStock('');
    setOrdenamiento('-fecha_creacion');
    if (paginaActual !== 1) setPaginaActual(1);
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

      {mensaje && (
        <div className={`panel ${mensaje.tipo === 'error' ? 'error-state' : 'success-state'}`} style={{ marginBottom: '16px', animation: 'slideDown 0.3s ease' }}>
          {mensaje.texto}
        </div>
      )}

      <div className="panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Buscar por nombre, marca, modelo..."
              value={busqueda}
              onChange={manejarBusqueda}
              style={{ flex: '1 1 200px', padding: '10px 14px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px' }}
              aria-label="Campo de búsqueda de productos"
            />
            {(busqueda || filtroStock || ordenamiento !== '-fecha_creacion') && (
              <button className="btn btn-secondary" type="button" onClick={limpiarBusqueda}>
                Limpiar filtros
              </button>
            )}
            {totalResultados > 0 && (
              <span style={{ fontSize: '14px', color: '#52525b', padding: '0 8px' }}>
                {cargando ? 'Buscando...' : `${totalResultados} ${totalResultados === 1 ? 'resultado' : 'resultados'}`}
              </span>
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
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label htmlFor="ordenamiento" style={{ fontSize: '14px', color: '#52525b', fontWeight: '500' }}>
              Ordenar por:
            </label>
            <select 
              id="ordenamiento"
              value={ordenamiento} 
              onChange={(e) => setOrdenamiento(e.target.value)}
              style={{ flex: '1 1 auto', padding: '8px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
              aria-label="Ordenamiento de productos"
            >
              <option value="-fecha_creacion">Más recientes</option>
              <option value="fecha_creacion">Más antiguos</option>
              <option value="nombre">Nombre (A-Z)</option>
              <option value="-nombre">Nombre (Z-A)</option>
              <option value="stock">Menor stock</option>
              <option value="-stock">Mayor stock</option>
              <option value="precio">Menor precio</option>
              <option value="-precio">Mayor precio</option>
            </select>
          </div>
        </div>
      </div>

      <section className="grid-two">
        <FormularioProducto 
          alCrear={alCrearProducto} 
          productoEditar={productoEditar}
          alCancelar={manejarCancelarEdicion}
        />
        <div className="panel stats-panel">
          <div style={{ marginBottom: '16px' }}>
            <p className="stats-value">{totalResultados}</p>
            <p className="stats-label">
              {busqueda || filtroStock ? 'Encontrados' : 'Total productos'}
            </p>
          </div>
          <div className="stats-divider"></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p className="stats-value smaller" style={{ color: '#ef4444' }}>
                {productos.filter(p => p.stock <= 5).length}
              </p>
              <p className="stats-label">Crítico</p>
            </div>
            <div>
              <p className="stats-value smaller" style={{ color: '#f59e0b' }}>
                {productos.filter(p => p.stock > 5 && p.stock <= 10).length}
              </p>
              <p className="stats-label">Bajo</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p className="stats-value smaller" style={{ color: '#10b981' }}>
                {productos.filter(p => p.stock > 10).length}
              </p>
              <p className="stats-label">Normal</p>
            </div>
            <div>
              <p className="stats-value smaller" style={{ color: '#8b5cf6' }}>
                {alertas.filter(a => a.activa).length}
              </p>
              <p className="stats-label">Alertas</p>
            </div>
          </div>
          <div className="stats-divider"></div>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando} style={{ width: '100%' }}>
              {cargando ? 'Cargando...' : 'Actualizar'}
            </button>
            <button className="btn btn-primary" type="button" onClick={exportarCSV} disabled={!productos.length} style={{ width: '100%' }}>
              Exportar CSV
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
