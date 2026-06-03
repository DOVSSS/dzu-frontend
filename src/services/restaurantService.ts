// src/services/restaurantService.ts
import { api } from './api';
import { Restaurant } from '../types/api.types'; // ← используем единый тип

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const response = await api.get('/restaurants'); // ← убрали /api
  return response.data;
};