import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Vehicle } from '../types';
import { FuelTrackTheme } from '../store/theme';
import { useEntranceAnimation, usePressAnimation } from '../utils/animations';

interface Props { vehicle: Vehicle; isActive: boolean; onPress: (v: Vehicle) => void; theme: 'light' | 'dark'; index?: number; }

const emojis: Record<string, string> = { Car: '🚗', Bike: '🏍️', Scooty: '🛵', Truck: '🚛' };
const fuelDot: Record<string, string> = { Petrol: '#FF8C00', Diesel: '#8B4513', Electric: '#00CED1', CNG: '#32CD32' };

export function VehicleCard({ vehicle, isActive, onPress, theme, index = 0 }: Props) {
  const c = FuelTrackTheme[theme];
  const animStyle = useEntranceAnimation(index);
  const { pressStyle, pressIn, pressOut } = usePressAnimation();

  return (
    <Animated.View style={[pressStyle, animStyle]}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => onPress(vehicle)}
        style={[s.card, { backgroundColor: c.card, borderColor: isActive ? c.primary : c.border, shadowColor: c.cardShadow }]}
      >
        <View style={s.top}>
          <View style={[s.iconWrap, { backgroundColor: c.primary + '18' }]}><Text style={s.icon}>{emojis[vehicle.type] || '🚗'}</Text></View>
          <View style={s.mid}><Text style={[s.name, { color: c.text }]}>{vehicle.name}</Text><Text style={[s.plate, { color: c.textMuted }]}>{vehicle.number}</Text></View>
          <View style={[s.badge, { backgroundColor: isActive ? c.primary : c.bgSecondary }]}><Text style={[s.badgeText, { color: isActive ? '#000' : c.textMuted }]}>{isActive ? 'Active' : 'Select'}</Text></View>
        </View>
        <View style={[s.meta, { borderTopColor: c.border }]}>
          <MI label="Type" value={vehicle.type} c={c} /><MI label="Fuel" value={vehicle.fuelType} c={c} dot color={fuelDot[vehicle.fuelType]} />
          <MI label="Range" value={`${vehicle.range}km`} c={c} /><MI label="Tank" value={`${vehicle.fuelTankCapacity}L`} c={c} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const MI = ({ label, value, c, dot, color }: { label: string; value: string; c: any; dot?: boolean; color?: string }) => (
  <View style={s.mi}><Text style={[s.ml, { color: c.textMuted }]}>{label}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>{dot && <View style={[s.dot, { backgroundColor: color || c.primary }]} />}<Text style={[s.mv, { color: c.text }]}>{value}</Text></View></View>
);

const s = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 12, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  top: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 22 }, mid: { flex: 1, marginLeft: 12 }, name: { fontSize: 16, fontWeight: '700' }, plate: { fontSize: 12, marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }, badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  mi: { flex: 1, alignItems: 'center' }, ml: { fontSize: 10, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  mv: { fontSize: 13, fontWeight: '700' }, dot: { width: 7, height: 7, borderRadius: 4 },
});
