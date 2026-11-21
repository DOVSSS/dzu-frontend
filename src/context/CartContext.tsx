import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import type { Product } from '../types/api.types';

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartLine[];
  totalCount: number;
  subtotal: number;
  getQuantity: (productId: string) => number;
  addItem: (product: Product, restaurantId: string, restaurantName: string) => void;
  increment: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [items, setItems] = useState<CartLine[]>([]);

  const clear = useCallback(() => {
    setRestaurantId(null);
    setRestaurantName(null);
    setItems([]);
  }, []);

  const commitAdd = useCallback((
    product: Product,
    nextRestaurantId: string,
    nextRestaurantName: string,
    reset: boolean,
  ) => {
    setRestaurantId(nextRestaurantId);
    setRestaurantName(nextRestaurantName);
    setItems(prev => {
      const base = reset ? [] : prev;
      const existing = base.find(i => i.productId === product.id);
      if (existing) {
        return base.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...base, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      }];
    });
  }, []);

  const addItem = useCallback((
    product: Product,
    nextRestaurantId: string,
    nextRestaurantName: string,
  ) => {
    if (product.isAvailable === false) return;

    if (restaurantId && restaurantId !== nextRestaurantId && items.length > 0) {
      Alert.alert(
        'Очистить корзину?',
        `В корзине блюда из «${restaurantName}». Заменить на блюда из «${nextRestaurantName}»?`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Заменить',
            style: 'destructive',
            onPress: () => commitAdd(product, nextRestaurantId, nextRestaurantName, true),
          },
        ],
      );
      return;
    }

    commitAdd(product, nextRestaurantId, nextRestaurantName, false);
  }, [restaurantId, restaurantName, items.length, commitAdd]);

  const increment = useCallback((productId: string) => {
    setItems(prev => prev.map(i =>
      i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
    ));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const current = prev.find(i => i.productId === productId);
      if (!current) return prev;
      if (current.quantity <= 1) {
        const next = prev.filter(i => i.productId !== productId);
        if (next.length === 0) {
          setRestaurantId(null);
          setRestaurantName(null);
        }
        return next;
      }
      return prev.map(i =>
        i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i,
      );
    });
  }, []);

  const getQuantity = useCallback(
    (productId: string) => items.find(i => i.productId === productId)?.quantity ?? 0,
    [items],
  );

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextType>(() => ({
    restaurantId,
    restaurantName,
    items,
    totalCount,
    subtotal,
    getQuantity,
    addItem,
    increment,
    removeItem,
    clear,
  }), [
    restaurantId,
    restaurantName,
    items,
    totalCount,
    subtotal,
    getQuantity,
    addItem,
    increment,
    removeItem,
    clear,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
