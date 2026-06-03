// ============================================
// USER
// Соответствует модели User в Prisma
// Пароль НИКОГДА не возвращаем на клиент
// ============================================
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

// ============================================
// RESTAURANT
// Соответствует модели Restaurant в Prisma
// ============================================
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
   products: Product[];
}

// ============================================
// PRODUCT
// Соответствует модели Product в Prisma
// price: Int → number (копейки или целые единицы — зависит от бэка)
// ============================================
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;       // Int в Prisma
  image: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

// Restaurant с вложенными продуктами
// Используется на экране меню ресторана
export interface RestaurantWithProducts extends Restaurant {
  products: Product[];
}

// ============================================
// ORDER
// ============================================
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;   // @map("product_name") — денормализовано
  productImage: string;  // @map("product_image") — денормализовано
}

export interface Order {
  id: string;
  reference: string;         // уникальный номер заказа
  status: OrderStatus;
  total: number;
  deliveryAddress: string | null;   // String? в Prisma
  deliveryTime: string | null;      // DateTime? → string | null
  comment: string | null;           // String? в Prisma
  userId: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// AUTH — запросы и ответы
// ============================================
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

// ============================================
// CREATE ORDER — тело запроса
// ============================================
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
  deliveryTime?: string;  // ISO string
  comment?: string;
}