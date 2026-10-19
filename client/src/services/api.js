import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('meethacart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors nicely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // If 401 Unauthorized (token expired or invalidated)
    if (error.response?.status === 401 && localStorage.getItem('meethacart_token')) {
      console.warn('[API] Token expired or invalid. Clearing session.');
      localStorage.removeItem('meethacart_token');
      localStorage.removeItem('meethacart_user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
