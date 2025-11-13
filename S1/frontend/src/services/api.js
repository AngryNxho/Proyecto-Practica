import axios from 'axios';

// Configuración base de la API
const API_URL = 'http://127.0.0.1:8000/api';

// Instancia de Axios configurada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
