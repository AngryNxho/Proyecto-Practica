import { useState, useCallback } from 'react';

/**
 * Hook para manejar estados de carga, error y datos
 * Reduce código duplicado en componentes que consumen APIs
 */
export function useAsync(asyncFunction) {
  const [estado, setEstado] = useState({
    cargando: false,
    error: null,
    datos: null
  });

  const ejecutar = useCallback(async (...params) => {
    setEstado({ cargando: true, error: null, datos: null });
    try {
      const resultado = await asyncFunction(...params);
      setEstado({ cargando: false, error: null, datos: resultado });
      return resultado;
    } catch (error) {
      const mensajeError = error.response?.data?.message || error.message || 'Error desconocido';
      setEstado({ cargando: false, error: mensajeError, datos: null });
      throw error;
    }
  }, [asyncFunction]);

  const limpiar = useCallback(() => {
    setEstado({ cargando: false, error: null, datos: null });
  }, []);

  return { ...estado, ejecutar, limpiar };
}

/**
 * Hook para manejar confirmaciones de usuario
 * Centraliza lógica de window.confirm con mensajes consistentes
 */
export function useConfirmacion() {
  const confirmar = useCallback((mensaje, tipo = 'warning') => {
    const icono = tipo === 'danger' ? '⚠️' : '❓';
    return window.confirm(`${icono} ${mensaje}`);
  }, []);

  return confirmar;
}

/**
 * Hook para manejar mensajes temporales (notificaciones)
 */
export function useMensaje(duracion = 3000) {
  const [mensaje, setMensaje] = useState(null);

  const mostrar = useCallback((texto, tipo = 'info') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), duracion);
  }, [duracion]);

  const limpiar = useCallback(() => {
    setMensaje(null);
  }, []);

  return { mensaje, mostrar, limpiar };
}
