import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { FuelTrackTheme } from '../../src/store/theme';
import { useTheme } from '../../src/hooks/useColorScheme';
import { computeRefillData } from '../../src/utils/calculations';

interface Props {
  refillId: string;
}

export default function EditRefillScreen({ refillId }: Props) {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const refill = useStore((s) => s.refills.find((r) => r.id === refillId));
  const vehicles = useStore((s) => s.vehicles);
  const allRefills = useStore((s) => s.refills);
  const updateRefill = useStore((s) => s.updateRefill);
  const deleteRefill = useStore((s) => s.deleteRefill);

  const [odometer, setOdometer] = useState(String(refill?.odometer || ''));
  const [fuelAdded, setFuelAdded] = useState(String(refill?.fuelAdded || ''));
  const [fuelCost, setFuelCost] = useState(String(refill?.fuelCost || ''));
  const [rangeAdded, setRangeAdded] = useState(String(refill?.rangeAdded || ''));
  const [fullTank, setFullTank] = useState(refill?.fullTank ?? true);
  const [notes, setNotes] = useState(refill?.notes || '');

  if (!refill) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.cancelText, { color: colors.primary }]}>Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Refill Not Found</Text>
          <View style={{ width: 50 }} />
        </View>
      </View>
    );
  }

  const vehicle = vehicles.find((v) => v.id === refill.vehicleId);
  const computed = computeRefillData(refill, allRefills);

  const handleSave = async () => {
    if (!odometer || !fuelAdded || !fuelCost || !rangeAdded) return;
    await updateRefill({
      ...refill,
      odometer: parseFloat(odometer),
      fuelAdded: parseFloat(fuelAdded),
      fuelCost: parseFloat(fuelCost),
      rangeAdded: parseFloat(rangeAdded),
      fullTank,
      notes,
    });
    router.back();
  };

  const handleDelete = () => {
    deleteRefill(refill.id);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.cancelText, { color: colors.primary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Refill</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={[styles.saveText, { color: colors.primary, opacity: odometer && fuelAdded && fuelCost && rangeAdded ? 1 : 0.4 }]}>
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {computed.kmpl && computed.kmpl > 0 && (
          <View style={[styles.computedCard, { backgroundColor: colors.card }]}>
            <View style={styles.computedRow}>
              <View style={styles.computedItem}>
                <Text style={[styles.computedValue, { color: colors.success }]}>{computed.kmpl.toFixed(1)}</Text>
                <Text style={[styles.computedLabel, { color: colors.textMuted }]}>KMPL</Text>
              </View>
              <View style={styles.computedItem}>
                <Text style={[styles.computedValue, { color: colors.text }]}>{computed.distanceTraveled?.toFixed(0) || '0'} km</Text>
                <Text style={[styles.computedLabel, { color: colors.textMuted }]}>Distance</Text>
              </View>
              <View style={styles.computedItem}>
                <Text style={[styles.computedValue, { color: colors.primary }]}>₹{computed.costPerKm?.toFixed(3) || '0'}</Text>
                <Text style={[styles.computedLabel, { color: colors.textMuted }]}>Cost/km</Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Odometer Reading (km)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fuel Added (L)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            value={fuelAdded}
            onChangeText={setFuelAdded}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fuel Cost (₹)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            value={fuelCost}
            onChangeText={setFuelCost}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Approximate Range Gained (KM)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            value={rangeAdded}
            onChangeText={setRangeAdded}
            keyboardType="decimal-pad"
            placeholder="e.g. 250"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={[styles.hint, { color: colors.textMuted }]}>How far do you expect to go on this fuel?</Text>
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Tank?</Text>
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setFullTank(true)}
              style={[styles.toggleOption, { backgroundColor: fullTank ? colors.primary : colors.bgSecondary, borderColor: fullTank ? colors.primary : colors.border }]}
            >
              <Text style={[styles.toggleText, { color: fullTank ? '#FFFFFF' : colors.text }]}>Yes</Text>
            </Pressable>
            <Pressable
              onPress={() => setFullTank(false)}
              style={[styles.toggleOption, { backgroundColor: !fullTank ? colors.primary : colors.bgSecondary, borderColor: !fullTank ? colors.primary : colors.border, marginLeft: 10 }]}
            >
              <Text style={[styles.toggleText, { color: !fullTank ? '#FFFFFF' : colors.text }]}>No</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notes</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Pressable onPress={handleDelete} style={[styles.deleteButton, { borderColor: colors.danger }]}>
          <Text style={[styles.deleteText, { color: colors.danger }]}>Delete Refill</Text>
        </Pressable>
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
  cancelText: { fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  saveBtn: { padding: 4 },
  saveText: { fontSize: 16, fontWeight: '700' },
  scrollView: { flex: 1 },
  computedCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  computedRow: { flexDirection: 'row' },
  computedItem: { flex: 1, alignItems: 'center' },
  computedValue: { fontSize: 18, fontWeight: '800' },
  computedLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
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
  deleteButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  deleteText: { fontSize: 15, fontWeight: '600' },
});
