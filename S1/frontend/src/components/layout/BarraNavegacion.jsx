import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { alertService } from '../../services/inventoryService';
import './BarraNavegacion.css';

const enlaces = [
  { to: '/', etiqueta: 'Tablero', icono: '' },
  { to: '/productos', etiqueta: 'Productos', icono: '' },
  { to: '/movimientos', etiqueta: 'Movimientos', icono: '' },
  { to: '/alertas', etiqueta: 'Alertas', icono: '', mostrarBadge: true },
  { to: '/reportes', etiqueta: 'Reportes', icono: '' },
  { to: '/scanner', etiqueta: 'Scanner', icono: '' },
  { to: '/generador', etiqueta: 'Etiquetas', icono: '' },
  { to: '/dev', etiqueta: 'Pruebas', icono: '' },
  { to: '/logs', etiqueta: 'Logs', icono: '' },
];

function BarraNavegacion() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [alertasActivas, setAlertasActivas] = useState(0);

  useEffect(() => {
    cargarAlertasActivas();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarAlertasActivas, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarAlertasActivas = async () => {
    try {
      const res = await alertService.obtenerTodos();
      const alertas = res.data.results || res.data || [];
      const activas = alertas.filter(a => a.activa).length;
      setAlertasActivas(activas);
    } catch (err) {
      console.error('Error al cargar alertas:', err);
    }
  };

  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <>
      <button className="navbar__toggle" onClick={toggleMenu} aria-label="Menú">
        {menuAbierto ? '✕' : '☰'}
      </button>
      
      <div 
        className={`navbar__overlay ${menuAbierto ? 'is-visible' : ''}`}
        onClick={cerrarMenu}
      />
      
      <aside className={`navbar ${menuAbierto ? 'is-open' : ''}`}>
        <div className="navbar__brand">
          <div className="navbar__logo">TI</div>
          <div>
            <p className="navbar__title">TISOL Inventario</p>
            <p className="navbar__subtitle">Control de impresoras y tóners</p>
          </div>
        </div>
        <nav>
          <ul className="navbar__links">
            {enlaces.map((enlace) => (
              <li key={enlace.to}>
                <NavLink
                  to={enlace.to}
                  className={({ isActive }) =>
                    isActive ? 'navbar__link is-active' : 'navbar__link'
                  }
                  end={enlace.to === '/'}
                  onClick={cerrarMenu}
                >
                  <span className="navbar__link-icon">{enlace.icono}</span>
                  {enlace.etiqueta}
                  {enlace.mostrarBadge && alertasActivas > 0 && (
                    <span className="navbar__badge">{alertasActivas}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="navbar__footer">
          <p>Sprint 4 · Optimizaciones</p>
          <small>Última sincronización {new Date().toLocaleTimeString('es-CL')}</small>
        </div>
      </aside>
    </>
  );
}

export default BarraNavegacion;
