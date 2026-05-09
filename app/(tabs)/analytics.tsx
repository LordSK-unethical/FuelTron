import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/useStore';
import { FuelTrackTheme } from '../../src/store/theme';
import { useTheme } from '../../src/hooks/useColorScheme';
import { EmptyState } from '../../src/components/EmptyState';
import { StatCard } from '../../src/components/StatCard';
import { KMPLChart } from '../../src/charts/KMPLChart';
import { FuelCostChart } from '../../src/charts/FuelCostChart';
import { DistanceChart } from '../../src/charts/DistanceChart';
import {
  getMileageData,
  getMonthlyExpenses,
  calculateAverageKmpl,
  getTotalDistance,
  getTotalFuelCost,
  getTotalFuelConsumed,
} from '../../src/utils/calculations';

export default function AnalyticsScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const vehicles = useStore((s) => s.vehicles);
  const refills = useStore((s) => s.refills);
  const activeVehicleId = useStore((s) => s.activeVehicleId);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

  const mileageData = activeVehicle ? getMileageData(activeVehicle.id, refills) : [];
  const monthlyExpenses = activeVehicle ? getMonthlyExpenses(activeVehicle.id, refills) : [];
  const avgKmpl = activeVehicle ? calculateAverageKmpl(activeVehicle.id, refills) : 0;
  const totalDistance = activeVehicle ? getTotalDistance(activeVehicle.id, refills) : 0;
  const totalCost = activeVehicle ? getTotalFuelCost(activeVehicle.id, refills) : 0;
  const totalFuel = activeVehicle ? getTotalFuelConsumed(activeVehicle.id, refills) : 0;

  if (!activeVehicle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
        </View>
        <EmptyState
          icon="📈"
          title="No Vehicle Selected"
          subtitle="Select a vehicle to see detailed analytics"
          theme={theme}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{activeVehicle.name}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <StatCard title="Avg KMPL" value={avgKmpl.toFixed(1)} icon="📊" color={colors.primary} theme={theme} />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <StatCard title="Total Fuel" value={`${totalFuel.toFixed(1)}L`} icon="⛽" color="#FF8C00" theme={theme} />
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <StatCard title="Total Distance" value={`${totalDistance.toFixed(0)} km`} icon="📍" color={colors.success} theme={theme} />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <StatCard title="Total Cost" value={`₹${totalCost.toFixed(2)}`} icon="💰" color={colors.primary} theme={theme} />
          </View>
        </View>

        <KMPLChart data={mileageData} theme={theme} />
        <FuelCostChart data={monthlyExpenses} theme={theme} />
        <DistanceChart data={mileageData} theme={theme} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  scrollView: { flex: 1 },
  statsRow: { flexDirection: 'row', marginBottom: 4 },
});
