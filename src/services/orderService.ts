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
  deliveryLat?: number;
  deliveryLng?: number;
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
  courierLat?: number | null;
  courierLng?: number | null;
  courier?: {
    name: string;
    phone: string;
  } | null;
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

export const cancelOrder = async (orderId: string): Promise<Order> => {
  const response = await api.post(`/orders/${orderId}/cancel`);
  return response.data;
};