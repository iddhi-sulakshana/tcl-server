import { useAuthStore } from '@/stores/Auth.store';
import axios from 'axios';

const ApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add interceptor to the axios instance
ApiClient.interceptors.request.use(
  (config) => {
    // get the token from the store
    // TODO: token rotation using refresh token
    const token = useAuthStore.getState().token;
    config.headers['X-API-Version'] = '1.0.0';
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default ApiClient;
