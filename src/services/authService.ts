import apiClient from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../types/api.types';

// --- Login ---
// POST /auth/login
// Принимает email + password, возвращает user + token
export const loginRequest = async (
  data: LoginRequest,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  console.log('RAW AUTH RESPONSE:', JSON.stringify(response.data));
  
  return response.data;
};

// --- Register ---
// POST /auth/register
// Принимает name + email + password, возвращает user + token
export const registerRequest = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

// --- Get current user ---
// GET /auth/me
// Токен подставляется автоматически через interceptor
// Используется при старте приложения для восстановления сессии
export const getMeRequest = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};