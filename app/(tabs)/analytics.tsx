import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/useStore';
import { FuelTrackTheme } from '../../src/store/theme';
import { useTheme } from '../../src/hooks/useColorScheme';
import { EmptyState } from '../../src/components/EmptyState';
import { FadeInView } from '../../src/components/FadeInView';
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
  getRideStats,
} from '../../src/utils/calculations';

function StatCell({ icon, value, label, color, labelColor }: { icon: string; value: string; label: string; color: string; labelColor?: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const vehicles = useStore((s) => s.vehicles);
  const refills = useStore((s) => s.refills);
  const rides = useStore((s) => s.rides);
  const activeVehicleId = useStore((s) => s.activeVehicleId);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

  const mileageData = activeVehicle ? getMileageData(activeVehicle.id, refills) : [];
  const monthlyExpenses = activeVehicle ? getMonthlyExpenses(activeVehicle.id, refills) : [];
  const avgKmpl = activeVehicle ? calculateAverageKmpl(activeVehicle.id, refills) : 0;
  const totalDistance = activeVehicle ? getTotalDistance(activeVehicle.id, refills) : 0;
  const totalCost = activeVehicle ? getTotalFuelCost(activeVehicle.id, refills) : 0;
  const totalFuel = activeVehicle ? getTotalFuelConsumed(activeVehicle.id, refills) : 0;
  const rideStats = activeVehicle ? getRideStats(activeVehicle.id, rides, refills) : null;

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
        <FadeInView index={0}>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fuel Overview</Text>
            <View style={styles.statGrid}>
              <StatCell icon="📊" value={avgKmpl.toFixed(1)} label="Avg KMPL" labelColor={colors.textMuted} color={colors.primary} />
              <StatCell icon="⛽" value={`${totalFuel.toFixed(1)}L`} label="Total Fuel" labelColor={colors.textMuted} color="#FF8C00" />
              <StatCell icon="📍" value={`${totalDistance.toFixed(0)} km`} label="Total Distance" labelColor={colors.textMuted} color={colors.success} />
              <StatCell icon="💰" value={`₹${totalCost.toFixed(2)}`} label="Total Cost" labelColor={colors.textMuted} color={colors.primary} />
            </View>
          </View>
        </FadeInView>

        {rideStats && rideStats.totalRides > 0 && (
          <FadeInView index={1}>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Ride Overview</Text>
              <View style={styles.statGrid}>
                <StatCell icon="🛣️" value={String(rideStats.totalRides)} label="Total Rides" labelColor={colors.textMuted} color={colors.primary} />
                <StatCell icon="📏" value={`${rideStats.avgRideDistance} km`} label="Avg Ride" labelColor={colors.textMuted} color={colors.success} />
                <StatCell icon="📅" value={`${rideStats.weekDistance} km`} label="Week Distance" labelColor={colors.textMuted} color={colors.warning} />
                <StatCell icon="📆" value={`${rideStats.monthDistance} km`} label="Month Distance" labelColor={colors.textMuted} color={colors.primary} />
                <StatCell icon="📊" value={`${rideStats.avgDailyUsage} km`} label="Avg Daily" labelColor={colors.textMuted} color="#FF8C00" />
                <StatCell icon="⛽" value={`${rideStats.fuelConsumedToday} L`} label="Today's Fuel" labelColor={colors.textMuted} color={colors.danger} />
              </View>
            </View>
          </FadeInView>
        )}

        <View style={styles.chartsSection}>
          <FadeInView index={2}><KMPLChart data={mileageData} theme={theme} /></FadeInView>
          <FadeInView index={3}><FuelCostChart data={monthlyExpenses} theme={theme} /></FadeInView>
          <FadeInView index={4}><DistanceChart data={mileageData} theme={theme} /></FadeInView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  scrollView: { flex: 1 },
  sectionCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCell: { width: '50%', marginBottom: 14 },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  chartsSection: { marginTop: 4 },
});
