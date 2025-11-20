import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import './BarraNavegacion.css';

const enlaces = [
  { to: '/', etiqueta: 'Tablero' },
  { to: '/productos', etiqueta: 'Productos' },
  { to: '/movimientos', etiqueta: 'Movimientos' },
  { to: '/alertas', etiqueta: 'Alertas' },
];

function BarraNavegacion() {
  const [menuAbierto, setMenuAbierto] = useState(false);

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
                  {enlace.etiqueta}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="navbar__footer">
          <p>Semana 2 · HU10</p>
          <small>Última sincronización {new Date().toLocaleTimeString('es-CL')}</small>
        </div>
      </aside>
    </>
  );
}

export default BarraNavegacion;
