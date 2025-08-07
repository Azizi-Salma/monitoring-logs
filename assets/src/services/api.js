const API_BASE_URL = 'http://localhost:8000';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                // Token expiré, rediriger vers login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Méthodes API
    async getLogs(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/api/logs?${params}`);
    }

    async getLogsStats() {
        return this.request('/api/logs/stats');
    }

    async exportLogs(format = 'json') {
        return this.request(`/api/logs/export?format=${format}`);
    }

    async createTestUsers() {
        return this.request('/api/create-test-users', { method: 'POST' });
    }
}

export default new ApiService();