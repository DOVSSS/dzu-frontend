import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { COLORS } from '../constants/theme';

// Типизация маршрутов AuthStack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// src/navigation/AuthStack.tsx
export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Login — без хедера, некуда возвращаться */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      {/* Register — хедер с кнопкой "Назад" появится автоматически */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Регистрация' }}
      />
    </Stack.Navigator>
  );
}