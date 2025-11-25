import './CampoTexto.css';

function CampoTexto({ 
  etiqueta, 
  nombre, 
  valor, 
  onChange, 
  tipo = 'text',
  placeholder = '',
  requerido = false,
  deshabilitado = false,
  ariaLabel,
  ...props 
}) {
  return (
    <label className="campo-texto">
      {etiqueta && <span className="campo-texto__etiqueta">{etiqueta}</span>}
      <input
        type={tipo}
        name={nombre}
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        required={requerido}
        disabled={deshabilitado}
        aria-label={ariaLabel || etiqueta}
        className="campo-texto__input"
        {...props}
      />
    </label>
  );
}

export default CampoTexto;
