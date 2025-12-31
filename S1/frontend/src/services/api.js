import axios from 'axios';
import logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para operaciones pesadas
  validateStatus: function (status) {
    return status >= 200 && status < 500; // No rechazar en 4xx, manejarlos manualmente
  },
});

api.interceptors.request.use(
  (config) => {
    logger.info(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    logger.error('API Request Error', error);
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    logger.success(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status
    });
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Retry automático en errores de red (solo GET)
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      if (!config._retry && config.method === 'get') {
        config._retry = true;
        logger.warn('Reintentando petición...', { url: config.url });
        return api.request(config);
      }
    }
    
    if (error.response) {
      const { status, data } = error.response;
      
      logger.error(`API Error ${status}: ${error.response.config.url}`, {
        status: status,
        data: data
      });
      
      // Mensajes específicos por código de error
      let mensajeUsuario = '';
      if (status === 400) {
        mensajeUsuario = data.detail || data.error || 'Datos inválidos';
      } else if (status === 404) {
        mensajeUsuario = 'Recurso no encontrado';
      } else if (status === 409) {
        mensajeUsuario = 'Conflicto: el recurso ya existe';
      } else if (status === 500) {
        mensajeUsuario = 'Error del servidor. Intenta más tarde';
      } else if (status === 503) {
        mensajeUsuario = 'Servicio temporalmente no disponible';
      }
      
      error.mensajeUsuario = mensajeUsuario;
      
      console.error('[API Response Error]', {
        status: status,
        data: data,
        url: error.config?.url,
      });
    } else if (error.request) {
      logger.error('API No Response', { message: 'El servidor no respondió' });
      console.error('[API No Response] El servidor no respondió', error.request);
      error.mensajeUsuario = 'No se pudo conectar con el servidor. Verifica tu conexión';
    } else {
      logger.error('API Setup Error', { message: error.message });
      console.error('[API Error]', error.message);
      error.mensajeUsuario = 'Error al configurar la petición';
    }
    return Promise.reject(error);
  }
);

export default api;
