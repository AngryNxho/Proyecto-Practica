import api from './api';

export const productService = {
  obtenerTodos: () => api.get('/productos/'),
  buscar: (params) => api.get('/productos/', { params }),
  obtenerPorId: (id) => api.get(`/productos/${id}/`),
  crear: (data) => api.post('/productos/', data),
  actualizar: (id, data) => api.put(`/productos/${id}/`, data),
  eliminar: (id) => api.delete(`/productos/${id}/`),
  registrarEntrada: (id, data) => api.post(`/productos/${id}/registrar_entrada/`, data),
  registrarSalida: (id, data) => api.post(`/productos/${id}/registrar_salida/`, data),
  obtenerEstadisticas: () => api.get('/productos/estadisticas/'),
};

export const movementService = {
  obtenerTodos: () => api.get('/movimientos/'),
  buscar: (params) => api.get('/movimientos/', { params }),
  obtenerPorId: (id) => api.get(`/movimientos/${id}/`),
};

export const alertService = {
  obtenerTodos: () => api.get('/alertas/'),
  buscar: (params) => api.get('/alertas/', { params }),
  obtenerPorId: (id) => api.get(`/alertas/${id}/`),
  crear: (data) => api.post('/alertas/', data),
  actualizar: (id, data) => api.put(`/alertas/${id}/`, data),
  eliminar: (id) => api.delete(`/alertas/${id}/`),
};

export const movimientoService = movementService;
