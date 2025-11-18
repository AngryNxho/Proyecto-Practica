import { useEffect, useState } from 'react';
import FormularioProducto from '../components/productos/FormularioProducto';
import ListaProductos from '../components/productos/ListaProductos';
import { servicioProducto, servicioAlerta } from '../services/servicioInventario';
import './Productos.css';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [productosRes, alertasRes] = await Promise.all([
        servicioProducto.obtenerTodos(),
        servicioAlerta.obtenerTodos(),
      ]);
      setProductos(productosRes.data);
      setAlertas(alertasRes.data);
      setError(null);
    } catch (err) {
      setError('No pudimos obtener los productos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Gestión de productos</h1>
        <p className="page-description">
          Da de alta nuevos equipos o tóners y controla su estado en tiempo real.
        </p>
      </header>

      <section className="grid-two">
        <FormularioProducto alCrear={cargarDatos} />
        <div className="panel stats-panel">
          <p className="stats-value">{productos.length}</p>
          <p className="stats-label">Productos totales</p>
          <p className="stats-value smaller">{alertas.length}</p>
          <p className="stats-label">Alertas configuradas</p>
          <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando}>
            Actualizar catálogo
          </button>
        </div>
      </section>

      <ListaProductos
        productos={productos}
        alertas={alertas}
        cargando={cargando}
        error={error}
      />
    </div>
  );
}

export default Productos;
