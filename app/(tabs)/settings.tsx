import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/useStore';
import { FuelTrackTheme } from '../../src/store/theme';
import { useTheme } from '../../src/hooks/useColorScheme';
import { exportToCSV, exportToPDF } from '../../src/utils/export';

export default function SettingsScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const vehicles = useStore((s) => s.vehicles);
  const refills = useStore((s) => s.refills);
  const activeVehicleId = useStore((s) => s.activeVehicleId);
  const setTheme = useStore((s) => s.setTheme);
  const storeTheme = useStore((s) => s.theme);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const resetAllData = useStore((s) => s.resetAllData);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const totalVehicles = vehicles.length;
  const totalRefills = refills.length;

  const vehicleRefills = activeVehicle
    ? refills.filter((r) => r.vehicleId === activeVehicle.id)
    : [];

  const handleExportCSV = async () => {
    if (activeVehicle) {
      await exportToCSV(activeVehicle, vehicleRefills);
    }
  };

  const handleExportPDF = async () => {
    if (activeVehicle) {
      await exportToPDF(activeVehicle, vehicleRefills);
    }
  };

  const handleReset = () => {
    resetAllData();
  };

  const handleLoadSample = () => {
    loadSampleData();
  };

  const SettingRow = ({ label, value, onPress, color }: { label: string; value?: string; onPress?: () => void; color?: string }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.settingRow,
        { backgroundColor: colors.card, opacity: pressed && onPress ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>}
        {onPress && <Text style={[styles.settingArrow, { color: colors.textMuted }]}>›</Text>}
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.themeOptions}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setTheme(mode)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: storeTheme === mode ? colors.primary : colors.bgSecondary,
                    borderColor: storeTheme === mode ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: storeTheme === mode ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vehicles</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalVehicles}</Text>
          </View>
          <View style={[styles.statRow, { borderTopWidth: 0 }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Refills Logged</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalRefills}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
          <SettingRow label="Export to CSV" value="Share refill data" onPress={handleExportCSV} />
          <SettingRow label="Export to PDF" value="Share PDF report" onPress={handleExportPDF} />
          <SettingRow label="Reset All Data" value="Delete everything" onPress={handleReset} color={colors.danger} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <SettingRow label="App" value="FuelTron v1.0.0" />
          <SettingRow label="Made By" value="Soham Kedari" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800' },
  scrollView: { flex: 1 },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: '700' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: { fontSize: 13 },
  settingArrow: { fontSize: 20, fontWeight: '300' },
});
