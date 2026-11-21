import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type AppStateStatus,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NavigationState, PartialState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { navigationRef } from '../navigation/rootNavigation';
import { CART_FAB, COLORS, SPACING, TAB_BAR_CONTENT_HEIGHT } from '../constants/theme';

function getAppStackRouteName(
  rootState: NavigationState | PartialState<NavigationState> | undefined,
): string | undefined {
  if (!rootState?.routes?.length) return undefined;
  const rootIndex =
    typeof rootState.index === 'number'
      ? rootState.index
      : Math.max(0, rootState.routes.length - 1);
  const rootRoute = rootState.routes[rootIndex];
  if (rootRoute?.name !== 'Main') return undefined;
  const appState = rootRoute.state;
  if (!appState?.routes?.length) return 'Tabs';
  const appIndex =
    typeof appState.index === 'number'
      ? appState.index
      : Math.max(0, appState.routes.length - 1);
  return appState.routes[appIndex]?.name;
}

function readNavFlags() {
  if (!navigationRef.isReady()) {
    return { onCartScreen: false, tabsVisible: true, onAuth: false };
  }

  const current = navigationRef.getCurrentRoute();
  const rootState = navigationRef.getRootState();
  if (!rootState?.routes?.length) {
    return { onCartScreen: false, tabsVisible: true, onAuth: false };
  }
  const rootIndex =
    typeof rootState.index === 'number'
      ? rootState.index
      : Math.max(0, rootState.routes.length - 1);
  const rootName = rootState.routes[rootIndex]?.name;

  return {
    onCartScreen: current?.name === 'Cart',
    tabsVisible: getAppStackRouteName(rootState) === 'Tabs',
    onAuth: rootName === 'Auth',
  };
}

function formatRub(amount: number): string {
  const n = Math.round(amount);
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`;
}

function PulseRing({
  delayMs,
  active,
}: {
  delayMs: number;
  active: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (!active) {
      scale.stopAnimation();
      opacity.stopAnimation();
      scale.setValue(1);
      opacity.setValue(0);
      return;
    }

    scale.setValue(1);
    opacity.setValue(0.45);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: CART_FAB.pulseDurationMs,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: CART_FAB.pulseDurationMs,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.45,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    const animation =
      delayMs > 0
        ? Animated.sequence([Animated.delay(delayMs), pulse])
        : pulse;

    animation.start();
    return () => {
      animation.stop();
    };
  }, [active, delayMs, scale, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

export default function CartFab() {
  const insets = useSafeAreaInsets();
  const { totalCount, subtotal } = useCart();

  const [onCartScreen, setOnCartScreen] = useState(false);
  const [tabsVisible, setTabsVisible] = useState(true);
  const [onAuth, setOnAuth] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const sync = () => {
      const flags = readNavFlags();
      setOnCartScreen(flags.onCartScreen);
      setTabsVisible(flags.tabsVisible);
      setOnAuth(flags.onAuth);
    };

    sync();
    const unsub = navigationRef.addListener('state', sync);
    return unsub;
  }, []);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => setAppActive(next === 'active');
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted) setReduceMotion(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const hidden = totalCount === 0 || onCartScreen || onAuth;

  const bottom = useMemo(() => {
    const base = tabsVisible ? TAB_BAR_CONTENT_HEIGHT + insets.bottom : insets.bottom;
    return base + SPACING.screen;
  }, [tabsVisible, insets.bottom]);

  const pulseActive = !hidden && appActive && !reduceMotion;
  const priceLabel = formatRub(subtotal);
  const a11yAmount = Math.round(subtotal);

  const openCart = () => {
    if (!navigationRef.isReady()) return;

    navigationRef.navigate('Main', {
      screen: 'Tabs',
      params: { screen: 'Cart' },
    });
  };

  if (hidden) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.anchor, { bottom, right: SPACING.screen }]}
    >
      <View style={styles.wrap}>
        <PulseRing delayMs={0} active={pulseActive} />
        <PulseRing delayMs={CART_FAB.pulseDelayMs} active={pulseActive} />

        <TouchableOpacity
          style={styles.fab}
          onPress={openCart}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={`Корзина, ${a11yAmount} рублей`}
        >
          <Feather name="shopping-bag" size={CART_FAB.iconSize} color="#FFFFFF" />
          <Text style={styles.price}>{priceLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    zIndex: 100,
    elevation: 100,
  },
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Math.ceil(CART_FAB.height * 0.25),
    overflow: 'visible',
  },
  ring: {
    position: 'absolute',
    top: Math.ceil(CART_FAB.height * 0.25),
    bottom: Math.ceil(CART_FAB.height * 0.25),
    left: Math.ceil(CART_FAB.height * 0.25),
    right: Math.ceil(CART_FAB.height * 0.25),
    borderRadius: CART_FAB.height / 2,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  fab: {
    minWidth: 44,
    minHeight: 44,
    height: CART_FAB.height,
    borderRadius: CART_FAB.height / 2,
    paddingHorizontal: SPACING.fabPaddingH,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
  },
  price: {
    color: '#FFFFFF',
    fontSize: CART_FAB.fontSize,
    fontWeight: '600',
  },
});
