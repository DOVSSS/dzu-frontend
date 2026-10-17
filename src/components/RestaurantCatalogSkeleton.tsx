import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const LIST_PADDING = 16;
const CARD_WIDTH = SCREEN_WIDTH - LIST_PADDING * 2;
const IMAGE_HEIGHT = CARD_WIDTH / 2.8;
const PLACEHOLDER_COUNT = 6;

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={styles.lineTitle} />
      <View style={styles.lineSlug} />
    </View>
  );
}

export default function RestaurantCatalogSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.sectionLine} />
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 32 },
  sectionLine: {
    height: 14,
    width: '55%',
    borderRadius: 6,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 10,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: COLORS.border,
  },
  lineTitle: {
    height: 12,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  lineSlug: {
    height: 10,
    width: '50%',
    marginTop: 6,
    marginHorizontal: 10,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
});
