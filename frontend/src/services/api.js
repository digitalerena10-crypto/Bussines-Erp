import axios from 'axios';

const isProd = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || (isProd ? '' : 'http://localhost:5000/api');
export const RESOURCES_URL = import.meta.env.VITE_RESOURCES_URL || (isProd ? '' : 'http://localhost:5000');

if (isProd && !import.meta.env.VITE_API_URL) {
  console.error('VITE_API_URL is missing in production environment');
}

console.log('📡 API Base URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('erp_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh and errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 — token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('erp_refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

                const newAccessToken = data.data.accessToken;
                const newRefreshToken = data.data.refreshToken;

                localStorage.setItem('erp_token', newAccessToken);
                localStorage.setItem('erp_refresh_token', newRefreshToken);

                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token failed or expired — force logout
                localStorage.removeItem('erp_token');
                localStorage.removeItem('erp_refresh_token');
                delete api.defaults.headers.common['Authorization'];
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
