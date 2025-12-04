import axios from 'axios';
import logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
  (error) => {
    if (error.response) {
      logger.error(`API Error ${error.response.status}: ${error.response.config.url}`, {
        status: error.response.status,
        data: error.response.data
      });
      console.error('[API Response Error]', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      logger.error('API No Response', { message: 'El servidor no respondió' });
      console.error('[API No Response] El servidor no respondió', error.request);
    } else {
      logger.error('API Setup Error', { message: error.message });
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
