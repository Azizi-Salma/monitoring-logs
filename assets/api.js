// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // assure-toi que le backend tourne

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error("⏱️ Timeout dépassé pour la requête.");
    }

    if (!error.response) {
      console.error("❌ Impossible de contacter l'API backend.");
    } else if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// --- Services API ---

export const authAPI = {
  login: (credentials) => apiClient.post('/login_check', credentials),
};

export const logsAPI = {
  getLogs: (params = {}) => apiClient.get('/logs', { params }),
  getStats: () => apiClient.get('/stats'),
};

export const usersAPI = {
  getUsers: () => apiClient.get('/users'),
  createUser: (userData) => apiClient.post('/users', userData),
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
};

export default apiClient;
