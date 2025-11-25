function Boton({ children, variante = 'primary', deshabilitado = false, onClick, tipo = 'button', ...props }) {
  const clases = `btn btn-${variante}`;
  
  return (
    <button 
      type={tipo}
      className={clases}
      disabled={deshabilitado}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Boton;
