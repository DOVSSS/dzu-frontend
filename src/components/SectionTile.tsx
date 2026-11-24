import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { ArrowRight } from 'lucide-react-native';
import type { SectionConfig } from '../constants/sections';
import { COLORS, SECTION_COLORS, SECTION_TILE } from '../constants/theme';

type Props = {
  section: SectionConfig;
  width: number;
  onPress: () => void;
};

export default function SectionTile({ section, width, onPress }: Props) {
  const { id, title, subtitle, height, available, isNew, layout, colors, cta } = section;
  const Icon = section.icon;
  const Art = section.art;
  const ArtSecondary = section.artSecondary;
  const isHero = layout === 'hero';
  const showSoon = !available;
  const showNew = available && !!isNew;
  const gradientId = `section-bg-${id}`;

  return (
    <View
      style={[
        styles.shadow,
        { width, height, backgroundColor: colors.to, shadowColor: isHero ? colors.from : '#7A6E66' },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={showSoon ? 'Раздел скоро появится' : undefined}
      >
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.from} />
              <Stop offset="1" stopColor={colors.to} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
        </Svg>

        <View
          pointerEvents="none"
          style={[styles.decor, isHero ? styles.heroDecor : styles.tileDecor]}
        />

        <View pointerEvents="none" style={isHero ? styles.heroArt : styles.art}>
          <Art
            size={isHero ? SECTION_TILE.heroArtSize : SECTION_TILE.artSize}
            color={colors.accent}
            strokeWidth={isHero ? 1.6 : 1.5}
          />
        </View>
        {ArtSecondary && (
          <View pointerEvents="none" style={isHero ? styles.heroArtSecondary : styles.artSecondary}>
            <ArtSecondary
              size={isHero ? 52 : 30}
              color={colors.accent}
              strokeWidth={1.5}
              opacity={0.75}
            />
          </View>
        )}

        {isHero ? (
          <View style={styles.heroContent}>
            <View style={styles.heroHeading}>
              <View style={[styles.iconBox, styles.heroIconBox]}>
                <Icon size={26} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text style={[styles.heroTitle, { color: colors.title }]}>{title}</Text>
            </View>
            <Text style={[styles.subtitle, styles.heroSubtitle, { color: colors.subtitle }]}>
              {subtitle}
            </Text>
            {!!cta && (
              <View style={styles.ctaPill}>
                <Text style={[styles.ctaText, { color: colors.from }]}>{cta}</Text>
                <ArrowRight size={18} color={colors.from} strokeWidth={2.4} />
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.content, layout === 'full' && styles.contentFull]}>
            <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
              <Icon size={22} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={[styles.title, { color: colors.title }]} numberOfLines={2}>
              {title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]} numberOfLines={3}>
              {subtitle}
            </Text>
          </View>
        )}

        {!isHero && available && (
          <View pointerEvents="none" style={styles.arrowBtn}>
            <ArrowRight size={18} color={SECTION_COLORS.title} strokeWidth={2.4} />
          </View>
        )}

        {showSoon && (
          <View style={[styles.badge, { backgroundColor: SECTION_COLORS.soonBadge }]}>
            <Text style={styles.badgeText}>Скоро</Text>
          </View>
        )}
        {showNew && (
          <View style={[styles.badge, { backgroundColor: SECTION_COLORS.newBadge }]}>
            <Text style={styles.badgeText}>Новое</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: SECTION_TILE.radius,
    minHeight: 44,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  tile: {
    flex: 1,
    borderRadius: SECTION_TILE.radius,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  decor: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  tileDecor: {
    width: 124,
    height: 124,
    borderRadius: 62,
    right: -26,
    bottom: -34,
  },
  heroDecor: {
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -36,
    bottom: -56,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  art: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  artSecondary: {
    position: 'absolute',
    right: 84,
    bottom: 14,
  },
  heroArt: {
    position: 'absolute',
    right: 22,
    bottom: 18,
  },
  heroArtSecondary: {
    position: 'absolute',
    right: 30,
    top: 16,
  },
  content: {
    flex: 1,
    padding: 14,
    maxWidth: '86%',
  },
  contentFull: {
    maxWidth: '64%',
  },
  heroContent: {
    flex: 1,
    padding: 18,
    maxWidth: '64%',
    justifyContent: 'center',
  },
  heroHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: SECTION_TILE.badgeIconBox,
    height: SECTION_TILE.badgeIconBox,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  heroTitle: {
    fontSize: SECTION_TILE.heroTitleSize,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 14,
  },
  title: {
    fontSize: SECTION_TILE.titleSize,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: SECTION_TILE.subtitleSize,
    lineHeight: 17,
  },
  ctaPill: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
  },
  arrowBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: SECTION_TILE.arrowSize,
    height: SECTION_TILE.arrowSize,
    borderRadius: SECTION_TILE.arrowSize / 2,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SECTION_TILE.badgeRadius,
  },
  badgeText: {
    color: COLORS.card,
    fontSize: SECTION_TILE.badgeFontSize,
    fontWeight: '600',
  },
});
