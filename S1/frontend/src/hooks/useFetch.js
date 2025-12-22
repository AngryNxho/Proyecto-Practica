import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para manejar lógica de fetching de datos con refresco
 * Centraliza patrones comunes de carga de datos desde API
 */
export function useFetch(fetchFunction, deps = []) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fetchFunction();
      setDatos(resultado);
    } catch (err) {
      const mensajeError = err.response?.data?.message || err.message || 'Error al cargar datos';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  }, deps);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { datos, cargando, error, recargar: cargar };
}

/**
 * Hook para manejar filtrado local de datos
 * Evita duplicar lógica de filtros en múltiples componentes
 */
export function useFiltros(datos, filtrosIniciales = {}) {
  const [filtros, setFiltros] = useState(filtrosIniciales);

  const actualizarFiltro = useCallback((clave, valor) => {
    setFiltros(prev => ({ ...prev, [clave]: valor }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(filtrosIniciales);
  }, [filtrosIniciales]);

  const datosFiltrados = useCallback(() => {
    if (!datos) return [];
    
    return datos.filter(item => {
      return Object.entries(filtros).every(([clave, valor]) => {
        if (!valor || valor === 'todos' || valor === '') return true;
        
        if (typeof valor === 'string') {
          return String(item[clave]).toLowerCase().includes(valor.toLowerCase());
        }
        
        return item[clave] === valor;
      });
    });
  }, [datos, filtros]);

  return {
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    datosFiltrados: datosFiltrados()
  };
}
