// src/services/orderService.ts
import { api } from './api';

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  items: CartItem[];
  deliveryAddress?: string;
  comment?: string;
};

export type OrderItem = {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  reference: string;
  status: string;
  total: number;
  deliveryAddress?: string;
  comment?: string;
  createdAt: string;
  items: OrderItem[];
};

export const createOrder = async (payload: CreateOrderPayload) => {
  const response = await api.post('/orders', payload);
  return response.data;
};

// ← добавь этот метод
export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};