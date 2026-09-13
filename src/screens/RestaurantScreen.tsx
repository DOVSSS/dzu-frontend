import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Image, Dimensions, ScrollView,
} from 'react-native';
import type { Restaurant, Product, Category } from '../types/api.types';
import { createOrder } from '../services/orderService';
import { getRestaurantById } from '../services/restaurantService';
import { getSettings, Settings } from '../services/settingsService';
import { COLORS } from '../constants/theme';
import { API_URL } from '../constants/storageKeys';
import { useAuth } from '../context/AuthContext';
import * as Location from 'expo-location';
const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = { route: { params: { restaurant: Restaurant } } };

export default function RestaurantScreen({ route }: Props) {
  const restaurant = route?.params?.restaurant;
  const { requireAuth } = useAuth();
  const [restaurantData, setRestaurantData] = useState<Restaurant | null>(restaurant ?? null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({ deliveryFee: 150, serviceFee: 50 });

  useEffect(() => {
    if (!restaurant?.id) { setLoading(false); return; }
    Promise.all([
      getRestaurantById(restaurant.id),
      getSettings(),
    ]).then(([data, s]) => {
      setRestaurantData(data);
      setSettings(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const products = restaurantData?.products ?? [];

  const categories = useMemo(() => {
    const map = new Map<string, Category>();
    products.forEach(p => {
      if (p.category && p.categoryId) {
        map.set(p.categoryId, p.category);
      }
    });
    return Array.from(map.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.categoryId === selectedCategory);
  }, [products, selectedCategory]);

  const addToCart = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const removeFromCart = (id: string) => setCart(prev => {
    if ((prev[id] ?? 0) <= 1) { const { [id]: _, ...rest } = prev; return rest; }
    return { ...prev, [id]: prev[id] - 1 };
  });

  const cartItems = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
  const totalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, { productId, quantity }) => {
    const p = products.find(p => p.id === productId);
    return sum + (p?.price ?? 0) * quantity;
  }, 0);
  const totalPrice = subtotal + settings.deliveryFee + settings.serviceFee;
  const isOpen = restaurantData?.isOpen !== false;

  const handleOrder = async () => {
    if (!isOpen) {
      Alert.alert('Ресторан закрыт', 'Сейчас нельзя оформить заказ — ресторан не работает.');
      return;
    }
    if (!cartItems.length) return;
    setIsOrdering(true);
    try {
      let deliveryLat: number | undefined;
      let deliveryLng: number | undefined;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          deliveryLat = location.coords.latitude;
          deliveryLng = location.coords.longitude;
        } catch {
          // GPS timeout/error — continue without coordinates
        }
      }

      const order = await createOrder({
        items: cartItems,
        ...(deliveryLat != null && deliveryLng != null ? { deliveryLat, deliveryLng } : {}),
      });
      setCart({});
      Alert.alert('✅ Заказ оформлен!', `Номер заказа: #${order.reference}`);
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Не удалось оформить заказ';
      Alert.alert('Ошибка', Array.isArray(message) ? message[0] : message);
    } finally {
      setIsOrdering(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const qty = cart[item.id] ?? 0;
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${API_URL}${item.image}` }}
            style={styles.productImage}
            resizeMode="contain"
          />
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>{item.price} ₽</Text>
          </View>
          <View style={styles.controlsOverlay}>
            {qty > 0 && (
              <>
                <TouchableOpacity style={styles.controlBtn} onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.controlText}>−</Text>
                </TouchableOpacity>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>{qty}</Text>
                </View>
              </>
            )}
            <TouchableOpacity
              style={[styles.controlBtn, styles.controlBtnPrimary]}
              onPress={() => addToCart(item.id)}
            >
              <Text style={[styles.controlText, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.productDescription} numberOfLines={1}>{item.description}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (!restaurantData) return (
    <View style={styles.centered}>
      <Text style={{ color: COLORS.textSecondary }}>Ресторан не найден</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.listHeader}>
              <Text style={styles.header}>{restaurantData.name}</Text>
              <Text style={styles.subheader}>{products.length} позиций в меню</Text>
            </View>

            {!isOpen && (
              <View style={styles.closedBanner}>
                <Text style={styles.closedBannerTitle}>Ресторан закрыт</Text>
                {restaurantData.openTime ? (
                  <Text style={styles.closedBannerSubtitle}>
                    Откроется в {restaurantData.openTime}
                  </Text>
                ) : null}
              </View>
            )}

            {categories.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
                contentContainerStyle={styles.categoriesContent}
              >
                <TouchableOpacity
                  style={[styles.chip, !selectedCategory && styles.chipActive]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>
                    Все
                  </Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
                    onPress={() => setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )}
                  >
                    <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>
              {selectedCategory ? 'Нет блюд в этой категории' : 'Меню пусто'}
            </Text>
          </View>
        }
        renderItem={renderProduct}
      />

      {totalCount > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartDetails}>
            <View style={styles.cartRow}>
              <Text style={styles.cartLabel}>Блюда ({totalCount})</Text>
              <Text style={styles.cartValue}>{subtotal} ₽</Text>
            </View>
            <View style={styles.cartRow}>
              <Text style={styles.cartLabel}>Доставка</Text>
              <Text style={styles.cartValue}>{settings.deliveryFee} ₽</Text>
            </View>
            <View style={styles.cartRow}>
              <Text style={styles.cartLabel}>Сервисный сбор</Text>
              <Text style={styles.cartValue}>{settings.serviceFee} ₽</Text>
            </View>
            <View style={[styles.cartRow, styles.cartTotalRow]}>
              <Text style={styles.cartTotalLabel}>Итого</Text>
              <Text style={styles.cartTotalValue}>{totalPrice} ₽</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.orderButton, (isOrdering || !isOpen) && styles.orderButtonDisabled]}
            onPress={() => requireAuth(handleOrder)}
            disabled={isOrdering || !isOpen}
          >
            {isOrdering
              ? <ActivityIndicator color={COLORS.text} size="small" />
              : <Text style={styles.orderButtonText}>
                  {isOpen ? 'Оформить заказ · 20-60 мин' : 'Ресторан закрыт'}
                </Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 220 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listHeader: { marginBottom: 12 },
  header: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subheader: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  closedBanner: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffcc80',
  },
  closedBannerTitle: { fontSize: 15, fontWeight: '700', color: '#e65100' },
  closedBannerSubtitle: { fontSize: 13, color: '#bf360c', marginTop: 4 },

  categoriesScroll: { marginBottom: 16 },
  categoriesContent: { gap: 8, paddingRight: 16 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  chipTextActive: { color: COLORS.primary, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: SCREEN_WIDTH - 32,
    backgroundColor: '#f8f8f8',
  },
  priceBadge: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  priceBadgeText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  controlsOverlay: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  qtyBadge: {
    minWidth: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 6,
  },
  qtyBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cardBody: { padding: 10, gap: 2 },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  productDescription: { fontSize: 12, color: COLORS.textMuted },
  controlBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  controlBtnPrimary: { backgroundColor: COLORS.primary },
  controlText: { fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 20 },

  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },

  cartBar: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: COLORS.text, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  cartDetails: { marginBottom: 12 },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cartLabel: { color: '#94a3b8', fontSize: 13 },
  cartValue: { color: '#fff', fontSize: 13 },
  cartTotalRow: {
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
  },
  cartTotalLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cartTotalValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  orderButton: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  orderButtonDisabled: { opacity: 0.6 },
  orderButtonText: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
});