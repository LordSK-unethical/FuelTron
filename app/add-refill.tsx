import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { FuelTrackTheme } from '../src/store/theme';
import { useTheme } from '../src/hooks/useColorScheme';
import { Refill } from '../src/types';
import { getLastOdometer, validateRefill, calculateKmpl } from '../src/utils/calculations';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export default function AddRefillScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const vehicles = useStore((s) => s.vehicles);
  const refills = useStore((s) => s.refills);
  const activeVehicleId = useStore((s) => s.activeVehicleId);
  const addRefill = useStore((s) => s.addRefill);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const lastOdometer = activeVehicleId ? getLastOdometer(activeVehicleId, refills) : 0;

  const [odometer, setOdometer] = useState(lastOdometer > 0 ? String(lastOdometer) : '');
  const [fuelAdded, setFuelAdded] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [rangeAdded, setRangeAdded] = useState('');
  const [fullTank, setFullTank] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const computedKmpl =
    parseFloat(rangeAdded) > 0 && parseFloat(fuelAdded) > 0
      ? calculateKmpl(parseFloat(rangeAdded), parseFloat(fuelAdded))
      : 0;

  const handleSave = async () => {
    setError(null);
    if (!odometer || !fuelAdded || !fuelCost || !rangeAdded) return;

    if (activeVehicleId) {
      const err = validateRefill(
        parseFloat(odometer), parseFloat(fuelAdded), parseFloat(fuelCost),
        parseFloat(rangeAdded), activeVehicleId, refills
      );
      if (err) { setError(err); return; }
    }

    const refill: Refill = {
      id: generateId(),
      vehicleId: activeVehicleId || '',
      date: Date.now(),
      odometer: parseFloat(odometer),
      fuelAdded: parseFloat(fuelAdded),
      fuelCost: parseFloat(fuelCost),
      rangeAdded: parseFloat(rangeAdded),
      fullTank,
      notes,
    };

    await addRefill(refill);
    router.back();
  };

  if (!activeVehicle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>No Vehicle Selected</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Please select a vehicle from the dashboard first.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Record Refill</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text
            style={[
              styles.saveText,
              { color: colors.primary, opacity: odometer && fuelAdded && fuelCost && rangeAdded ? 1 : 0.4 },
            ]}
          >
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.vehicleInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>{activeVehicle.name}</Text>
          <Text style={[styles.vehicleDetail, { color: colors.textSecondary }]}>
            {activeVehicle.number} &middot; {activeVehicle.fuelType} &middot; {activeVehicle.fuelTankCapacity}L tank
          </Text>
        </View>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '30' }]}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Odometer Reading (km)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. 15000"
            placeholderTextColor={colors.textMuted}
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="decimal-pad"
          />
          {lastOdometer > 0 && (
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Last reading: {lastOdometer} km
            </Text>
          )}
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fuel Added (Liters)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. 35"
            placeholderTextColor={colors.textMuted}
            value={fuelAdded}
            onChangeText={setFuelAdded}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fuel Cost (₹)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. 530.00"
            placeholderTextColor={colors.textMuted}
            value={fuelCost}
            onChangeText={setFuelCost}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Approximate Range Gained (KM)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. 250"
            placeholderTextColor={colors.textMuted}
            value={rangeAdded}
            onChangeText={setRangeAdded}
            keyboardType="decimal-pad"
          />
          <Text style={[styles.hint, { color: colors.textMuted }]}>How far do you expect to go on this fuel?</Text>
          {computedKmpl > 0 && (
            <View style={[styles.kmplBadge, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text style={[styles.kmplBadgeText, { color: colors.primary }]}>
                ~{computedKmpl.toFixed(1)} KMPL estimated
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Tank?</Text>
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setFullTank(true)}
              style={[
                styles.toggleOption,
                {
                  backgroundColor: fullTank ? colors.primary : colors.bgSecondary,
                  borderColor: fullTank ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.toggleText, { color: fullTank ? '#FFFFFF' : colors.text }]}>Yes</Text>
            </Pressable>
            <Pressable
              onPress={() => setFullTank(false)}
              style={[
                styles.toggleOption,
                {
                  backgroundColor: !fullTank ? colors.primary : colors.bgSecondary,
                  borderColor: !fullTank ? colors.primary : colors.border,
                  marginLeft: 10,
                },
              ]}
            >
              <Text style={[styles.toggleText, { color: !fullTank ? '#FFFFFF' : colors.text }]}>No</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="Any notes about this refill..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
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
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
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
  kmplBadge: {
    marginTop: 10, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1, alignItems: 'center',
  },
  kmplBadgeText: { fontSize: 13, fontWeight: '700' },
  toggleRow: { flexDirection: 'row' },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleText: { fontSize: 15, fontWeight: '600' },
  textArea: {
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 80,
  },
});
