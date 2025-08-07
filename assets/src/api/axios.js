
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, 
});

//  Ajoute automatiquement le token JWT aux requêtes
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Impossible de récupérer le token depuis localStorage", e);
    }
    return config;
  },
  (error) => {
    console.error("Erreur lors de l'envoi de la requête", error);
    return Promise.reject(error);
  }
);

// Gère les erreurs globales de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error(" Timeout dépassé pour la requête Axios.");
    }

    if (error.response?.status === 401) {
      console.warn(" Token invalide ou expiré, redirection...");
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (!error.response) {
      console.error(" Impossible de se connecter à l’API backend. Vérifie si le serveur Symfony est démarré.");
    }

    return Promise.reject(error);
  }
);

// --- Services API ---

export const authAPI = {
  login: (credentials) => apiClient.post('/login_check', credentials),
  refresh: () => apiClient.post('/token/refresh')
};

export const logsAPI = {
  getLogs: (params = {}) => apiClient.get('/logs', { params }),
  getStats: () => apiClient.get('/stats'),
};

export const usersAPI = {
  getUsers: () => apiClient.get('/users'),
  createUser: (userData) => apiClient.post('/users', userData),
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/users/${id}`)
};

export default apiClient;
