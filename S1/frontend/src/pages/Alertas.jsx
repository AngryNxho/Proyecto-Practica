import { useEffect, useState } from 'react';
import ListaAlertas from '../components/alertas/ListaAlertas';
import { servicioAlerta } from '../services/servicioInventario';
import './Alertas.css';

function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const response = await servicioAlerta.obtenerTodos();
      setAlertas(response.data);
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
          Revisa qué productos necesitan reposición inmediata o están próximos a agotarse.
        </p>
      </header>

      <div className="panel alertas-summary">
        <p>Alertas activas: <strong>{alertas.filter((a) => a.activa).length}</strong></p>
        <p>Alertas históricas: <strong>{alertas.length}</strong></p>
        <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando}>
          Actualizar
        </button>
      </div>

      <ListaAlertas alertas={alertas} cargando={cargando} error={error} />
    </div>
  );
}

export default Alertas;
