import { api } from './api';

export interface Settings {
  deliveryFee: number;
  serviceFee: number;
}

export const getSettings = async (): Promise<Settings> => {
  const response = await api.get('/settings');
  return response.data;
};