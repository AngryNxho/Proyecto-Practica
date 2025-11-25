import './Selector.css';

function Selector({ 
  etiqueta, 
  nombre, 
  valor, 
  onChange, 
  opciones = [],
  requerido = false,
  deshabilitado = false,
  ariaLabel,
  ...props 
}) {
  return (
    <label className="selector">
      {etiqueta && <span className="selector__etiqueta">{etiqueta}</span>}
      <select
        name={nombre}
        value={valor}
        onChange={onChange}
        required={requerido}
        disabled={deshabilitado}
        aria-label={ariaLabel || etiqueta}
        className="selector__select"
        {...props}
      >
        {opciones.map((opcion, indice) => (
          <option key={indice} value={opcion.valor || opcion}>
            {opcion.etiqueta || opcion}
          </option>
        ))}
      </select>
    </label>
  );
}

export default Selector;
