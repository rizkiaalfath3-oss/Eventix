import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://eventix-backend-production.up.railway.app/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthPage = window.location.pathname.includes('/auth/');
        if (!isAuthPage) {
          // Keep token unless explicitly logged out, or clean up if invalid
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
