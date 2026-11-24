export const COLORS = {
  primary: '#FF6B35',
  primaryLight: '#FFF0EB',
  /** Warm off-white — pairs with primary orange */
  background: '#FFF5F0',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#FFE4D6',
  imagePlaceholder: '#FFEDE6',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  error: '#EF4444',
  errorLight: '#FEF2F2',
}

export const SPACING = {
  screen: 16,
  fabPaddingH: 18,
  sectionGap: 10,
}

export const SECTION_COLORS = {
  food: { from: '#FF5A36', to: '#FF9A4D', accent: '#FFFFFF' },
  grocery: { from: '#E6F7DC', to: '#C8EDC9', accent: '#2FA84F' },
  pharmacy: { from: '#E0F4FB', to: '#BFE5F5', accent: '#159BC4' },
  courier: { from: '#FFEDE0', to: '#FFD6BD', accent: '#FF7A2F' },
  taxi: { from: '#FFF6D1', to: '#FFE38A', accent: '#F2B200' },
  beauty: { from: '#F8EAFB', to: '#E6D2F7', accent: '#B45CD8' },
  title: '#1F1A17',
  subtitle: '#5C514A',
  soonBadge: '#7A6E66',
  newBadge: '#FF6B35',
} as const

export const SECTION_TILE = {
  radius: 22,
  gap: 12,
  heroHeight: 176,
  halfHeight: 156,
  fullHeight: 128,
  badgeIconBox: 40,
  titleSize: 19,
  heroTitleSize: 30,
  subtitleSize: 12.5,
  artSize: 64,
  heroArtSize: 104,
  arrowSize: 34,
  badgeFontSize: 11,
  badgeRadius: 10,
} as const

/** Content height of bottom tabs (без safe-area). */
export const TAB_BAR_CONTENT_HEIGHT = 64

export const CART_FAB = {
  height: 52,
  iconSize: 22,
  fontSize: 16,
  pulseDurationMs: 1800,
  pulseDelayMs: 900,
}

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Ожидает',      color: '#F59E0B' },
  ACCEPTED:   { label: 'Принят',       color: '#3B82F6' },
  READY:      { label: 'Готов',        color: '#10B981' },
  DELIVERING: { label: 'Доставляется', color: '#F97316' },
  DELIVERED:  { label: 'Доставлен',    color: '#6B7280' },
  CANCELLED:  { label: 'Отменён',      color: '#EF4444' },
}