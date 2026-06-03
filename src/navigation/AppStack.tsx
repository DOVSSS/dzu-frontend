import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import OrdersScreen from '../screens/OrdersScreen';
import { Restaurant } from '../types/api.types';

export type AppStackParamList = {
  Home: undefined;
  Restaurant: { restaurant: Restaurant };
  Orders: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: true }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Рестораны' }}
      />
      <Stack.Screen
        name="Restaurant"
        component={RestaurantScreen}
        options={({ route }) => ({ title: route.params.restaurant.name })}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Мои заказы' }}
      />
    </Stack.Navigator>
  );
}