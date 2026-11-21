import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { WHATSAPP_URL, TELEGRAM_URL } from '../constants/contacts';

const LABEL = '#7A6E66';
const ADDRESS = '#1F1A17';
const PIN = '#FF6B35';
const BORDER = '#F0E2D9';

export default function HomeHeader() {
  const insets = useSafeAreaInsets();
  const { user, updateUser, requireAuth } = useAuth();
  const [supportOpen, setSupportOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [draftAddress, setDraftAddress] = useState(user?.address ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (addressOpen) {
      setDraftAddress(user?.address ?? '');
    }
  }, [addressOpen, user?.address]);

  const displayAddress = user?.address?.trim() ? user.address.trim() : 'Укажите адрес';

  const openAddressEditor = () => {
    requireAuth(() => setAddressOpen(true));
  };

  const saveAddress = async () => {
    if (!draftAddress.trim()) {
      Alert.alert('Ошибка', 'Адрес не может быть пустым');
      return;
    }
    try {
      setSaving(true);
      await updateUser({ address: draftAddress.trim() });
      setAddressOpen(false);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить адрес');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.addressHit}
          onPress={openAddressEditor}
          activeOpacity={0.7}
          accessibilityLabel="Адрес доставки"
        >
          <Text style={styles.label}>Доставка по адресу</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color={PIN} style={styles.pin} />
            <Text style={styles.address} numberOfLines={1}>
              {displayAddress}
            </Text>
            <Ionicons name="chevron-down" size={16} color={LABEL} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportHit}
          onPress={() => setSupportOpen(true)}
          activeOpacity={0.7}
          accessibilityLabel="Связаться с нами"
        >
          <View style={styles.supportBtn}>
            <Ionicons name="headset-outline" size={18} color={ADDRESS} />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={supportOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSupportOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setSupportOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Связаться с нами</Text>

            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setSupportOpen(false);
                Linking.openURL(WHATSAPP_URL);
              }}
              accessibilityLabel="WhatsApp"
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={ADDRESS} />
              <Text style={styles.sheetItemText}>WhatsApp</Text>
              <Ionicons name="chevron-forward" size={18} color={LABEL} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setSupportOpen(false);
                Linking.openURL(TELEGRAM_URL);
              }}
              accessibilityLabel="Telegram"
            >
              <Ionicons name="paper-plane-outline" size={22} color={ADDRESS} />
              <Text style={styles.sheetItemText}>Telegram</Text>
              <Ionicons name="chevron-forward" size={18} color={LABEL} />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={addressOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAddressOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setAddressOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Адрес доставки</Text>
            <TextInput
              style={styles.input}
              value={draftAddress}
              onChangeText={setDraftAddress}
              placeholder="ул. Пушкина, д. 1, кв. 10"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={saveAddress}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Сохранить</Text>}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressHit: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: LABEL,
    marginBottom: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pin: {
    marginTop: 1,
  },
  address: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: ADDRESS,
  },
  supportHit: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ADDRESS,
    marginBottom: 8,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  sheetItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: ADDRESS,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ADDRESS,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: ADDRESS,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: PIN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
