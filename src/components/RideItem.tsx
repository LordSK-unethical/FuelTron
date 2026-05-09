import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ride } from '../types';
import { FuelTrackTheme } from '../store/theme';

interface Props {
  ride: Ride;
  onPress?: () => void;
  onLongPress?: () => void;
  theme: 'light' | 'dark';
}

export function RideItem({ ride, onPress, onLongPress, theme }: Props) {
  const c = FuelTrackTheme[theme];
  const d = new Date(ride.createdAt);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        s.card,
        {
          backgroundColor: c.card,
          borderLeftColor: c.success,
          shadowColor: c.cardShadow,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={s.top}>
        <View style={s.dateCol}>
          <Text style={[s.day, { color: c.text }]}>{d.getDate()}</Text>
          <Text style={[s.mon, { color: c.textMuted }]}>
            {d.toLocaleString('default', { month: 'short' })}
          </Text>
        </View>
        <View style={s.info}>
          <View style={s.row}>
            <Text style={s.f}>🛣️</Text>
            <Text style={[s.distance, { color: c.text }]}>{ride.distance} km</Text>
            <Text style={[s.sep, { color: c.textMuted }]}>|</Text>
            <Text style={[s.fuel, { color: c.warning }]}>{ride.fuelUsed} L</Text>
          </View>
          <Text style={[s.odo, { color: c.textMuted }]}>
            Odometer: {ride.currentOdometer.toLocaleString()} km
          </Text>
        </View>
      </View>
      <View style={[s.stats, { borderTopColor: c.border }]}>
        <View style={s.si}>
          <Text style={[s.sv, { color: c.primary }]}>{ride.rideType}</Text>
          <Text style={[s.sl, { color: c.textMuted }]}>Type</Text>
        </View>
        <View style={s.si}>
          <Text style={[s.sv, { color: c.text }]}>
            {ride.remainingRange.toLocaleString()} km
          </Text>
          <Text style={[s.sl, { color: c.textMuted }]}>Range Left</Text>
        </View>
        <View style={s.si}>
          <Text style={[s.sv, { color: c.text }]}>
            {ride.distance} km
          </Text>
          <Text style={[s.sl, { color: c.textMuted }]}>Distance</Text>
        </View>
      </View>
      {ride.notes ? (
        <Text style={[s.notes, { color: c.textMuted }]} numberOfLines={1}>
          {ride.notes}
        </Text>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderLeftWidth: 3,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  top: { flexDirection: 'row', alignItems: 'center' },
  dateCol: { alignItems: 'center', width: 44, marginRight: 12 },
  day: { fontSize: 20, fontWeight: '800' },
  mon: { fontSize: 11, fontWeight: '600', marginTop: -2 },
  info: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  f: { fontSize: 14, marginRight: 4 },
  distance: { fontSize: 16, fontWeight: '700' },
  sep: { marginHorizontal: 6, fontSize: 14 },
  fuel: { fontSize: 15, fontWeight: '600' },
  odo: { fontSize: 12, marginTop: 2 },
  stats: { flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  si: { flex: 1, alignItems: 'center' },
  sv: { fontSize: 14, fontWeight: '700' },
  sl: { fontSize: 10, fontWeight: '500', marginTop: 1 },
  notes: { fontSize: 11, marginTop: 8 },
});
