const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/api/login_check`,
    PROFILE: `${API_BASE_URL}/api/user/profile`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/token/refresh`,
    LOGS: `${API_BASE_URL}/api/logs`,
    USERS: `${API_BASE_URL}/api/users`,
    CREATE_TEST_USERS: `${API_BASE_URL}/api/create-test-users`,
};

export default API_BASE_URL;