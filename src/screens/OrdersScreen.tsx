import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, cancelOrder, Order } from '../services/orderService';
import { COLORS, STATUS_MAP } from '../constants/theme';
import { queryKeys } from '../query/keys';

const ORDERS_POLL_MS = 10_000;

export default function OrdersScreen() {
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.myOrders,
    queryFn: getMyOrders,
    enabled: isFocused,
    refetchInterval: isFocused ? ORDERS_POLL_MS : false,
    staleTime: 0,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCancel = (order: Order) => {
    Alert.alert(
      'Отменить заказ?',
      `Заказ #${order.reference} будет отменён`,
      [
        { text: 'Назад', style: 'cancel' },
        {
          text: 'Отменить',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(order.id);
              const updated = await cancelOrder(order.id);
              queryClient.setQueryData<Order[]>(queryKeys.myOrders, (prev) =>
                prev?.map(o => (o.id === updated.id ? updated : o)) ?? [updated],
              );
            } catch {
              Alert.alert('Ошибка', 'Не удалось отменить заказ');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  };

  const errorMessage =
    (error as any)?.response?.data?.message
    ?? (error as Error)?.message
    ?? 'Ошибка загрузки';

  if (isLoading && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isError && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.btn}>
          <Text style={styles.btnText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      initialNumToRender={6}
      maxToRenderPerBatch={4}
      windowSize={5}
      removeClippedSubviews
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
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
        const isDelivering = item.status === 'DELIVERING';
        const isTaxi = item.type === 'TAXI';
        const canCancel =
          item.status === 'PENDING'
          || item.status === 'ACCEPTED'
          || (isTaxi && item.status === 'READY' && !item.courier);

        return (
          <View style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: status.color }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.reference}>#{item.reference}</Text>
                <View style={styles.headerBadges}>
                  {isTaxi && (
                    <View style={styles.taxiBadge}>
                      <Text style={styles.taxiBadgeText}>🚕 Такси</Text>
                    </View>
                  )}
                  <View style={[styles.badge, { backgroundColor: status.color + '18' }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
              </View>

              {isTaxi ? (
                <View style={styles.taxiAddresses}>
                  <Text style={styles.taxiAddrLabel}>Откуда</Text>
                  <Text style={styles.taxiAddrText}>{item.deliveryAddress ?? '—'}</Text>
                  <Text style={[styles.taxiAddrLabel, { marginTop: 8 }]}>Куда</Text>
                  <Text style={styles.taxiAddrText}>{item.destinationAddress ?? '—'}</Text>
                  {item.comment ? (
                    <Text style={styles.taxiComment}>💬 {item.comment}</Text>
                  ) : null}
                </View>
              ) : (
                item.items.map(i => (
                  <View key={i.id} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={1}>{i.productName}</Text>
                    <Text style={styles.itemMeta}>{i.quantity} × {i.price} ₽</Text>
                  </View>
                ))
              )}

              {isDelivering && item.courier && (
                <View style={styles.courierBlock}>
                  <Text style={styles.courierText}>
                    🚴 {item.courier.name} · {item.courier.phone}
                  </Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.total}>{item.total} ₽</Text>
              </View>

              {canCancel && (
                <TouchableOpacity
                  style={[styles.cancelBtn, cancellingId === item.id && styles.cancelBtnDisabled]}
                  onPress={() => handleCancel(item)}
                  disabled={cancellingId === item.id}
                >
                  {cancellingId === item.id
                    ? <ActivityIndicator color={COLORS.error} size="small" />
                    : <Text style={styles.cancelBtnText}>Отменить заказ</Text>
                  }
                </TouchableOpacity>
              )}
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
  headerBadges: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  taxiBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  taxiBadgeText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  taxiAddresses: { marginBottom: 4 },
  taxiAddrLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  taxiAddrText: { fontSize: 13, color: COLORS.text, marginTop: 2 },
  taxiComment: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8, fontStyle: 'italic' },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { flex: 1, fontSize: 13, color: COLORS.text, marginRight: 8 },
  itemMeta: { fontSize: 13, color: COLORS.textSecondary },

  courierBlock: {
    backgroundColor: '#FFF7ED', borderRadius: 8, padding: 8, marginTop: 8,
  },
  courierText: { fontSize: 13, color: '#C2410C', fontWeight: '600' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  date: { fontSize: 12, color: COLORS.textMuted },
  total: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  cancelBtn: {
    marginTop: 10, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.error,
    alignItems: 'center',
  },
  cancelBtnDisabled: { opacity: 0.5 },
  cancelBtnText: { color: COLORS.error, fontWeight: '600', fontSize: 13 },

  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
  errorText: { color: COLORS.error, fontSize: 15 },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
});
