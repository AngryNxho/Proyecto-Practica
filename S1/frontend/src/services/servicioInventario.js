import api from './api';

// Servicio para gestionar productos
export const servicioProducto = {
  // Obtener todos los productos
  obtenerTodos: () => api.get('/productos/'),
  
  // Obtener un producto por ID
  obtenerPorId: (id) => api.get(`/productos/${id}/`),
  
  // Crear un nuevo producto
  crear: (data) => api.post('/productos/', data),
  
  // Actualizar un producto
  actualizar: (id, data) => api.put(`/productos/${id}/`, data),
  
  // Eliminar un producto
  eliminar: (id) => api.delete(`/productos/${id}/`),
  
  // Registrar entrada de stock
  registrarEntrada: (id, data) => api.post(`/productos/${id}/registrar_entrada/`, data),
  
  // Registrar salida de stock
  registrarSalida: (id, data) => api.post(`/productos/${id}/registrar_salida/`, data),
};

// Servicio para gestionar movimientos
export const servicioMovimiento = {
  // Obtener todos los movimientos
  obtenerTodos: () => api.get('/movimientos/'),
  
  // Obtener un movimiento por ID
  obtenerPorId: (id) => api.get(`/movimientos/${id}/`),
};

// Servicio para gestionar alertas
export const servicioAlerta = {
  // Obtener todas las alertas
  obtenerTodos: () => api.get('/alertas/'),
  
  // Obtener una alerta por ID
  obtenerPorId: (id) => api.get(`/alertas/${id}/`),
  
  // Crear una nueva alerta
  crear: (data) => api.post('/alertas/', data),
  
  // Actualizar una alerta
  actualizar: (id, data) => api.put(`/alertas/${id}/`, data),
  
  // Eliminar una alerta
  eliminar: (id) => api.delete(`/alertas/${id}/`),
};
