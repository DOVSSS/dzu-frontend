import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TaxiOrderScreen from '../screens/TaxiOrderScreen';
import { COLORS } from '../constants/theme';

export type AppStackParamList = {
  Home: undefined;
  Restaurant: { restaurantId: string; name: string };
  Orders: undefined;
  Profile: undefined;
  TaxiOrder: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        freezeOnBlur: true,
        headerStyle: { backgroundColor: COLORS.card },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Рестораны' }} />
      <Stack.Screen
        name="Restaurant"
        component={RestaurantScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Мои заказы' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Мой профиль' }} />
      <Stack.Screen name="TaxiOrder" component={TaxiOrderScreen} options={{ title: 'Заказать такси' }} />
    </Stack.Navigator>
  );
}