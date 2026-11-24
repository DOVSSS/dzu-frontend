import type { LucideIcon } from 'lucide-react-native';
import {
  UtensilsCrossed,
  ShoppingBasket,
  Pill,
  Package,
  Car,
} from 'lucide-react-native';

export type SectionColors = {
  background: string;
  circle: string;
  icon: string;
  title: string;
  subtitle: string;
};

export type SectionLayout = 'full' | 'half';

export type SectionRoute = 'Food' | 'TaxiOrder';

export type SectionConfig = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** Брендовые цвета раздела (включаются при available: true). */
  colors: SectionColors;
  available: boolean;
  route?: SectionRoute;
  layout: SectionLayout;
  height: number;
  /** Показать бейдж «Новое», когда раздел available. */
  isNew?: boolean;
};

export const SECTION_SOON_COLORS: SectionColors = {
  background: '#EFEDEB',
  circle: '#E3E0DD',
  icon: '#A39A93',
  title: '#7A6E66',
  subtitle: '#A39A93',
};

export const SECTION_TILE = {
  radius: 20,
  gap: 10,
  iconSize: 36,
  circleSize: 96,
  titleSize: 18,
  subtitleSize: 13,
  badgeFontSize: 11,
  badgeRadius: 10,
} as const;

const TITLE = '#1F1A17';
const SUBTITLE = '#5C514A';

export const SECTIONS: SectionConfig[] = [
  {
    id: 'food',
    title: 'Еда',
    subtitle: 'Рестораны и кафе рядом',
    icon: UtensilsCrossed,
    colors: {
      background: '#FFE6D8',
      circle: '#FFD0B5',
      icon: '#C2451A',
      title: TITLE,
      subtitle: SUBTITLE,
    },
    available: true,
    route: 'Food',
    layout: 'full',
    height: 124,
  },
  {
    id: 'grocery',
    title: 'Продукты',
    subtitle: 'Магазины и супермаркеты',
    icon: ShoppingBasket,
    colors: {
      background: '#E4F2D9',
      circle: '#CDE8B8',
      icon: '#3F6B1A',
      title: TITLE,
      subtitle: SUBTITLE,
    },
    available: false,
    layout: 'half',
    height: 140,
  },
  {
    id: 'pharmacy',
    title: 'Аптека',
    subtitle: 'Лекарства и товары для здоровья',
    icon: Pill,
    colors: {
      background: '#DDF1F2',
      circle: '#BFE4E6',
      icon: '#1F6B70',
      title: TITLE,
      subtitle: SUBTITLE,
    },
    available: false,
    layout: 'half',
    height: 140,
  },
  {
    id: 'courier',
    title: 'Курьер',
    subtitle: 'Доставим всё, что нужно',
    icon: Package,
    colors: {
      background: '#EAE6FA',
      circle: '#D6CFF3',
      icon: '#4A3D8C',
      title: TITLE,
      subtitle: SUBTITLE,
    },
    available: false,
    layout: 'half',
    height: 140,
  },
  {
    id: 'taxi',
    title: 'Такси',
    subtitle: 'Укажите адрес, и такси приедет',
    icon: Car,
    colors: {
      background: '#FFF1BF',
      circle: '#FFE48A',
      icon: '#8A5A00',
      title: TITLE,
      subtitle: SUBTITLE,
    },
    available: true,
    route: 'TaxiOrder',
    layout: 'half',
    height: 140,
    isNew: true,
  },
];
