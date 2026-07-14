import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants/storageKeys';
import { User } from '../types/api.types';

const USER_KEY = 'user_data';

let memoryToken: string | null = null;
let memoryRefreshToken: string | null = null;
let memoryUser: User | null = null;

export const TokenManager = {
  async init(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);
      memoryToken = token;
      memoryRefreshToken = refreshToken;
      memoryUser = userJson ? JSON.parse(userJson) : null;
    } catch {
      memoryToken = null;
      memoryRefreshToken = null;
      memoryUser = null;
    }
  },

  getToken(): string | null {
    return memoryToken;
  },

  getRefreshToken(): string | null {
    return memoryRefreshToken;
  },

  getUser(): User | null {
    return memoryUser;
  },

  async setToken(token: string): Promise<void> {
    memoryToken = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async setRefreshToken(refreshToken: string): Promise<void> {
    memoryRefreshToken = refreshToken;
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  async setUser(user: User): Promise<void> {
    memoryUser = user;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async clearToken(): Promise<void> {
    memoryToken = null;
    memoryRefreshToken = null;
    memoryUser = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },
};