import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { FuelTrackTheme } from '../../src/store/theme';
import { useTheme } from '../../src/hooks/useColorScheme';
import { StatCard } from '../../src/components/StatCard';
import { PredictionCard } from '../../src/components/PredictionCard';
import { FuelGauge } from '../../src/components/FuelGauge';
import { EmptyState } from '../../src/components/EmptyState';
import {
  getTotalDistance,
  getTotalFuelCost,
  getLastRefill,
  predictNextRefill,
  getMonthlyFuelCost,
  getRideStats,
} from '../../src/utils/calculations';

export default function DashboardScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const vehicles = useStore((s) => s.vehicles);
  const refills = useStore((s) => s.refills);
  const rides = useStore((s) => s.rides);
  const activeVehicleId = useStore((s) => s.activeVehicleId);
  const setActiveVehicle = useStore((s) => s.setActiveVehicle);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const totalDistance = activeVehicle ? getTotalDistance(activeVehicle.id, refills) : 0;
  const totalCost = activeVehicle ? getTotalFuelCost(activeVehicle.id, refills) : 0;
  const lastRefill = activeVehicle ? getLastRefill(activeVehicle.id, refills) : null;
  const monthlyCost = activeVehicle ? getMonthlyFuelCost(activeVehicle.id, refills) : 0;
  const prediction = activeVehicle ? predictNextRefill(activeVehicle, refills, rides) : null;
  const rideStats = activeVehicle ? getRideStats(activeVehicle.id, rides, refills) : null;

  const vehicleName = activeVehicle?.name || 'No Vehicle';

  if (vehicles.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <EmptyState
          icon="🚗"
          title="No Vehicles Yet"
          subtitle="Add your first vehicle to start tracking fuel consumption"
          actionLabel="Add Vehicle"
          onAction={() => router.push('/add-vehicle')}
          theme={theme}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: 16, paddingTop: 8 }]}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>FuelTrack</Text>
        <Text style={[styles.title, { color: colors.text }]}>{vehicleName}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {vehicles.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.vehicleTabs}
            contentContainerStyle={{ gap: 8 }}
          >
            {vehicles.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => setActiveVehicle(v.id)}
                style={[
                  styles.vehicleTab,
                  {
                    backgroundColor: v.id === activeVehicleId ? colors.primary : colors.card,
                    borderColor: v.id === activeVehicleId ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.vehicleTabText,
                    { color: v.id === activeVehicleId ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {v.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {activeVehicle && prediction && (
          <FuelGauge prediction={prediction} theme={theme} />
        )}

          <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <StatCard
                title="Current KMPL"
                value={`${prediction?.currentKmpl.toFixed(1) || '0'} kmpl`}
                icon="📊"
                color={colors.primary}
                theme={theme}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <StatCard
                title="Total Distance"
                value={`${totalDistance.toFixed(0)} km`}
                icon="📍"
                color={colors.success}
                theme={theme}
              />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <StatCard
                title="Fuel Ends At"
                value={prediction ? `${prediction.fuelEndOdometer.toLocaleString()} km` : '-'}
                icon="🎯"
                color={colors.warning}
                theme={theme}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <StatCard
                title="Remaining Range"
                value={prediction ? `${prediction.remainingKm} km` : '-'}
                icon="🛣️"
                color={colors.primary}
                theme={theme}
              />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <StatCard
                title="Monthly Cost"
                value={`₹${monthlyCost.toFixed(2)}`}
                icon="💰"
                color={colors.primary}
                theme={theme}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <StatCard
                title="Total Spent"
                value={`₹${totalCost.toFixed(2)}`}
                icon="💳"
                color="#FF8C00"
                theme={theme}
              />
            </View>
          </View>
        </View>

        {prediction && <PredictionCard prediction={prediction} theme={theme} />}

        {lastRefill && (
          <View style={[styles.lastRefillCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Last Refill</Text>
            <View style={styles.lastRefillGrid}>
              <View style={styles.refillStat}>
                <Text style={[styles.refillLabel, { color: colors.textMuted }]}>Fuel Added</Text>
                <Text style={[styles.refillValue, { color: colors.text }]}>{lastRefill.fuelAdded} L</Text>
              </View>
              <View style={styles.refillStat}>
                <Text style={[styles.refillLabel, { color: colors.textMuted }]}>Cost</Text>
                <Text style={[styles.refillValue, { color: colors.primary }]}>₹{lastRefill.fuelCost.toFixed(2)}</Text>
              </View>
              <View style={styles.refillStat}>
                <Text style={[styles.refillLabel, { color: colors.textMuted }]}>Odometer</Text>
                <Text style={[styles.refillValue, { color: colors.text }]}>{lastRefill.odometer.toLocaleString()} km</Text>
              </View>
              <View style={styles.refillStat}>
                <Text style={[styles.refillLabel, { color: colors.textMuted }]}>Date</Text>
                <Text style={[styles.refillValue, { color: colors.text }]}>
                  {new Date(lastRefill.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {rideStats && rideStats.totalRides > 0 && (
          <View style={[styles.lastRefillCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Rides</Text>
            <View style={styles.lastRefillGrid}>
              <View style={styles.refillStat}>
                <Text style={[styles.refillLabel, { color: colors.textMuted }]}>Distance</Text>
                <Text style={[styles.refillValue, { color: colors.text }]}>{rideStats.todayDistance} km</Text>
              </View>
              <View style={styles.refillStat}>
                <Text style={[styles.refillLabel, { color: colors.textMuted }]}>Fuel Used</Text>
                <Text style={[styles.refillValue, { color: colors.warning }]}>{rideStats.fuelConsumedToday} L</Text>
              </View>
              <View style={styles.refillStat}>
                <Text style={[styles.refillLabel, { color: colors.textMuted }]}>Week Distance</Text>
                <Text style={[styles.refillValue, { color: colors.text }]}>{rideStats.weekDistance} km</Text>
              </View>
              <View style={styles.refillStat}>
                <Text style={[styles.refillLabel, { color: colors.textMuted }]}>Avg Daily</Text>
                <Text style={[styles.refillValue, { color: colors.primary }]}>{rideStats.avgDailyUsage} km</Text>
              </View>
            </View>
          </View>
        )}

        {!activeVehicle && (
          <EmptyState
            icon="🚗"
            title="Select a Vehicle"
            subtitle="Choose a vehicle to see its dashboard"
            theme={theme}
          />
        )}
      </ScrollView>

      <View style={styles.fabRow}>
        <Pressable
          onPress={() => router.push('/log-ride')}
          style={[styles.fabSmall, { backgroundColor: colors.success }]}
        >
          <Text style={styles.fabSmallText}>🛣️</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/add-refill')}
          style={[styles.fab, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 4 },
  greeting: { fontSize: 13, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 2 },
  scrollView: { flex: 1 },
  vehicleTabs: { marginBottom: 12 },
  vehicleTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  vehicleTabText: { fontSize: 13, fontWeight: '600' },
  statsGrid: { marginBottom: 8 },
  statsRow: { flexDirection: 'row', marginBottom: 4 },
  lastRefillCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  lastRefillGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  refillStat: { width: '50%', marginBottom: 12 },
  refillLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  refillValue: { fontSize: 16, fontWeight: '700' },
  fabRow: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabSmallText: { color: '#FFFFFF', fontSize: 20 },
  fab: {
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
