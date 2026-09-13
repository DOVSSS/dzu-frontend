
export type UserRole = 'USER' | 'RESTAURANT' | 'COURIER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;  
  role: UserRole;      
  avatarPath?: string;  
  phone: string; 
  address: string      
  createdAt?: string;
  updatedAt?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  openTime?: string | null;
  closeTime?: string | null;
  isOpen?: boolean;
   products: Product[];
}


export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
}


export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  categoryId?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantWithProducts extends Restaurant {
  products: Product[];
}


export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;   
  productImage: string;  
}

export interface Order {
  id: string;
  reference: string;         
  status: OrderStatus;
  total: number;
  deliveryAddress: string | null;   
  deliveryTime: string | null;      
  comment: string | null;           
  userId: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;   // ← было token
  refreshToken: string;  // ← добавляем
}


export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage: string;
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  deliveryAddress: string;
  deliveryTime?: string;  
  comment?: string;
  deliveryLat?: number;
  deliveryLng?: number;
}