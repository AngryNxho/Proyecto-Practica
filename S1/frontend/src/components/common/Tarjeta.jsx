import './Tarjeta.css';

function Tarjeta({ children, titulo, accion, className = '' }) {
  return (
    <div className={`tarjeta ${className}`}>
      {(titulo || accion) && (
        <div className="tarjeta__encabezado">
          {titulo && <h3 className="tarjeta__titulo">{titulo}</h3>}
          {accion && <div className="tarjeta__accion">{accion}</div>}
        </div>
      )}
      <div className="tarjeta__contenido">
        {children}
      </div>
    </div>
  );
}

export default Tarjeta;
