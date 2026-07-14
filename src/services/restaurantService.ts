// src/services/restaurantService.ts
import { api } from './api';
import { Restaurant } from '../types/api.types'; 

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const response = await api.get('/restaurants'); 
  return response.data;
};

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};