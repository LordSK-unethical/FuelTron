import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useStore } from '../../src/store/useStore';
import { FuelTrackTheme } from '../../src/store/theme';
import { useTheme } from '../../src/hooks/useColorScheme';
import { VehicleCard } from '../../src/components/VehicleCard';
import { EmptyState } from '../../src/components/EmptyState';
import { useEntranceAnimation, usePressAnimation } from '../../src/utils/animations';

export default function VehiclesScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const vehicles = useStore((s) => s.vehicles);
  const activeVehicleId = useStore((s) => s.activeVehicleId);
  const setActiveVehicle = useStore((s) => s.setActiveVehicle);
  const deleteVehicle = useStore((s) => s.deleteVehicle);

  const headerAnim = useEntranceAnimation(0, 40);
  const { pressStyle: fabPressStyle, pressIn: fabPressIn, pressOut: fabPressOut } = usePressAnimation();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { paddingHorizontal: 16, paddingTop: 8 }, headerAnim]}>
        <Text style={[styles.title, { color: colors.text }]}>My Vehicles</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {vehicles.length === 0 ? (
        <EmptyState
          icon="🚗"
          title="No Vehicles"
          subtitle="Add your vehicle to start tracking fuel"
          actionLabel="Add Vehicle"
          onAction={() => router.push('/add-vehicle')}
          theme={theme}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {vehicles.map((vehicle, i) => (
            <Pressable
              key={vehicle.id}
              onLongPress={() => {
                const shouldDelete = window.confirm(`Delete ${vehicle.name}?`);
                if (shouldDelete) {
                  deleteVehicle(vehicle.id);
                }
              }}
            >
              <VehicleCard
                vehicle={vehicle}
                isActive={vehicle.id === activeVehicleId}
                onPress={(v) => {
                  setActiveVehicle(v.id);
                  (router.push as (path: string) => void)(`/vehicle/${v.id}`);
                }}
                theme={theme}
                index={i}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Animated.View style={[fabPressStyle, styles.fabContainer]}>
        <Pressable
          onPressIn={fabPressIn}
          onPressOut={fabPressOut}
          onPress={() => router.push('/add-vehicle')}
          style={[styles.fab, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  scrollView: { flex: 1 },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
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
