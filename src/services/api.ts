import axios from 'axios';
import { TokenManager } from './tokenManager';
import { API_URL } from '../constants/storageKeys';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
};

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
  async (error) => {
    const originalRequest = error.config;

    // Не пытаемся рефрешить сам запрос на рефреш, чтобы не зациклиться
    const isRefreshCall = originalRequest?.url?.includes('/auth/login/access-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        await TokenManager.clearToken();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Другой запрос уже обновляет токен — ждём его результата
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const oldAccessToken = TokenManager.getToken();

        // Бэкенд требует старый (пусть даже просроченный) accessToken в заголовке
        const response = await axios.post(
          `${API_URL}/api/auth/login/access-token`,
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${oldAccessToken}`,
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await TokenManager.setToken(accessToken);
        await TokenManager.setRefreshToken(newRefreshToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await TokenManager.clearToken();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;