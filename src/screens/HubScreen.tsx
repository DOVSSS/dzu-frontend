import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../components/HomeHeader';
import SectionTile from '../components/SectionTile';
import { SECTIONS, SECTION_TILE, type SectionConfig } from '../constants/sections';
import { COLORS, SPACING, TAB_BAR_CONTENT_HEIGHT, SECTION_COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTENT_WIDTH = SCREEN_WIDTH - SPACING.screen * 2;
const HALF_WIDTH = (CONTENT_WIDTH - SECTION_TILE.gap) / 2;

type Row =
  | { type: 'full'; section: SectionConfig }
  | { type: 'pair'; left: SectionConfig; right: SectionConfig };

function buildRows(sections: SectionConfig[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  while (i < sections.length) {
    const current = sections[i];
    if (current.layout === 'full') {
      rows.push({ type: 'full', section: current });
      i += 1;
      continue;
    }
    const next = sections[i + 1];
    if (next && next.layout === 'half') {
      rows.push({ type: 'pair', left: current, right: next });
      i += 2;
    } else {
      rows.push({ type: 'full', section: current });
      i += 1;
    }
  }
  return rows;
}

export default function HubScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { requireAuth } = useAuth();
  const [soonVisible, setSoonVisible] = useState(false);

  const rows = useMemo(() => buildRows(SECTIONS), []);

  const openSection = useCallback((section: SectionConfig) => {
    if (!section.available) {
      setSoonVisible(true);
      return;
    }
    if (!section.route) return;

    if (section.route === 'TaxiOrder') {
      requireAuth(() => navigation.navigate('TaxiOrder'));
      return;
    }
    navigation.navigate(section.route);
  }, [navigation, requireAuth]);

  const bottomPad = TAB_BAR_CONTENT_HEIGHT + insets.bottom + 24;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HomeHeader />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Что вам нужно сегодня?</Text>

        <View style={styles.grid}>
          {rows.map((row, index) => {
            if (row.type === 'full') {
              return (
                <SectionTile
                  key={row.section.id}
                  section={row.section}
                  width={CONTENT_WIDTH}
                  onPress={() => openSection(row.section)}
                />
              );
            }
            return (
              <View key={`row-${index}`} style={styles.pairRow}>
                <SectionTile
                  section={row.left}
                  width={HALF_WIDTH}
                  onPress={() => openSection(row.left)}
                />
                <SectionTile
                  section={row.right}
                  width={HALF_WIDTH}
                  onPress={() => openSection(row.right)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={soonVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSoonVisible(false)}
      >
        <Pressable style={styles.toastBackdrop} onPress={() => setSoonVisible(false)}>
          <Pressable
            style={[styles.toast, { paddingBottom: Math.max(insets.bottom, 16) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.toastTitle}>Скоро появится</Text>
            <Text style={styles.toastText}>Этот раздел ещё в разработке</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    paddingHorizontal: SPACING.screen,
    paddingTop: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: SECTION_COLORS.title,
    marginBottom: 16,
  },
  grid: {
    gap: SECTION_TILE.gap,
  },
  pairRow: {
    flexDirection: 'row',
    gap: SECTION_TILE.gap,
  },
  toastBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  toast: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 4,
  },
  toastTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: SECTION_COLORS.title,
  },
  toastText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
});
