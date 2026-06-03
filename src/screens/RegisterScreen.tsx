import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const validate = (): string | null => {
    if (!name.trim()) return 'Имя обязательно';
    if (name.trim().length < 2) return 'Имя минимум 2 символа';
    if (!email.trim()) return 'Email обязателен';
    if (!email.includes('@')) return 'Некорректный email';
    if (!phone.trim()) return 'Телефон обязателен';
    if (phone.trim().length < 10) return 'Введите корректный телефон';
    if (!address.trim()) return 'Адрес обязателен';
    if (!password) return 'Пароль обязателен';
    if (password.length < 6) return 'Пароль минимум 6 символов';
    if (password !== confirmPassword) return 'Пароли не совпадают';
    return null;
  };

  const handleRegister = async () => {
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setIsLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim(), address.trim());
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Что-то пошло не так';
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { label: 'Имя', value: name, onChange: setName, placeholder: 'Иван Иванов', secure: false, keyboard: 'default' as const },
    { label: 'Email', value: email, onChange: setEmail, placeholder: 'example@mail.com', secure: false, keyboard: 'email-address' as const },
    { label: 'Телефон', value: phone, onChange: setPhone, placeholder: '+7 900 000 00 00', secure: false, keyboard: 'phone-pad' as const },
    { label: 'Адрес доставки', value: address, onChange: setAddress, placeholder: 'ул. Пушкина, д. 1, кв. 1', secure: false, keyboard: 'default' as const },
    { label: 'Пароль', value: password, onChange: setPassword, placeholder: '••••••••', secure: true, keyboard: 'default' as const },
    { label: 'Подтвердите пароль', value: confirmPassword, onChange: setConfirmPassword, placeholder: '••••••••', secure: true, keyboard: 'default' as const },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🛵</Text>
          </View>
          <Text style={styles.title}>Создать аккаунт</Text>
          <Text style={styles.subtitle}>Быстрая доставка еды</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {fields.map(f => (
            <View key={f.label} style={styles.inputGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={COLORS.textMuted}
                value={f.value}
                onChangeText={t => { f.onChange(t); setError(''); }}
                secureTextEntry={f.secure}
                keyboardType={f.keyboard}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Создать аккаунт</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
            <Text style={styles.link}>
              Уже есть аккаунт? <Text style={styles.linkBold}>Войти</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  logoEmoji: { fontSize: 32 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  form: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, gap: 12,
  },
  errorBox: { backgroundColor: COLORS.errorLight, borderRadius: 10, padding: 12 },
  errorText: { color: COLORS.error, fontSize: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  input: {
    height: 50, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 16, fontSize: 15,
    color: COLORS.text, backgroundColor: COLORS.background,
  },
  button: {
    height: 52, backgroundColor: COLORS.primary,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 },
  linkBold: { color: COLORS.primary, fontWeight: '600' },
});