import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import CachedRemoteImage from '../components/CachedRemoteImage';
import { useCart, CartLine } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { getRestaurantById } from '../services/restaurantService';
import { getSettings } from '../services/settingsService';
import { queryKeys } from '../query/keys';
import { COLORS } from '../constants/theme';

const THUMB = 64;

function CartLineRow({
  item,
  onAdd,
  onRemove,
}: {
  item: CartLine;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.line}>
      <CachedRemoteImage
        path={item.image}
        width={THUMB * 2}
        quality={70}
        style={styles.thumb}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.lineBody}>
        <Text style={styles.lineName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.linePrice}>{item.price * item.quantity} ₽</Text>
      </View>
      <View style={styles.qtyControls}>
        <TouchableOpacity style={styles.qtyBtn} onPress={onRemove} accessibilityLabel="Убавить">
          <Ionicons name="remove" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={onAdd} accessibilityLabel="Добавить">
          <Ionicons name="add" size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const {
    items,
    restaurantId,
    restaurantName,
    totalCount,
    subtotal,
    increment,
    removeItem,
    clear,
  } = useCart();
  const { user, requireAuth } = useAuth();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState(user?.address ?? '');
  const [comment, setComment] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    if (user?.address) {
      setAddress(prev => (prev.trim() ? prev : user.address));
    }
  }, [user?.address]);

  const { data: settings } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    staleTime: Infinity,
  });

  const { data: restaurant } = useQuery({
    queryKey: queryKeys.restaurant(restaurantId ?? ''),
    queryFn: () => getRestaurantById(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 60_000,
  });

  const deliveryFee = settings?.deliveryFee ?? 0;
  const serviceFee = settings?.serviceFee ?? 0;
  const totalPrice = subtotal + deliveryFee + serviceFee;
  const isOpen = restaurant?.isOpen !== false;

  const handleOrder = async () => {
    if (!items.length || !restaurantId) return;
    if (!address.trim()) {
      Alert.alert('Адрес', 'Укажите адрес доставки');
      return;
    }

    setIsOrdering(true);
    try {
      const fresh = await queryClient.fetchQuery({
        queryKey: queryKeys.restaurant(restaurantId),
        queryFn: () => getRestaurantById(restaurantId),
        staleTime: 0,
      });
      if (fresh.isOpen === false) {
        Alert.alert(
          'Ресторан закрыт',
          fresh.openTime
            ? `Сейчас нельзя оформить заказ. Откроется в ${fresh.openTime}.`
            : 'Сейчас нельзя оформить заказ — ресторан не работает.',
        );
        return;
      }

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
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: address.trim(),
        comment: comment.trim() || undefined,
        ...(deliveryLat != null && deliveryLng != null ? { deliveryLat, deliveryLng } : {}),
      });

      clear();
      setComment('');
      await queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
      Alert.alert('Заказ оформлен', `Номер заказа: #${order.reference}`);
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Не удалось оформить заказ';
      Alert.alert('Ошибка', Array.isArray(message) ? message[0] : message);
    } finally {
      setIsOrdering(false);
    }
  };

  if (totalCount === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bag-handle-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Корзина пуста</Text>
        <Text style={styles.emptyHint}>Добавьте блюда из меню ресторана</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.productId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fromLabel}>Заказ из</Text>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {restaurantName ?? 'Ресторан'}
                </Text>
              </View>
              <TouchableOpacity onPress={clear} hitSlop={8}>
                <Text style={styles.clearText}>Очистить</Text>
              </TouchableOpacity>
            </View>
            {!isOpen && (
              <View style={styles.closedBanner}>
                <Text style={styles.closedBannerTitle}>Ресторан закрыт</Text>
                {restaurant?.openTime ? (
                  <Text style={styles.closedBannerSubtitle}>
                    Откроется в {restaurant.openTime}
                  </Text>
                ) : (
                  <Text style={styles.closedBannerSubtitle}>
                    Сейчас нельзя оформить заказ
                  </Text>
                )}
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <CartLineRow
            item={item}
            onAdd={() => increment(item.productId)}
            onRemove={() => removeItem(item.productId)}
          />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.fieldLabel}>Адрес доставки</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={address}
              onChangeText={setAddress}
              placeholder="ул. Пушкина, д. 1"
              placeholderTextColor={COLORS.textMuted}
              multiline
            />

            <Text style={styles.fieldLabel}>Комментарий</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={comment}
              onChangeText={setComment}
              placeholder="Подъезд, домофон, пожелания…"
              placeholderTextColor={COLORS.textMuted}
              multiline
            />

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Блюда ({totalCount})</Text>
                <Text style={styles.summaryValue}>{subtotal} ₽</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Доставка</Text>
                <Text style={styles.summaryValue}>{deliveryFee} ₽</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Сервисный сбор</Text>
                <Text style={styles.summaryValue}>{serviceFee} ₽</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Итого</Text>
                <Text style={styles.totalValue}>{totalPrice} ₽</Text>
              </View>
            </View>
          </View>
        }
      />

      <View style={styles.checkoutBar}>
        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            (isOrdering || !isOpen) && styles.checkoutBtnDisabled,
          ]}
          onPress={() => requireAuth(handleOrder)}
          disabled={isOrdering || !isOpen}
        >
          {isOrdering
            ? <ActivityIndicator color="#fff" />
            : (
              <Text style={styles.checkoutText}>
                {isOpen ? `Оформить заказ · ${totalPrice} ₽` : 'Ресторан закрыт'}
              </Text>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  empty: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  emptyHint: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },

  list: { padding: 16, paddingBottom: 100 },
  headerBlock: { marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fromLabel: { fontSize: 12, color: COLORS.textSecondary },
  restaurantName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  clearText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },
  closedBanner: {
    marginTop: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffcc80',
  },
  closedBannerTitle: { fontSize: 15, fontWeight: '700', color: '#e65100' },
  closedBannerSubtitle: { fontSize: 13, color: '#bf360c', marginTop: 4 },

  line: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    gap: 10,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  lineBody: { flex: 1, gap: 4 },
  lineName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  linePrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { minWidth: 20, textAlign: 'center', fontWeight: '700', color: COLORS.text },

  footer: { marginTop: 8, gap: 6 },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },

  summary: {
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  summaryTotal: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 16, fontWeight: '700', color: COLORS.primary },

  checkoutBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutBtnDisabled: { opacity: 0.6 },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
