import type { LucideIcon } from 'lucide-react-native';
import {
  UtensilsCrossed,
  ShoppingBasket,
  Pill,
  Package,
  Car,
  Flower2,
  Hamburger,
  Pizza,
  Carrot,
  Apple,
  Cross,
  CarTaxiFront,
  Sparkles,
} from 'lucide-react-native';
import { SECTION_COLORS, SECTION_TILE } from './theme';

export type SectionColors = {
  /** Градиент фона плитки. */
  from: string;
  to: string;
  /** Цвет значка и иллюстрации. */
  accent: string;
  title: string;
  subtitle: string;
};

export type SectionLayout = 'hero' | 'full' | 'half';

export type SectionRoute = 'Food' | 'TaxiOrder';

export type SectionConfig = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** Крупная иллюстрация в правом нижнем углу и второстепенная рядом. */
  art: LucideIcon;
  artSecondary?: LucideIcon;
  colors: SectionColors;
  available: boolean;
  route?: SectionRoute;
  layout: SectionLayout;
  height: number;
  /** Текст кнопки на hero-плитке. */
  cta?: string;
  /** Показать бейдж «Новое», когда раздел available. */
  isNew?: boolean;
};

const TITLE = SECTION_COLORS.title;
const SUBTITLE = SECTION_COLORS.subtitle;

export const SECTIONS: SectionConfig[] = [
  {
    id: 'food',
    title: 'Еда',
    subtitle: 'Рестораны и кафе рядом',
    icon: UtensilsCrossed,
    art: Hamburger,
    artSecondary: Pizza,
    colors: { ...SECTION_COLORS.food, title: '#FFFFFF', subtitle: 'rgba(255,255,255,0.92)' },
    available: true,
    route: 'Food',
    layout: 'hero',
    height: SECTION_TILE.heroHeight,
    cta: 'Заказать',
  },
  {
    id: 'grocery',
    title: 'Продукты',
    subtitle: 'Магазины и супермаркеты',
    icon: ShoppingBasket,
    art: Carrot,
    artSecondary: Apple,
    colors: { ...SECTION_COLORS.grocery, title: TITLE, subtitle: SUBTITLE },
    available: false,
    layout: 'half',
    height: SECTION_TILE.halfHeight,
  },
  {
    id: 'pharmacy',
    title: 'Аптека',
    subtitle: 'Лекарства и товары для здоровья',
    icon: Cross,
    art: Pill,
    colors: { ...SECTION_COLORS.pharmacy, title: TITLE, subtitle: SUBTITLE },
    available: false,
    layout: 'half',
    height: SECTION_TILE.halfHeight,
  },
  {
    id: 'courier',
    title: 'Курьер',
    subtitle: 'Доставим всё, что нужно',
    icon: Package,
    art: Package,
    colors: { ...SECTION_COLORS.courier, title: TITLE, subtitle: SUBTITLE },
    available: false,
    layout: 'half',
    height: SECTION_TILE.halfHeight,
  },
  {
    id: 'taxi',
    title: 'Такси',
    subtitle: 'Укажите адрес, и такси приедет',
    icon: Car,
    art: CarTaxiFront,
    colors: { ...SECTION_COLORS.taxi, title: TITLE, subtitle: SUBTITLE },
    available: true,
    route: 'TaxiOrder',
    layout: 'half',
    height: SECTION_TILE.halfHeight,
    isNew: true,
  },
  {
    id: 'beauty',
    title: 'Красота и здоровье',
    subtitle: 'Косметика, уход, витамины и товары для здоровья',
    icon: Flower2,
    art: Sparkles,
    artSecondary: Flower2,
    colors: { ...SECTION_COLORS.beauty, title: TITLE, subtitle: SUBTITLE },
    available: false,
    layout: 'full',
    height: SECTION_TILE.fullHeight,
  },
];
