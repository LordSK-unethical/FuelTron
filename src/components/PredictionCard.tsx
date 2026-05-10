import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Prediction } from '../types';
import { FuelTrackTheme } from '../store/theme';
import { useEntranceAnimation } from '../utils/animations';

interface Props { prediction: Prediction; theme: 'light' | 'dark'; index?: number; }

export function PredictionCard({ prediction, theme, index = 0 }: Props) {
  const c = FuelTrackTheme[theme];
  const pct = Math.min(100, Math.max(0, prediction.fuelPercent));
  const animStyle = useEntranceAnimation(index);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [pct, progress]);

  const progStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <Animated.View style={[s.card, { backgroundColor: c.card, borderColor: prediction.lowFuel ? c.danger + '40' : c.border, shadowColor: c.cardShadow }, animStyle]}>
      <View style={s.head}>
        <Text style={s.icon}>⛽</Text>
        <Text style={[s.title, { color: c.text }]}>Refuel Prediction</Text>
        {prediction.lowFuel && <View style={[s.warn, { backgroundColor: c.danger }]}><Text style={s.wt}>Low!</Text></View>}
      </View>

      <View style={s.rangeRow}>
        <Text style={[s.km, { color: prediction.lowFuel ? c.danger : c.accent }]}>
          ~{prediction.remainingKm} km left
        </Text>
      </View>

      <View style={s.fuelRow}>
        <View style={s.fuelInfo}>
          <Text style={[s.fuelLabel, { color: c.textMuted }]}>Fuel Remaining</Text>
          <Text style={[s.fuelVal, { color: c.text }]}>{prediction.fuelRemaining}L</Text>
        </View>
        <View style={s.fuelInfo}>
          <Text style={[s.fuelLabel, { color: c.textMuted }]}>Days Left</Text>
          <Text style={[s.fuelVal, { color: c.text }]}>{prediction.estimatedDaysLeft}d</Text>
        </View>
        <View style={s.fuelInfo}>
          <Text style={[s.fuelLabel, { color: c.textMuted }]}>Est. Refill</Text>
          <Text style={[s.fuelVal, { color: c.text }]}>{new Date(prediction.nextRefillDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={[s.progBg, { backgroundColor: c.bgSecondary }]}>
        <Animated.View style={[s.progFill, { backgroundColor: prediction.lowFuel ? c.danger : c.primary }, progStyle]} />
      </View>

      <Text style={[s.footer, { color: c.textMuted }]}>
        {prediction.lowFuel ? 'Low fuel — refill soon' : 'Based on your average mileage'}
      </Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icon: { fontSize: 20, marginRight: 8 }, title: { fontSize: 15, fontWeight: '700', flex: 1 },
  warn: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 }, wt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  rangeRow: { marginBottom: 12 }, km: { fontSize: 24, fontWeight: '800' },
  fuelRow: { flexDirection: 'row', marginBottom: 12 }, fuelInfo: { flex: 1, alignItems: 'center' },
  fuelLabel: { fontSize: 10, fontWeight: '500', marginBottom: 2 }, fuelVal: { fontSize: 15, fontWeight: '700' },
  progBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  progFill: { height: '100%', borderRadius: 3 }, footer: { fontSize: 11, textAlign: 'center' },
});
