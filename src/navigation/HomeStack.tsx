import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HubScreen from '../screens/HubScreen';
import FoodScreen from '../screens/FoodScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import TaxiOrderScreen from '../screens/TaxiOrderScreen';
import { COLORS } from '../constants/theme';

export type HomeStackParamList = {
  Hub: undefined;
  Food: undefined;
  Restaurant: { restaurantId: string; name: string };
  TaxiOrder: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Hub"
      screenOptions={{
        headerShown: true,
        freezeOnBlur: true,
        headerStyle: { backgroundColor: COLORS.card },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="Hub"
        component={HubScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Food"
        component={FoodScreen}
        options={{ title: 'Еда' }}
      />
      <Stack.Screen
        name="Restaurant"
        component={RestaurantScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <Stack.Screen
        name="TaxiOrder"
        component={TaxiOrderScreen}
        options={{ title: 'Заказать такси' }}
      />
    </Stack.Navigator>
  );
}
