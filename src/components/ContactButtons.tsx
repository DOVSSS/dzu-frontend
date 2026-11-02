import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const WHATSAPP_URL = 'https://wa.me/79640605731';
const TELEGRAM_URL = 'https://t.me/+79640605731';

export default function ContactButtons() {
  return (
    <View style={styles.contacts}>
      <TouchableOpacity
        style={[styles.contactBtn, { backgroundColor: '#25D366' }]}
        onPress={() => Linking.openURL(WHATSAPP_URL)}
        accessibilityLabel="Написать в WhatsApp"
      >
        <FontAwesome name="whatsapp" size={17} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.contactBtn, { backgroundColor: '#229ED9' }]}
        onPress={() => Linking.openURL(TELEGRAM_URL)}
        accessibilityLabel="Написать в Telegram"
      >
        <FontAwesome name="telegram" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contacts: { flexDirection: 'row', gap: 6 },
  contactBtn: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
});
