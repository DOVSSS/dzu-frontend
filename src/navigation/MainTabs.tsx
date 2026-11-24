import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
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

const ACTIVE = '#FF5A36';
const INACTIVE = '#3A322D';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName, focused: boolean) {
  return <Ionicons name={name} size={24} color={focused ? ACTIVE : INACTIVE} />;
}

function tabLabel(text: string) {
  return ({ focused }: { focused: boolean }) => (
    <View style={styles.labelWrap}>
      <Text style={[styles.label, { color: focused ? ACTIVE : INACTIVE }]}>{text}</Text>
      <View style={[styles.indicator, focused && styles.indicatorActive]} />
    </View>
  );
}

const styles = StyleSheet.create({
  labelWrap: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  indicator: {
    marginTop: 3,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: ACTIVE,
  },
});

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
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
          backgroundColor: '#FFF0E7',
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          shadowColor: '#C2451A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 14,
          elevation: 12,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: 'Главная',
          tabBarLabel: tabLabel('Главная'),
          headerShown: false,
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'home' : 'home-outline', focused),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Мои заказы',
          tabBarLabel: tabLabel('Заказы'),
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'receipt' : 'receipt-outline', focused),
        }}
        listeners={guardAuthTab}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Корзина',
          tabBarLabel: tabLabel('Корзина'),
          tabBarBadge: totalCount > 0 ? totalCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: ACTIVE,
            fontSize: 11,
            minWidth: 18,
            height: 18,
            lineHeight: 16,
          },
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'cart' : 'cart-outline', focused),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Мой профиль',
          tabBarLabel: tabLabel('Профиль'),
          tabBarIcon: ({ focused }) => tabIcon(focused ? 'person' : 'person-outline', focused),
        }}
        listeners={guardAuthTab}
      />
    </Tab.Navigator>
  );
}
