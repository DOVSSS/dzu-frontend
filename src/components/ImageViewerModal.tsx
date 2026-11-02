import React from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet, Dimensions, StatusBar, Platform,
} from 'react-native';
import CachedRemoteImage from './CachedRemoteImage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FULL_IMAGE_WIDTH = Math.ceil(SCREEN_WIDTH * 2);
const TOP_OFFSET = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 52;

type Props = {
  visible: boolean;
  path: string | undefined | null;
  title?: string;
  description?: string | null;
  onClose: () => void;
};

export default function ImageViewerModal({ visible, path, title, description, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <CachedRemoteImage
          path={path}
          width={FULL_IMAGE_WIDTH}
          quality={90}
          style={styles.image}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={150}
        />
        {title || description ? (
          <View style={styles.caption}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
        ) : null}
        <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '70%' },
  caption: {
    position: 'absolute', left: 20, right: 20, bottom: 40,
    gap: 6,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  description: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },
  closeBtn: {
    position: 'absolute', top: TOP_OFFSET, right: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeText: { color: '#fff', fontSize: 20, fontWeight: '600' },
});
