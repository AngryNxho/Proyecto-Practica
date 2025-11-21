import api from './api';

// Product service
export const productService = {
  getAll: () => api.get('/productos/'),
  getById: (id) => api.get(`/productos/${id}/`),
  create: (data) => api.post('/productos/', data),
  update: (id, data) => api.put(`/productos/${id}/`, data),
  delete: (id) => api.delete(`/productos/${id}/`),
  registerEntry: (id, data) => api.post(`/productos/${id}/registrar_entrada/`, data),
  registerExit: (id, data) => api.post(`/productos/${id}/registrar_salida/`, data),
};

// Movement service
export const movementService = {
  getAll: () => api.get('/movimientos/'),
  getById: (id) => api.get(`/movimientos/${id}/`),
};

// Alert service
export const alertService = {
  getAll: () => api.get('/alertas/'),
  getById: (id) => api.get(`/alertas/${id}/`),
  create: (data) => api.post('/alertas/', data),
  update: (id, data) => api.put(`/alertas/${id}/`, data),
  delete: (id) => api.delete(`/alertas/${id}/`),
};
