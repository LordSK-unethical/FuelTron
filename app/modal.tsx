import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FuelTrackTheme } from '../src/store/theme';
import { useTheme } from '../src/hooks/useColorScheme';

export default function ModalScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>FuelTron</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.closeText, { color: colors.primary }]}>Close</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text style={styles.emoji}>⛽</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track fuel usage for all your vehicles
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: '800' },
  closeText: { fontSize: 16, fontWeight: '600' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
});
