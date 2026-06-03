import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import type { Restaurant, Product } from '../types/api.types';
import { createOrder } from '../services/orderService';
import { COLORS } from '../constants/theme';
import { API_URL } from '../constants/storageKeys';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

type Props = { route: { params: { restaurant: Restaurant } } };

export default function RestaurantScreen({ route }: Props) {
  const { restaurant } = route.params;
  const products = restaurant.products ?? [];
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isOrdering, setIsOrdering] = useState(false);

  const addToCart = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const removeFromCart = (id: string) => setCart(prev => {
    if ((prev[id] ?? 0) <= 1) { const { [id]: _, ...rest } = prev; return rest; }
    return { ...prev, [id]: prev[id] - 1 };
  });

  const cartItems = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
  const totalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, { productId, quantity }) => {
    const p = products.find(p => p.id === productId);
    return sum + (p?.price ?? 0) * quantity;
  }, 0);

  const handleOrder = async () => {
    if (!cartItems.length) return;
    setIsOrdering(true);
    try {
      const order = await createOrder({ items: cartItems });
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
      <View style={[styles.card, { width: CARD_WIDTH }]}>
        <Image
          source={{ uri: `${API_URL}${item.image}` }}
          style={styles.productImage}
        />
        {qty > 0 && (
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyBadgeText}>{qty}</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.productPrice}>{item.price} ₽</Text>
            <View style={styles.controls}>
              {qty > 0 && (
                <TouchableOpacity style={styles.controlBtn} onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.controlText}>−</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.controlBtn, styles.controlBtnPrimary]}
                onPress={() => addToCart(item.id)}
              >
                <Text style={[styles.controlText, { color: '#fff' }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.header}>{restaurant.name}</Text>
            <Text style={styles.subheader}>{products.length} позиций в меню</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>Меню пусто</Text>
          </View>
        }
        renderItem={renderProduct}
      />

      {totalCount > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartInfo}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{totalCount}</Text>
            </View>
            <Text style={styles.cartTotal}>{totalPrice} ₽</Text>
          </View>
          <TouchableOpacity
            style={[styles.orderButton, isOrdering && styles.orderButtonDisabled]}
            onPress={handleOrder}
            disabled={isOrdering}
          >
            {isOrdering
              ? <ActivityIndicator color={COLORS.text} size="small" />
              : <Text style={styles.orderButtonText}>Оформить заказ</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 110 },
  row: { gap: 12, marginBottom: 12 },
  centered: { alignItems: 'center', paddingTop: 60 },
  listHeader: { marginBottom: 16 },
  header: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subheader: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  card: {
    backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  productImage: { width: '100%', height: CARD_WIDTH * 0.75, backgroundColor: COLORS.border },
  qtyBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cardBody: { padding: 10, gap: 3 },
  productName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  productDescription: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  productPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  controls: { flexDirection: 'row', gap: 6 },
  controlBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  controlBtnPrimary: { backgroundColor: COLORS.primary },
  controlText: { fontSize: 16, fontWeight: '700', color: COLORS.text, lineHeight: 18 },

  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },

  cartBar: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: COLORS.text, borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  cartInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartCountBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  cartCountText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cartTotal: { color: '#fff', fontSize: 16, fontWeight: '600' },
  orderButton: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 18,
  },
  orderButtonDisabled: { opacity: 0.6 },
  orderButtonText: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
});