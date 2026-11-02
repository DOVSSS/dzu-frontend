// src/services/restaurantService.ts
import { api } from './api';
import { Restaurant, RestaurantCatalogItem } from '../types/api.types';

export const getRestaurantsCatalog = async (): Promise<RestaurantCatalogItem[]> => {
  const response = await api.get('/restaurants/catalog');
  return response.data;
};

/** Полный список с меню — для совместимости; предпочтительно catalog + getRestaurantById. */
export const getRestaurants = async (): Promise<Restaurant[]> => {
  const response = await api.get('/restaurants');
  return response.data;
};

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};