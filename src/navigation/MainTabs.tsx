import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HubScreen from '../screens/HubScreen';
import OrdersScreen from '../screens/OrdersScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { openAuthModal } from './rootNavigation';
import { COLORS, TAB_BAR_CONTENT_HEIGHT } from '../constants/theme';

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACTIVE = '#FF6B35';
const INACTIVE = '#7A6E66';
const TAB_BORDER = '#F0E2D9';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName, focused: boolean) {
  return <Ionicons name={name} size={22} color={focused ? ACTIVE : INACTIVE} />;
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { totalCount } = useCart();

  const guardAuthTab = {
    tabPress: (e: { preventDefault: () => void }) => {
      if (!token) {
        e.preventDefault();
        openAuthModal();
      }
    },
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerShadowVisible: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: TAB_BORDER,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HubScreen}
        options={{
          title: 'Главная',
          tabBarLabel: 'Главная',
          headerShown: false,
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'home' : 'home-outline', focused),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Мои заказы',
          tabBarLabel: 'Заказы',
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'receipt' : 'receipt-outline', focused),
        }}
        listeners={guardAuthTab}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Корзина',
          tabBarLabel: 'Корзина',
          tabBarBadge: totalCount > 0 ? totalCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: ACTIVE,
            fontSize: 11,
            minWidth: 18,
            height: 18,
            lineHeight: 16,
          },
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'bag-handle' : 'bag-handle-outline', focused),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Мой профиль',
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'person' : 'person-outline', focused),
        }}
        listeners={guardAuthTab}
      />
    </Tab.Navigator>
  );
}
