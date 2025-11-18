import { NavLink } from 'react-router-dom';
import './BarraNavegacion.css';

const enlaces = [
  { to: '/', etiqueta: 'Tablero' },
  { to: '/productos', etiqueta: 'Productos' },
  { to: '/movimientos', etiqueta: 'Movimientos' },
  { to: '/alertas', etiqueta: 'Alertas' },
];

function BarraNavegacion() {
  return (
    <aside className="navbar">
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
              >
                {enlace.etiqueta}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="navbar__footer">
        <p>Semana 2 · HU09</p>
        <small>Última sincronización {new Date().toLocaleTimeString('es-CL')}</small>
      </div>
    </aside>
  );
}

export default BarraNavegacion;
