import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RestaurantScreen from '../screens/RestaurantScreen';

export type AppStackParamList = {
  Home: undefined;
  Restaurant: { restaurantId: string; name: string };
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
        // Убираем options отсюда — title выставим внутри самого экрана
      />
    </Stack.Navigator>
  );
}