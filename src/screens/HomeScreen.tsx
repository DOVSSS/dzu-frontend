import React, { useEffect, useState } from 'react';
import {
  View, Text, ActivityIndicator, FlatList, TouchableOpacity,
  StyleSheet, Image, Dimensions, StatusBar,
} from 'react-native';
import { getRestaurants } from '../services/restaurantService';
import { useAuth } from '../context/AuthContext';
import type { Restaurant } from '../types/api.types';
import { COLORS } from '../constants/theme';
import { API_URL } from '../constants/storageKeys';


const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

export default function HomeScreen({ navigation }: any) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();

  useEffect(() => { loadRestaurants(); }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={loadRestaurants} style={styles.btn}>
        <Text style={styles.btnText}>Повторить</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

{/* Хедер */}
<View style={styles.header}>
  <TouchableOpacity
    style={styles.profileBtn}
    onPress={() => navigation.navigate('Profile')}
  >
    <Text style={styles.profileBtnText}>👤 Профиль</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.ordersBtn}
    onPress={() => navigation.navigate('Orders')}
  >
    <Text style={styles.ordersBtnText}>📦 Заказы</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
    <Text style={styles.logoutText}>Выйти</Text>
  </TouchableOpacity>
</View>

      <FlatList
        data={restaurants}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { width: CARD_WIDTH }]}
            onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: `${API_URL}${item.image}` }}
              style={styles.cardImage}
            />
            {/* Бейдж количества блюд */}
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{item.products?.length ?? 0} блюд</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardSlug} numberOfLines={1}>/{item.slug}</Text>
            </View>
          </TouchableOpacity>
        )}
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
  greeting: { fontSize: 13, color: COLORS.textSecondary },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  headerActions: { alignItems: 'flex-end', gap: 6 },
  ordersBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  ordersBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  logoutBtn: { padding: 4 },
  logoutText: { fontSize: 12, color: COLORS.textMuted },

  list: { padding: 16, paddingBottom: 32 },
  row: { gap: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 14 },

  card: {
    backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardImage: { width: '100%', height: CARD_WIDTH * 0.75, backgroundColor: COLORS.border },
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