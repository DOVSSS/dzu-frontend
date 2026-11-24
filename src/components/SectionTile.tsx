import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { SectionConfig } from '../constants/sections';
import { SECTION_SOON_COLORS, SECTION_TILE } from '../constants/sections';
import { COLORS, SECTION_COLORS } from '../constants/theme';

type Props = {
  section: SectionConfig;
  width: number;
  onPress: () => void;
};

export default function SectionTile({ section, width, onPress }: Props) {
  const { title, subtitle, height, available, isNew } = section;
  const Icon = section.icon;
  const colors = available ? section.colors : SECTION_SOON_COLORS;
  const showSoon = !available;
  const showNew = available && !!isNew;

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        {
          width,
          height,
          backgroundColor: colors.background,
          minHeight: 44,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={showSoon ? 'Раздел скоро появится' : undefined}
    >
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.title }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtitle }]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      {showSoon && (
        <View style={[styles.badge, styles.soonBadge]}>
          <Text style={styles.badgeText}>Скоро</Text>
        </View>
      )}
      {showNew && (
        <View style={[styles.badge, styles.newBadge]}>
          <Text style={styles.badgeText}>Новое</Text>
        </View>
      )}

      <View
        pointerEvents="none"
        style={[
          styles.circle,
          {
            backgroundColor: colors.circle,
            width: SECTION_TILE.circleSize,
            height: SECTION_TILE.circleSize,
            borderRadius: SECTION_TILE.circleSize / 2,
          },
        ]}
      >
        <Icon
          size={SECTION_TILE.iconSize}
          color={colors.icon}
          strokeWidth={1.75}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: SECTION_TILE.radius,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  textBlock: {
    zIndex: 1,
    maxWidth: '72%',
    gap: 4,
  },
  title: {
    fontSize: SECTION_TILE.titleSize,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: SECTION_TILE.subtitleSize,
    lineHeight: 18,
  },
  circle: {
    position: 'absolute',
    right: -18,
    bottom: -22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    paddingRight: 10,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SECTION_TILE.badgeRadius,
  },
  soonBadge: {
    backgroundColor: SECTION_COLORS.soon.badge,
  },
  newBadge: {
    backgroundColor: SECTION_COLORS.newBadge,
  },
  badgeText: {
    color: COLORS.card,
    fontSize: SECTION_TILE.badgeFontSize,
    fontWeight: '600',
  },
});
