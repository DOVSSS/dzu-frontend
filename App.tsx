import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { COLORS } from './src/constants/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/rootNavigation';
import { queryClient } from './src/query/queryClient';

SplashScreen.preventAutoHideAsync().catch(() => {});

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.card,
    border: COLORS.border,
    text: COLORS.text,
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer ref={navigationRef} theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

