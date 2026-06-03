// src/context/auth.types.ts
import { User } from '../types/api.types';

export type { User }; // реэкспортируем для удобства

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, address: string) => Promise<void>;
  logout: () => Promise<void>;
}