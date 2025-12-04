import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debounce a un valor
 * Útil para búsquedas en tiempo real sin sobrecargar la API
 * @param {*} value - Valor a debouncer
 * @param {number} delay - Delay en milisegundos (default: 500)
 * @returns {*} Valor debounced
 */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
