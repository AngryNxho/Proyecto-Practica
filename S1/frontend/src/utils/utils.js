export const formatCurrency = (value) => {
  const numValue = Number(value) || 0;
  return numValue.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
};

export const formatDateTime = (value, options = {}) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
};

export const getStockStatus = (stock, threshold) => {
  if (stock <= 0) return 'critical';
  if (typeof threshold === 'number' && stock <= threshold) return 'warning';
  if (stock <= 5) return 'warning';
  return 'ok';
};

export const getStockLabel = (variant) => {
  switch (variant) {
    case 'critical':
      return 'Sin stock';
    case 'warning':
      return 'Stock bajo';
    default:
      return 'Stock suficiente';
  }
};
