import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Refill } from '../types';
import { FuelTrackTheme } from '../store/theme';

interface Props { refill: Refill; kmpl?: number; distanceTraveled?: number; onPress?: () => void; onLongPress?: () => void; theme: 'light' | 'dark'; }

export function RefillItem({ refill, kmpl, distanceTraveled, onPress, onLongPress, theme }: Props) {
  const c = FuelTrackTheme[theme];
  const d = new Date(refill.date);
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => [s.card, { backgroundColor: c.card, borderLeftColor: c.primary, shadowColor: c.cardShadow, opacity: pressed ? 0.95 : 1 }]}>
      <View style={s.top}>
        <View style={s.dateCol}>
          <Text style={[s.day, { color: c.text }]}>{d.getDate()}</Text>
          <Text style={[s.mon, { color: c.textMuted }]}>{d.toLocaleString('default', { month: 'short' })}</Text>
        </View>
        <View style={s.info}>
          <View style={s.row}><Text style={s.f}>⛽</Text><Text style={[s.fuel, { color: c.text }]}>{refill.fuelAdded} L</Text><Text style={[s.sep, { color: c.textMuted }]}>|</Text><Text style={[s.cost, { color: c.primary }]}>₹{refill.fuelCost.toFixed(2)}</Text></View>
          <Text style={[s.odo, { color: c.textMuted }]}>Odometer: {refill.odometer.toLocaleString()} km</Text>
        </View>
      </View>
      {(kmpl !== undefined || distanceTraveled !== undefined) && (
        <View style={[s.stats, { borderTopColor: c.border }]}>
          {kmpl !== undefined && <StatItem value={`${kmpl.toFixed(1)}`} label="KMPL" color={c.primary} c={c} />}
          {distanceTraveled !== undefined && <StatItem value={`${distanceTraveled.toFixed(0)}`} label="km" color={c.text} c={c} />}
          <StatItem value={refill.fullTank ? 'Full' : 'Partial'} label="Tank" color={refill.fullTank ? c.primary : c.warning} c={c} />
        </View>
      )}
      {refill.notes ? <Text style={[s.notes, { color: c.textMuted }]} numberOfLines={1}>{refill.notes}</Text> : null}
    </Pressable>
  );
}

const StatItem = ({ value, label, color, c }: { value: string; label: string; color: string; c: any }) => (
  <View style={s.si}><Text style={[s.sv, { color }]}>{value}</Text><Text style={[s.sl, { color: c.textMuted }]}>{label}</Text></View>
);

const s = StyleSheet.create({
  card: { borderRadius: 14, borderLeftWidth: 3, padding: 14, marginBottom: 10, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  top: { flexDirection: 'row', alignItems: 'center' }, dateCol: { alignItems: 'center', width: 44, marginRight: 12 },
  day: { fontSize: 20, fontWeight: '800' }, mon: { fontSize: 11, fontWeight: '600', marginTop: -2 },
  info: { flex: 1 }, row: { flexDirection: 'row', alignItems: 'center' },
  f: { fontSize: 14, marginRight: 4 }, fuel: { fontSize: 16, fontWeight: '700' },
  sep: { marginHorizontal: 6, fontSize: 14 }, cost: { fontSize: 15, fontWeight: '600' },
  odo: { fontSize: 12, marginTop: 2 }, stats: { flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  si: { flex: 1, alignItems: 'center' }, sv: { fontSize: 15, fontWeight: '700' }, sl: { fontSize: 10, fontWeight: '500', marginTop: 1 },
  notes: { fontSize: 11, marginTop: 8 },
});
