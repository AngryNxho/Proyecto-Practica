import api from './api';

// Servicio para gestionar productos
export const productoService = {
  // Obtener todos los productos
  getAll: () => api.get('/productos/'),
  
  // Obtener un producto por ID
  getById: (id) => api.get(`/productos/${id}/`),
  
  // Crear un nuevo producto
  create: (data) => api.post('/productos/', data),
  
  // Actualizar un producto
  update: (id, data) => api.put(`/productos/${id}/`, data),
  
  // Eliminar un producto
  delete: (id) => api.delete(`/productos/${id}/`),
  
  // Registrar entrada de stock
  registrarEntrada: (id, data) => api.post(`/productos/${id}/registrar_entrada/`, data),
  
  // Registrar salida de stock
  registrarSalida: (id, data) => api.post(`/productos/${id}/registrar_salida/`, data),
};

// Servicio para gestionar movimientos
export const movimientoService = {
  // Obtener todos los movimientos
  getAll: () => api.get('/movimientos/'),
  
  // Obtener un movimiento por ID
  getById: (id) => api.get(`/movimientos/${id}/`),
};

// Servicio para gestionar alertas
export const alertaService = {
  // Obtener todas las alertas
  getAll: () => api.get('/alertas/'),
  
  // Obtener una alerta por ID
  getById: (id) => api.get(`/alertas/${id}/`),
  
  // Crear una nueva alerta
  create: (data) => api.post('/alertas/', data),
  
  // Actualizar una alerta
  update: (id, data) => api.put(`/alertas/${id}/`, data),
  
  // Eliminar una alerta
  delete: (id) => api.delete(`/alertas/${id}/`),
};
