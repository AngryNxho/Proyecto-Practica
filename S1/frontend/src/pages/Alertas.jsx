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
