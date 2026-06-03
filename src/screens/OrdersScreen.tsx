import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { getMyOrders, Order } from '../services/orderService';
import { COLORS, STATUS_MAP } from '../constants/theme';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      setError('');
      const data = await getMyOrders();
      setOrders(data);
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Ошибка загрузки';
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); loadOrders(); }, []);

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={loadOrders} style={styles.btn}>
        <Text style={styles.btnText}>Повторить</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
      ListHeaderComponent={
        orders.length > 0
          ? <Text style={styles.count}>{orders.length} заказов</Text>
          : null
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Заказов пока нет</Text>
          <Text style={styles.emptySubtitle}>Сделайте первый заказ!</Text>
        </View>
      }
      renderItem={({ item }) => {
        const status = STATUS_MAP[item.status] ?? { label: item.status, color: COLORS.textMuted };
        return (
          <View style={styles.card}>
            {/* Цветная полоска */}
            <View style={[styles.cardAccent, { backgroundColor: status.color }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.reference}>#{item.reference}</Text>
                <View style={[styles.badge, { backgroundColor: status.color + '18' }]}>
                  <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>

              {item.items.map(i => (
                <View key={i.id} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>{i.productName}</Text>
                  <Text style={styles.itemMeta}>{i.quantity} × {i.price} ₽</Text>
                </View>
              ))}

              <View style={styles.cardFooter}>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.total}>{item.total} ₽</Text>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32, backgroundColor: COLORS.background, flexGrow: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 24 },
  count: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },

  card: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16,
    marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardAccent: { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reference: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { flex: 1, fontSize: 13, color: COLORS.text, marginRight: 8 },
  itemMeta: { fontSize: 13, color: COLORS.textSecondary },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  date: { fontSize: 12, color: COLORS.textMuted },
  total: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
  errorText: { color: COLORS.error, fontSize: 15 },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
});