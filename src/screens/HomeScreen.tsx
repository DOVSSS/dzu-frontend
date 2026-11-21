import React, { useCallback, memo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CachedRemoteImage from '../components/CachedRemoteImage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRestaurantsCatalog, getRestaurantById } from '../services/restaurantService';
import { useAuth } from '../context/AuthContext';
import type { RestaurantCatalogItem } from '../types/api.types';
import { COLORS } from '../constants/theme';
import { queryKeys } from '../query/keys';
import RestaurantCatalogSkeleton from '../components/RestaurantCatalogSkeleton';
import HomeHeader from '../components/HomeHeader';
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
      </View>
    </TouchableOpacity>
  );
});

function TaxiCard({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.taxiCard}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel="Заказать такси"
    >
      <View style={styles.taxiIconWrap}>
        <Ionicons name="car-outline" size={22} color="#fff" />
      </View>
      <View style={styles.taxiTextWrap}>
        <Text style={styles.taxiTitle}>Нужно такси?</Text>
        <Text style={styles.taxiSubtitle}>Укажите адрес, и такси приедет</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#7A6E66" />
    </TouchableOpacity>
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

  const openTaxi = useCallback(() => {
    requireAuth(() => navigation.navigate('TaxiOrder'));
  }, [requireAuth, navigation]);

  const listHeader = useCallback(
    () => (
      <View>
        <TaxiCard onPress={openTaxi} />
        <Text style={styles.sectionTitle}>
          {restaurants.length} ресторанов рядом
        </Text>
      </View>
    ),
    [openTaxi, restaurants.length],
  );

  const errorMessage = getApiErrorMessage(error, 'Не удалось загрузить рестораны');

  if (isLoading && restaurants.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HomeHeader />
        <View style={styles.list}>
          <TaxiCard onPress={openTaxi} />
        </View>
        <RestaurantCatalogSkeleton />
      </View>
    );
  }

  if (isError && restaurants.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HomeHeader />
        <View style={styles.list}>
          <TaxiCard onPress={openTaxi} />
        </View>
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
      <HomeHeader />

      <FlatList
        data={restaurants}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={listHeader}
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

  taxiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDE4',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 12,
  },
  taxiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taxiTextWrap: { flex: 1, gap: 2 },
  taxiTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  taxiSubtitle: { fontSize: 13, color: COLORS.textSecondary },

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
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
  errorText: { color: COLORS.error },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
});
