import React, { useState, useMemo, useCallback, memo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  View, Text, SectionList, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Dimensions, ScrollView,
} from 'react-native';
import CachedRemoteImage from '../components/CachedRemoteImage';
import type { Product, Category } from '../types/api.types';
import { createOrder } from '../services/orderService';
import { getRestaurantById } from '../services/restaurantService';
import { getSettings, Settings } from '../services/settingsService';
import { queryKeys } from '../query/keys';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import * as Location from 'expo-location';
const SCREEN_WIDTH = Dimensions.get('window').width;
const LIST_PADDING = 16;
const COLUMN_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - LIST_PADDING * 2 - COLUMN_GAP) / 2;
/** Menu grid: square-ish preview (1:1) */
const PRODUCT_IMAGE_HEIGHT = CARD_WIDTH;
const PRODUCT_THUMB_WIDTH = Math.ceil(CARD_WIDTH * 2);

const DEFAULT_SETTINGS: Settings = { deliveryFee: 150, serviceFee: 50, taxiFee: 200 };

const compareByName = (a: Product, b: Product) =>
  a.name.localeCompare(b.name, 'ru');

type ProductPair = {
  key: string;
  left: Product;
  right?: Product;
};

type MenuSection = {
  key: string;
  title: string;
  emoji?: string;
  data: ProductPair[];
};

function pairProducts(items: Product[]): ProductPair[] {
  const sorted = [...items].sort(compareByName);
  const pairs: ProductPair[] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    const left = sorted[i];
    const right = sorted[i + 1];
    pairs.push({
      key: right ? `${left.id}-${right.id}` : left.id,
      left,
      right,
    });
  }
  return pairs;
}

type Props = { route: { params: { restaurantId: string; name: string } } };

type ProductRowProps = {
  item: Product;
  cardWidth: number;
  qty: number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
};

const ProductRow = memo(function ProductRow({
  item,
  cardWidth,
  qty,
  onAdd,
  onRemove,
}: ProductRowProps) {
  const unavailable = item.isAvailable === false;

  return (
    <View style={[styles.card, { width: cardWidth }, unavailable && styles.cardUnavailable]}>
      <View style={styles.imageContainer}>
        <CachedRemoteImage
          path={item.image}
          width={PRODUCT_THUMB_WIDTH}
          quality={85}
          style={[styles.productImage, unavailable && styles.productImageDimmed]}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>{item.price} ₽</Text>
        </View>
        {unavailable && qty === 0 ? (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableOverlayText}>Временно недоступно</Text>
          </View>
        ) : (
          <View style={styles.controlsOverlay}>
            {qty > 0 && (
              <>
                <TouchableOpacity style={styles.controlBtn} onPress={() => onRemove(item.id)}>
                  <Text style={styles.controlText}>−</Text>
                </TouchableOpacity>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>{qty}</Text>
                </View>
              </>
            )}
            {!unavailable && (
              <TouchableOpacity
                style={[styles.controlBtn, styles.controlBtnPrimary]}
                onPress={() => onAdd(item.id)}
              >
                <Text style={[styles.controlText, { color: '#fff' }]}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.productName, unavailable && styles.productNameMuted]} numberOfLines={1}>
          {item.name}
        </Text>
        {unavailable ? (
          <Text style={styles.unavailableCaption}>Временно недоступно</Text>
        ) : item.description ? (
          <Text style={styles.productDescription}>{item.description}</Text>
        ) : null}
      </View>
    </View>
  );
});

type ProductGridRowProps = {
  pair: ProductPair;
  cardWidth: number;
  cart: Record<string, number>;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
};

const ProductGridRow = memo(function ProductGridRow({
  pair,
  cardWidth,
  cart,
  onAdd,
  onRemove,
}: ProductGridRowProps) {
  return (
    <View style={styles.productGridRow}>
      <ProductRow
        item={pair.left}
        cardWidth={cardWidth}
        qty={cart[pair.left.id] ?? 0}
        onAdd={onAdd}
        onRemove={onRemove}
      />
      {pair.right ? (
        <ProductRow
          item={pair.right}
          cardWidth={cardWidth}
          qty={cart[pair.right.id] ?? 0}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ) : (
        <View style={{ width: cardWidth }} />
      )}
    </View>
  );
});

export default function RestaurantScreen({ route }: Props) {
  const { restaurantId } = route.params;
  const { requireAuth } = useAuth();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: restaurantData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.restaurant(restaurantId),
    queryFn: () => getRestaurantById(restaurantId),
    staleTime: 5 * 60_000,
  });

  const { data: settings = DEFAULT_SETTINGS } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    staleTime: Infinity,
  });

  const products = restaurantData?.products ?? [];

  const categories = useMemo(() => {
    const map = new Map<string, Category>();
    products.forEach(p => {
      if (p.category && p.categoryId) {
        map.set(p.categoryId, p.category);
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'ru'),
    );
  }, [products]);

  const menuSections = useMemo((): MenuSection[] => {
    const buildSection = (
      key: string,
      title: string,
      emoji: string | undefined,
      items: Product[],
    ): MenuSection | null => {
      if (items.length === 0) return null;
      return {
        key,
        title,
        emoji,
        data: pairProducts(items),
      };
    };

    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      const items = products.filter(p => p.categoryId === selectedCategory);
      const section = buildSection(
        selectedCategory,
        cat?.name ?? '',
        cat?.emoji,
        items,
      );
      return section ? [section] : [];
    }

    const sections: MenuSection[] = [];
    for (const cat of categories) {
      const section = buildSection(
        cat.id,
        cat.name,
        cat.emoji,
        products.filter(p => p.categoryId === cat.id),
      );
      if (section) sections.push(section);
    }

    const withoutCategory = buildSection(
      '__uncategorized__',
      'Без категории',
      undefined,
      products.filter(p => !p.categoryId),
    );
    if (withoutCategory) sections.push(withoutCategory);

    return sections;
  }, [products, categories, selectedCategory]);

  const menuIsEmpty = menuSections.every(s => s.data.length === 0);

  const addToCart = useCallback(
    (id: string) => {
      const product = products.find(p => p.id === id);
      if (product?.isAvailable === false) return;
      setCart(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    },
    [products],
  );
  const removeFromCart = useCallback((id: string) => {
    setCart(prev => {
      if ((prev[id] ?? 0) <= 1) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: prev[id] - 1 };
    });
  }, []);

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
      await queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
      Alert.alert('✅ Заказ оформлен!', `Номер заказа: #${order.reference}`);
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Не удалось оформить заказ';
      Alert.alert('Ошибка', Array.isArray(message) ? message[0] : message);
    } finally {
      setIsOrdering(false);
    }
  };

  const renderProduct = useCallback(
    ({ item }: { item: ProductPair }) => (
      <ProductGridRow
        pair={item}
        cardWidth={CARD_WIDTH}
        cart={cart}
        onAdd={addToCart}
        onRemove={removeFromCart}
      />
    ),
    [cart, addToCart, removeFromCart],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: MenuSection }) => (
      <View style={styles.sectionHeader}>
        {section.emoji ? (
          <Text style={styles.sectionEmoji}>{section.emoji}</Text>
        ) : null}
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: ProductPair) => item.key, []);

  if (isLoading && !restaurantData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isError || !restaurantData) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.textSecondary }}>Ресторан не найден</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.menuStickyHeader}>
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

      <SectionList
        style={styles.menuList}
        sections={menuSections}
        keyExtractor={keyExtractor}
        extraData={cart}
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={
          menuIsEmpty ? (
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>
                {selectedCategory ? 'Нет блюд в этой категории' : 'Меню пусто'}
              </Text>
            </View>
          ) : null
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
  menuList: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 220 },
  menuStickyHeader: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
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

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionEmoji: { fontSize: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },

  productGridRow: {
    flexDirection: 'row',
    gap: COLUMN_GAP,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardUnavailable: { opacity: 0.92 },
  productImageDimmed: { opacity: 0.55 },
  unavailableOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unavailableOverlayText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  unavailableCaption: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  productNameMuted: { color: COLORS.textMuted },
  imageContainer: {
    width: '100%',
    backgroundColor: COLORS.imagePlaceholder,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: PRODUCT_IMAGE_HEIGHT,
    backgroundColor: COLORS.imagePlaceholder,
  },
  priceBadge: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  priceBadgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  controlsOverlay: {
    position: 'absolute', bottom: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  qtyBadge: {
    minWidth: 24, height: 24, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 6,
  },
  qtyBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cardBody: { padding: 8, gap: 2 },
  productName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  productDescription: { fontSize: 11, color: COLORS.textMuted, lineHeight: 15 },
  controlBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  controlBtnPrimary: { backgroundColor: COLORS.primary },
  controlText: { fontSize: 16, fontWeight: '700', color: '#fff', lineHeight: 18 },

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