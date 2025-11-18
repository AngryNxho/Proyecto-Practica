import { useEffect, useState } from 'react';
import FormularioAlerta from '../components/alertas/FormularioAlerta';
import ListaAlertas from '../components/alertas/ListaAlertas';
import { servicioAlerta, servicioProducto } from '../services/servicioInventario';
import './Alertas.css';

function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [alertasRes, productosRes] = await Promise.all([
        servicioAlerta.obtenerTodos(),
        servicioProducto.obtenerTodos(),
      ]);
      setAlertas(alertasRes.data);
      setProductos(productosRes.data);
      setError(null);
    } catch (err) {
      setError('No pudimos consultar las alertas.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="page">
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
          <p>Alertas históricas: <strong>{alertas.length}</strong></p>
          <p>Productos monitoreados: <strong>{productos.filter(p => alertas.some(a => a.producto === p.id)).length}</strong></p>
          <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando}>
            Actualizar
          </button>
        </div>
      </section>

      <ListaAlertas alertas={alertas} cargando={cargando} error={error} />
    </div>
  );
}

export default Alertas;
