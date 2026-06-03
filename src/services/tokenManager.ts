import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from '../constants/storageKeys';

// Токен хранится в памяти — синхронный доступ
let memoryToken: string | null = null;

export const TokenManager = {
  // Вызывать при старте приложения
  async init(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      memoryToken = token;
    } catch {
      memoryToken = null;
    }
  },

  getToken(): string | null {
    return memoryToken;
  },

  async setToken(token: string): Promise<void> {
    memoryToken = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async clearToken(): Promise<void> {
    memoryToken = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};