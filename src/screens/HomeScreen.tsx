import React, { useCallback, memo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import CachedRemoteImage from '../components/CachedRemoteImage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRestaurantsCatalog, getRestaurantById } from '../services/restaurantService';
import { useAuth } from '../context/AuthContext';
import type { RestaurantCatalogItem } from '../types/api.types';
import { COLORS } from '../constants/theme';
import { queryKeys } from '../query/keys';
import RestaurantCatalogSkeleton from '../components/RestaurantCatalogSkeleton';
import { getApiErrorMessage } from '../utils/apiError';

const SCREEN_WIDTH = Dimensions.get('window').width;
const LIST_PADDING = 16;
const CARD_WIDTH = SCREEN_WIDTH - LIST_PADDING * 2;
/** Banner aspect ratio width : height = 2.8 : 1 */
const CARD_IMAGE_HEIGHT = CARD_WIDTH / 2.8;
/** ~2× card width for retina thumbnails */
const RESTAURANT_THUMB_WIDTH = Math.ceil(CARD_WIDTH * 2);

type RestaurantCardProps = {
  item: RestaurantCatalogItem;
  cardWidth: number;
  onPress: (item: RestaurantCatalogItem) => void;
  onPressIn: (id: string) => void;
};

const RestaurantCard = memo(function RestaurantCard({
  item,
  cardWidth,
  onPress,
  onPressIn,
}: RestaurantCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => onPress(item)}
      onPressIn={() => onPressIn(item.id)}
      activeOpacity={0.85}
    >
      <View style={styles.cardImageWrapper}>
        <CachedRemoteImage
          path={item.image}
          width={RESTAURANT_THUMB_WIDTH}
          quality={82}
          style={[styles.cardImage, item.isOpen === false && styles.cardImageClosed]}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
        {item.isOpen === false && (
          <View style={styles.closedOverlay} />
        )}
        {item.isOpen === false && (
          <View style={styles.closedBadge}>
            <Text style={styles.closedBadgeText}>Закрыто</Text>
          </View>
        )}
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{item.productCount} блюд</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSlug} numberOfLines={1}>/{item.slug}</Text>
      </View>
    </TouchableOpacity>
  );
});

function HomeHeader({
  requireAuth,
  navigation,
}: {
  requireAuth: (action: () => void) => void;
  navigation: { navigate: (screen: string) => void };
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.profileBtn}
        onPress={() => requireAuth(() => navigation.navigate('Profile'))}
      >
        <Text style={styles.profileBtnText}>👤 Профиль</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.ordersBtn}
        onPress={() => requireAuth(() => navigation.navigate('Orders'))}
      >
        <Text style={styles.ordersBtnText}>📦 Заказы</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.taxiBtn}
        onPress={() => requireAuth(() => navigation.navigate('TaxiOrder'))}
        accessibilityLabel="Заказать такси"
      >
        <Text style={styles.taxiBtnText}>🚕</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { requireAuth } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: restaurants = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.restaurantsCatalog,
    queryFn: getRestaurantsCatalog,
    staleTime: 5 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 8000),
  });

  const prefetchRestaurant = useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.restaurant(id),
        queryFn: () => getRestaurantById(id),
        staleTime: 5 * 60_000,
      });
    },
    [queryClient],
  );

  const openRestaurant = useCallback(
    (item: RestaurantCatalogItem) => {
      navigation.navigate('Restaurant', { restaurantId: item.id, name: item.name });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: RestaurantCatalogItem }) => (
      <RestaurantCard
        item={item}
        cardWidth={CARD_WIDTH}
        onPress={openRestaurant}
        onPressIn={prefetchRestaurant}
      />
    ),
    [openRestaurant, prefetchRestaurant],
  );

  const keyExtractor = useCallback((item: RestaurantCatalogItem) => item.id, []);

  const errorMessage = getApiErrorMessage(error, 'Не удалось загрузить рестораны');

  if (isLoading && restaurants.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HomeHeader requireAuth={requireAuth} navigation={navigation} />
        <RestaurantCatalogSkeleton />
      </View>
    );
  }

  if (isError && restaurants.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HomeHeader requireAuth={requireAuth} navigation={navigation} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.btn}>
            <Text style={styles.btnText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HomeHeader requireAuth={requireAuth} navigation={navigation} />

      <FlatList
        data={restaurants}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            {restaurants.length} ресторанов рядом
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>Рестораны не найдены</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  ordersBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  ordersBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  taxiBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20,
  },
  taxiBtnText: { fontSize: 20 },

  list: { padding: LIST_PADDING, paddingBottom: 32 },
  sectionTitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 14 },

  card: {
    backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardImageWrapper: { position: 'relative' },
  cardImage: { width: '100%', height: CARD_IMAGE_HEIGHT, backgroundColor: COLORS.border },
  cardImageClosed: { opacity: 0.5 },
  closedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  closedBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  closedBadgeText: { color: '#ffcccc', fontSize: 11, fontWeight: '700' },
  countBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  countBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardBody: { padding: 10, gap: 2 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardSlug: { fontSize: 11, color: COLORS.textMuted },

  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
  errorText: { color: COLORS.error },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '600' },

  profileBtn: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  profileBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
});
