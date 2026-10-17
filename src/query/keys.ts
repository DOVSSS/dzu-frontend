export const queryKeys = {
  restaurantsCatalog: ['restaurants', 'catalog'] as const,
  restaurant: (id: string) => ['restaurants', id] as const,
  settings: ['settings'] as const,
  myOrders: ['orders', 'my'] as const,
};
