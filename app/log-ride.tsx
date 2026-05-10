import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useStore } from '../src/store/useStore';
import { FuelTrackTheme } from '../src/store/theme';
import { useTheme } from '../src/hooks/useColorScheme';
import { FadeInView } from '../src/components/FadeInView';
import { useEntranceAnimation } from '../src/utils/animations';
import { Ride, RideType } from '../src/types';
import { getLastOdometer, validateRide, calculateRideDistance, calculateFuelUsed, calculateRemainingRangeAfterRide, predictNextRefill } from '../src/utils/calculations';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const RIDE_TYPES: RideType[] = ['City', 'Highway', 'Mixed'];

export default function LogRideScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const vehicles = useStore((s) => s.vehicles);
  const refills = useStore((s) => s.refills);
  const rides = useStore((s) => s.rides);
  const activeVehicleId = useStore((s) => s.activeVehicleId);
  const addRide = useStore((s) => s.addRide);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const lastOdometer = activeVehicleId ? getLastOdometer(activeVehicleId, refills, rides) : 0;

  const [currentOdometer, setCurrentOdometer] = useState('');
  const [rideType, setRideType] = useState<RideType>('City');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const headerAnim = useEntranceAnimation(0, 30);

  const odoNum = parseFloat(currentOdometer) || 0;
  const distance = odoNum > 0 && lastOdometer > 0 ? calculateRideDistance(lastOdometer, odoNum) : 0;

  const prediction = activeVehicleId && activeVehicle ? predictNextRefill(activeVehicle, refills, rides) : null;
  const currentKmpl = prediction?.currentKmpl || 0;
  const fuelUsed = distance > 0 && currentKmpl > 0 ? calculateFuelUsed(distance, currentKmpl) : 0;
  const remainingRange = prediction ? calculateRemainingRangeAfterRide(prediction.remainingKm, distance) : 0;

  const handleSave = async () => {
    setError(null);
    if (!currentOdometer || !activeVehicleId) return;

    const err = validateRide(odoNum, activeVehicleId, refills, rides);
    if (err) { setError(err); return; }

    const ride: Ride = {
      id: generateId(),
      vehicleId: activeVehicleId,
      previousOdometer: lastOdometer,
      currentOdometer: odoNum,
      distance,
      fuelUsed,
      remainingRange,
      rideType,
      notes,
      createdAt: Date.now(),
    };

    await addRide(ride);
    router.back();
  };

  if (!activeVehicle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <Animated.View style={[styles.header, headerAnim]}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>No Vehicle Selected</Text>
          <View style={{ width: 50 }} />
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.header, { paddingTop: insets.top }, headerAnim]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Log Ride</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text
            style={[
              styles.saveText,
              { color: colors.primary, opacity: currentOdometer ? 1 : 0.4 },
            ]}
          >
            Save
          </Text>
        </Pressable>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <FadeInView index={0}>
          <View style={[styles.vehicleInfo, { backgroundColor: colors.card }]}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>{activeVehicle.name}</Text>
            <Text style={[styles.vehicleDetail, { color: colors.textSecondary }]}>
              {activeVehicle.number} &middot; ~{currentKmpl.toFixed(1)} kmpl
            </Text>
          </View>
        </FadeInView>

        {error && (
          <FadeInView index={1}>
            <View style={[styles.errorBanner, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '30' }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          </FadeInView>
        )}

        <FadeInView index={1}>
          <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Current Odometer (km)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 15250"
              placeholderTextColor={colors.textMuted}
              value={currentOdometer}
              onChangeText={setCurrentOdometer}
              keyboardType="decimal-pad"
            />
            {lastOdometer > 0 && (
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                Previous odometer: {lastOdometer} km
              </Text>
            )}
          </View>
        </FadeInView>

        <FadeInView index={2}>
          <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Ride Type</Text>
            <View style={styles.toggleRow}>
              {RIDE_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setRideType(type)}
                  style={[
                    styles.toggleOption,
                    {
                      backgroundColor: rideType === type ? colors.primary : colors.bgSecondary,
                      borderColor: rideType === type ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.toggleText, { color: rideType === type ? '#FFFFFF' : colors.text }]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </FadeInView>

        {distance > 0 && (
          <FadeInView index={3}>
            <View style={[styles.preview, { backgroundColor: colors.card }]}>
              <Text style={[styles.previewTitle, { color: colors.text }]}>Ride Preview</Text>
              <View style={styles.previewGrid}>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Distance</Text>
                  <Text style={[styles.previewValue, { color: colors.text }]}>{distance} km</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Fuel Used</Text>
                  <Text style={[styles.previewValue, { color: colors.warning }]}>{fuelUsed} L</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Range Left</Text>
                  <Text style={[styles.previewValue, { color: colors.primary }]}>{remainingRange} km</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Efficiency</Text>
                  <Text style={[styles.previewValue, { color: colors.success }]}>
                    {distance > 0 && fuelUsed > 0 ? `${(distance / fuelUsed).toFixed(1)} kmpl` : '-'}
                  </Text>
                </View>
              </View>
            </View>
          </FadeInView>
        )}

        <FadeInView index={4}>
          <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
              placeholder="Traffic, route, weather, etc..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  saveBtn: { padding: 4 },
  saveText: { fontSize: 16, fontWeight: '700' },
  scrollView: { flex: 1 },
  vehicleInfo: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  vehicleName: { fontSize: 18, fontWeight: '700' },
  vehicleDetail: { fontSize: 13, marginTop: 4 },
  fieldGroup: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  hint: { fontSize: 11, marginTop: 6 },
  errorBanner: {
    marginBottom: 12, padding: 12, borderRadius: 10, borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleText: { fontSize: 13, fontWeight: '600' },
  preview: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  previewTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  previewItem: { width: '50%', marginBottom: 12 },
  previewLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  previewValue: { fontSize: 16, fontWeight: '700' },
  textArea: {
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 80,
  },
});
