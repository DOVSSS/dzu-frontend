export const COLORS = {
  primary: '#FF6B35',
  primaryLight: '#FFF0EB',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#F0F0F0',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  error: '#EF4444',
  errorLight: '#FEF2F2',
}

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Ожидает',      color: '#F59E0B' },
  CONFIRMED:  { label: 'Подтверждён',  color: '#3B82F6' },
  PREPARING:  { label: 'Готовится',    color: '#8B5CF6' },
  READY:      { label: 'Готов',        color: '#10B981' },
  DELIVERING: { label: 'Доставляется', color: '#F97316' },
  DELIVERED:  { label: 'Доставлен',    color: '#6B7280' },
  CANCELLED:  { label: 'Отменён',      color: '#EF4444' },
}