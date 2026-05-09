import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { FuelTrackTheme } from '../../src/store/theme';
import { useTheme } from '../../src/hooks/useColorScheme';
import { RefillItem } from '../../src/components/RefillItem';
import { EmptyState } from '../../src/components/EmptyState';
import { getVehicleRefills, computeRefillData } from '../../src/utils/calculations';

export default function HistoryScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const vehicles = useStore((s) => s.vehicles);
  const refills = useStore((s) => s.refills);
  const activeVehicleId = useStore((s) => s.activeVehicleId);
  const deleteRefill = useStore((s) => s.deleteRefill);

  const [searchMonth, setSearchMonth] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const vehicleRefills = activeVehicle
    ? getVehicleRefills(activeVehicle.id, refills)
    : [];

  const displayMileage = (r: typeof vehicleRefills[number]) => {
    const computed = computeRefillData(r, refills);
    return { kmpl: computed.kmpl, distance: computed.distanceTraveled };
  };

  const filteredRefills = useMemo(() => {
    if (!searchMonth) return vehicleRefills;
    const [year, month] = searchMonth.split('-').map(Number);
    return vehicleRefills.filter((r) => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [vehicleRefills, searchMonth]);

  const totalFuel = filteredRefills.reduce((s, r) => s + r.fuelAdded, 0);
  const totalCost = filteredRefills.reduce((s, r) => s + r.fuelCost, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: 16, paddingTop: 8 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Refill History</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {activeVehicle?.name || 'Select a vehicle'} &middot; {filteredRefills.length} entries
        </Text>
      </View>

      {!activeVehicle ? (
        <EmptyState
          icon="📋"
          title="No Vehicle Selected"
          subtitle="Select a vehicle from the dashboard to view its history"
          theme={theme}
        />
      ) : vehicleRefills.length === 0 ? (
        <EmptyState
          icon="⛽"
          title="No Refills Yet"
          subtitle="Record your first refill to start tracking"
          actionLabel="Add Refill"
          onAction={() => router.push('/add-refill')}
          theme={theme}
        />
      ) : (
        <>
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.filterToggleText, { color: colors.text }]}>
              {showFilters ? 'Hide Filters' : 'Filter by Month'}
            </Text>
          </Pressable>

          {showFilters && (
            <View style={[styles.filterBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.monthInput, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="YYYY-MM (e.g. 2026-05)"
                placeholderTextColor={colors.textMuted}
                value={searchMonth}
                onChangeText={setSearchMonth}
              />
              {searchMonth ? (
                <Pressable onPress={() => setSearchMonth('')}>
                  <Text style={[styles.clearBtn, { color: colors.primary }]}>Clear</Text>
                </Pressable>
              ) : null}
            </View>
          )}

          {filteredRefills.length > 0 && (
            <View style={[styles.summaryBar, { backgroundColor: colors.card }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{totalFuel.toFixed(1)}L</Text>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Fuel</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>₹{totalCost.toFixed(2)}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Cost</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{filteredRefills.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Entries</Text>
              </View>
            </View>
          )}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredRefills.map((refill) => {
              const { kmpl, distance } = displayMileage(refill);
              return (
                <RefillItem
                  key={refill.id}
                  refill={refill}
                  kmpl={kmpl}
                  distanceTraveled={distance}
                  onPress={() => (router.push as (path: string) => void)(`/refill/${refill.id}`)}
                  onLongPress={() => deleteRefill(refill.id)}
                  theme={theme}
                />
              );
            })}
          </ScrollView>
        </>
      )}

      {activeVehicle && vehicleRefills.length > 0 && (
        <Pressable
          onPress={() => router.push('/add-refill')}
          style={[styles.fab, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  filterToggle: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterToggleText: { fontSize: 13, fontWeight: '600' },
  filterBar: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  clearBtn: { fontSize: 14, fontWeight: '600', marginLeft: 10 },
  summaryBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  scrollView: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#FFFFFF', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
