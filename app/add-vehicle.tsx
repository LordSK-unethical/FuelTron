import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { FuelTrackTheme } from '../src/store/theme';
import { useTheme } from '../src/hooks/useColorScheme';
import { Vehicle, VehicleType, FuelType } from '../src/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const VEHICLE_TYPES: VehicleType[] = ['Car', 'Bike', 'Scooty', 'Truck'];
const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'CNG'];

type Option = 'type' | 'fuel';

export default function AddVehicleScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const insets = useSafeAreaInsets();
  const addVehicle = useStore((s) => s.addVehicle);

  const [name, setName] = useState('');
  const [type, setType] = useState<VehicleType>('Car');
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [range, setRange] = useState('');
  const [showOptions, setShowOptions] = useState<Option | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !number.trim() || !capacity) return;

    const vehicle: Vehicle = {
      id: generateId(),
      name: name.trim(),
      type,
      number: number.trim().toUpperCase(),
      fuelTankCapacity: parseFloat(capacity),
      fuelType,
      range: range ? parseFloat(range) : 0,
      createdAt: Date.now(),
    };

    await addVehicle(vehicle);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Vehicle</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={[styles.saveText, { color: colors.primary, opacity: name && number && capacity ? 1 : 0.4 }]}>
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Vehicle Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. My Honda City"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Vehicle Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. MH-01-AB-1234"
            placeholderTextColor={colors.textMuted}
            value={number}
            onChangeText={setNumber}
            autoCapitalize="characters"
          />
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Vehicle Type</Text>
          <Pressable
            onPress={() => setShowOptions(showOptions === 'type' ? null : 'type')}
            style={[styles.selectButton, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
          >
            <Text style={[styles.selectText, { color: colors.text }]}>{type}</Text>
            <Text style={[styles.selectArrow, { color: colors.textSecondary }]}>
              {showOptions === 'type' ? '▲' : '▼'}
            </Text>
          </Pressable>
          {showOptions === 'type' && (
            <View style={[styles.optionsContainer, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              {VEHICLE_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => { setType(t); setShowOptions(null); }}
                  style={[styles.optionItem, { backgroundColor: type === t ? colors.primary + '15' : 'transparent' }]}
                >
                  <Text style={[styles.optionText, { color: type === t ? colors.primary : colors.text }]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fuel Tank Capacity (Liters)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. 40"
            placeholderTextColor={colors.textMuted}
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Tank Range (KM)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. 600"
            placeholderTextColor={colors.textMuted}
            value={range}
            onChangeText={setRange}
            keyboardType="decimal-pad"
          />
          <Text style={[styles.fieldHint, { color: colors.textMuted }]}>Approximate distance on a full tank</Text>
        </View>

        <View style={[styles.fieldGroup, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fuel Type</Text>
          <Pressable
            onPress={() => setShowOptions(showOptions === 'fuel' ? null : 'fuel')}
            style={[styles.selectButton, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
          >
            <Text style={[styles.selectText, { color: colors.text }]}>{fuelType}</Text>
            <Text style={[styles.selectArrow, { color: colors.textSecondary }]}>
              {showOptions === 'fuel' ? '▲' : '▼'}
            </Text>
          </Pressable>
          {showOptions === 'fuel' && (
            <View style={[styles.optionsContainer, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              {FUEL_TYPES.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => { setFuelType(f); setShowOptions(null); }}
                  style={[styles.optionItem, { backgroundColor: fuelType === f ? colors.primary + '15' : 'transparent' }]}
                >
                  <Text style={[styles.optionText, { color: fuelType === f ? colors.primary : colors.text }]}>{f}</Text>
                </Pressable>
              ))}
            </View>
          )}
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
  fieldHint: {
    fontSize: 11,
    marginTop: 6,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectText: { fontSize: 16, fontWeight: '500' },
  selectArrow: { fontSize: 12 },
  optionsContainer: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optionText: { fontSize: 15, fontWeight: '500' },
});
