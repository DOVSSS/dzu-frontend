import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import MainTabs, { type MainTabParamList } from './MainTabs';
import { COLORS } from '../constants/theme';

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
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
    </Stack.Navigator>
  );
}
