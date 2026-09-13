import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import type { User, AuthResponse } from '../types/api.types';
import type { AuthContextType } from './auth.types';
import { loginRequest, registerRequest } from '../services/authService';
import { TokenManager } from '../services/tokenManager';
import { registerForPushNotifications } from '../utils/notifications';
import api from '../services/api';
import { closeAuthModal, openAuthModal } from '../navigation/rootNavigation';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await TokenManager.init();
        const savedToken = TokenManager.getToken();
        const savedUser = TokenManager.getUser();
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        await TokenManager.clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const applyAuthResponse = async (data: AuthResponse): Promise<void> => {
    await TokenManager.setToken(data.accessToken);
    await TokenManager.setRefreshToken(data.refreshToken);
    await TokenManager.setUser(data.user);
    setToken(data.accessToken);
    setUser(data.user);
    closeAuthModal();

    const pushToken = await registerForPushNotifications();
    if (pushToken) {
      try {
        await api.patch(`/users/${data.user.id}`, { pushToken });
      } catch (e) {
      }
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    const data = await loginRequest({ email, password });
    await applyAuthResponse(data);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string,
  ): Promise<void> => {
    const data = await registerRequest({ name, email, password, phone, address });
    await applyAuthResponse(data);
  };

  const logout = async (): Promise<void> => {
    try {
      await TokenManager.clearToken();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const updateUser = async (data: Partial<User>): Promise<void> => {
    if (!user) return;
    const response = await api.patch(`/users/${user.id}`, data);
    setUser(response.data);
    await TokenManager.setUser(response.data);
  };

  const deleteAccount = async (): Promise<void> => {
  await api.delete('/users/me');
  await TokenManager.clearToken();
  setToken(null);
  setUser(null);
};

  // Гейт для действий, требующих логина (корзина, оформление заказа, профиль).
  // Если токена нет — вместо действия открываем модалку логина.
  const requireAuth = (action: () => void) => {
    if (token) {
      action();
    } else {
      openAuthModal();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        requireAuth,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};