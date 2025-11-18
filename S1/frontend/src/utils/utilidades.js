export const formatearMonedaCLP = (valor) => {
  const numeroValor = Number(valor) || 0;
  return numeroValor.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
};

export const formatearFechaHora = (valor, opciones = {}) => {
  if (!valor) return 'Sin registro';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'Fecha inválida';
  return fecha.toLocaleString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...opciones,
  });
};

export const obtenerEstadoStock = (stock, umbral) => {
  if (stock <= 0) return 'critical';
  if (typeof umbral === 'number' && stock <= umbral) return 'warning';
  if (stock <= 5) return 'warning';
  return 'ok';
};

export const obtenerEtiquetaStock = (variante) => {
  switch (variante) {
    case 'critical':
      return 'Sin stock';
    case 'warning':
      return 'Stock bajo';
    default:
      return 'Stock suficiente';
  }
};
