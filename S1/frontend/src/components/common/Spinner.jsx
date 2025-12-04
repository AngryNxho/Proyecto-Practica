import './Spinner.css';

function Spinner({ size = 'md', color = 'primary', fullPage = false }) {
  const spinnerElement = (
    <div className={`spinner spinner-${size} spinner-${color}`}>
      <div className="spinner-circle"></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        {spinnerElement}
        <p className="spinner-text">Cargando...</p>
      </div>
    );
  }

  return spinnerElement;
}

export default Spinner;
