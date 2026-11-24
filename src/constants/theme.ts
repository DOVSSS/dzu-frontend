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
  food: { background: '#FFE6D8', circle: '#FFD0B5', icon: '#C2451A' },
  taxi: { background: '#FFF1BF', circle: '#FFE48A', icon: '#8A5A00' },
  grocery: { background: '#E4F2D9' },
  pharmacy: { background: '#DDF1F2' },
  courier: { background: '#EAE6FA' },
  soon: {
    background: '#EFEDEB',
    circle: '#E3E0DD',
    icon: '#A39A93',
    title: '#7A6E66',
    subtitle: '#A39A93',
    badge: '#7A6E66',
  },
  title: '#1F1A17',
  subtitle: '#5C514A',
  newBadge: '#FF6B35',
} as const

/** Content height of bottom tabs (без safe-area). */
export const TAB_BAR_CONTENT_HEIGHT = 56

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