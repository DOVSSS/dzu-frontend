import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../context/AuthContext';
import AppStack, { type AppStackParamList } from './AppStack';
import AuthStack from './AuthStack';

export type RootStackParamList = {
  Main: NavigatorScreenParams<AppStackParamList> | undefined;
  Auth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={AppStack} />
      <Stack.Screen
        name="Auth"
        component={AuthStack}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
