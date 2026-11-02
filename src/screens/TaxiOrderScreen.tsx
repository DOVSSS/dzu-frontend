import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { createTaxiOrder } from '../services/orderService';
import { getSettings, Settings } from '../services/settingsService';
import { COLORS } from '../constants/theme';
import { queryKeys } from '../query/keys';

const DEFAULT_SETTINGS: Settings = { deliveryFee: 150, serviceFee: 50, taxiFee: 200 };

export default function TaxiOrderScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pickupAddress, setPickupAddress] = useState(user?.address ?? '');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settings = DEFAULT_SETTINGS } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (user?.address && !pickupAddress) {
      setPickupAddress(user.address);
    }
  }, [user?.address, pickupAddress]);

  const tripPrice = settings.taxiFee ?? DEFAULT_SETTINGS.taxiFee;

  const handleOrder = async () => {
    if (!pickupAddress.trim()) {
      Alert.alert('Ошибка', 'Укажите адрес подачи');
      return;
    }
    if (!destinationAddress.trim()) {
      Alert.alert('Ошибка', 'Укажите адрес назначения');
      return;
    }

    setIsSubmitting(true);
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
          // continue without coordinates
        }
      }

      const order = await createTaxiOrder({
        deliveryAddress: pickupAddress.trim(),
        destinationAddress: destinationAddress.trim(),
        comment: comment.trim() || undefined,
        ...(deliveryLat != null && deliveryLng != null ? { deliveryLat, deliveryLng } : {}),
      });

      await queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
      Alert.alert('🚕 Такси заказано!', `Номер заказа: #${order.reference}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } }; message?: string };
      const message = err?.response?.data?.message || err?.message || 'Не удалось оформить заказ';
      Alert.alert('Ошибка', Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Укажите откуда и куда поедете.
      </Text>

      <Text style={styles.label}>Адрес подачи (откуда)</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={pickupAddress}
        onChangeText={setPickupAddress}
        placeholder="Адрес подачи"
        placeholderTextColor={COLORS.textMuted}
        multiline
      />

      <Text style={styles.label}>Адрес назначения (куда) *</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={destinationAddress}
        onChangeText={setDestinationAddress}
        placeholder="Куда едем"
        placeholderTextColor={COLORS.textMuted}
        multiline
      />

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Стоимость поездки</Text>
        <Text style={styles.priceValue}>{tripPrice} ₽</Text>
      </View>

      <Text style={styles.label}>Комментарий (необязательно)</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={comment}
        onChangeText={setComment}
        placeholder="Например: подъезд 2, домофон 45"
        placeholderTextColor={COLORS.textMuted}
        multiline
      />

      <TouchableOpacity
        style={[styles.btn, isSubmitting && styles.btnDisabled]}
        onPress={handleOrder}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Заказать такси</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  lead: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 20 },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: COLORS.card, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 20, padding: 14, backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  priceLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  priceValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
