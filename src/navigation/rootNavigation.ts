import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function openAuthModal() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Auth');
  }
}

export function closeAuthModal() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main');
  }
}