// src/services/api.ts
import axios from 'axios';
import { TokenManager } from './tokenManager';

export const api = axios.create({
  baseURL: 'https://delivery-backend-alichan25.amvera.io/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API ERROR:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      TokenManager.clearToken();
    }
    return Promise.reject(error);
  }
);

export default api;