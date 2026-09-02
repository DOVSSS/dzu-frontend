import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, updateUser,deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

const handleDeleteAccount = () => {
  Alert.alert(
    'Удалить аккаунт?',
    'Это действие необратимо. Все ваши данные профиля будут удалены.',
    [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await deleteAccount();
          } catch (e: any) {
            Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
            setIsDeleting(false);
          }
        },
      },
    ]
  );
};



  const handleSave = async () => {
    if (!address.trim()) {
      Alert.alert('Ошибка', 'Адрес не может быть пустым');
      return;
    }
    try {
      setIsSaving(true);
      await updateUser({ name, phone, address });
      Alert.alert('✅ Сохранено', 'Профиль обновлён', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Ошибка', 'Не удалось сохранить');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Имя</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ваше имя"
        placeholderTextColor={COLORS.textMuted}
      />

      <Text style={styles.label}>Телефон</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="+7 999 000 00 00"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Адрес доставки</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={address}
        onChangeText={setAddress}
        placeholder="ул. Пушкина, д. 1, кв. 10"
        placeholderTextColor={COLORS.textMuted}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.btn, isSaving && styles.btnDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Сохранить</Text>
        }
      </TouchableOpacity>


      <TouchableOpacity
  style={styles.deleteBtn}
  onPress={handleDeleteAccount}
  disabled={isDeleting}
>
  {isDeleting
    ? <ActivityIndicator color={COLORS.error} />
    : <Text style={styles.deleteBtnText}>Удалить аккаунт</Text>
  }
</TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 6 },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: COLORS.card, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  inputMultiline: { height: 90, textAlignVertical: 'top' },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 24,
  },

  deleteBtn: {
  marginTop: 16, paddingVertical: 14, alignItems: 'center',
  borderRadius: 12, borderWidth: 1, borderColor: COLORS.error,
},
deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});