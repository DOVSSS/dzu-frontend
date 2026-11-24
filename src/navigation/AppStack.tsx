import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import MainTabs, { type MainTabParamList } from './MainTabs';
import FoodScreen from '../screens/FoodScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import TaxiOrderScreen from '../screens/TaxiOrderScreen';
import { COLORS } from '../constants/theme';

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Food: undefined;
  Restaurant: { restaurantId: string; name: string };
  TaxiOrder: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: true,
        freezeOnBlur: true,
        headerStyle: { backgroundColor: COLORS.card },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={MainTabs}
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
