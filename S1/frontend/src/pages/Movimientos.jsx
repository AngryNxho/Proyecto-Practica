import { useEffect, useState } from 'react';
import FormularioMovimiento from '../components/movimientos/FormularioMovimiento';
import ListaMovimientos from '../components/movimientos/ListaMovimientos';
import { servicioProducto, servicioMovimiento } from '../services/servicioInventario';
import './Movimientos.css';

function Movimientos() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [productosRes, movimientosRes] = await Promise.all([
        servicioProducto.obtenerTodos(),
        servicioMovimiento.obtenerTodos(),
      ]);
      setProductos(productosRes.data);
      setMovimientos(movimientosRes.data);
      setError(null);
    } catch (err) {
      setError('No pudimos obtener los movimientos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="page">
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
          <button className="btn btn-secondary" type="button" onClick={cargarDatos} disabled={cargando}>
            Actualizar
          </button>
        </div>
      </section>

      <ListaMovimientos movimientos={movimientos} cargando={cargando} error={error} />
    </div>
  );
}

export default Movimientos;
