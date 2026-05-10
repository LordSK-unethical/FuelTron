import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { FuelTrackTheme } from '../store/theme';
import { Prediction } from '../types';
import { useEntranceAnimation } from '../utils/animations';

interface Props { prediction: Prediction; theme: 'light' | 'dark'; }

export function FuelGauge({ prediction, theme }: Props) {
  const c = FuelTrackTheme[theme];
  const pct = Math.min(100, Math.max(0, prediction.fuelPercent));
  const gaugeColor = pct >= 50 ? c.primary : pct >= 25 ? c.warning : c.danger;
  const animStyle = useEntranceAnimation(0);

  const pctAnim = useSharedValue(0);
  const glow = useSharedValue(1);

  useEffect(() => {
    pctAnim.value = withTiming(pct, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [pct, pctAnim]);

  useEffect(() => {
    if (prediction.lowFuel) {
      glow.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1, true
      );
    } else {
      glow.value = withTiming(1, { duration: 300 });
    }
  }, [prediction.lowFuel, glow]);

  const pctStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: '45deg' }, { scale: 0.5 + pctAnim.value / 200 }],
  }));

  const gaugeStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const rangeAnim = useSharedValue(0);
  useEffect(() => {
    rangeAnim.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [prediction.remainingKm, rangeAnim]);

  const rangeStyle = useAnimatedStyle(() => ({
    opacity: rangeAnim.value,
    transform: [{ translateY: (1 - rangeAnim.value) * 12 }],
  }));

  return (
    <Animated.View style={[s.wrap, { backgroundColor: c.card, borderColor: c.border, shadowColor: c.cardShadow }, animStyle]}>
      <View style={s.top}>
        <Text style={[s.label, { color: c.textMuted }]}>Fuel Level</Text>
        {prediction.lowFuel && (
          <Animated.View style={[s.warnBadge, { backgroundColor: c.danger }, gaugeStyle]}>
            <Text style={s.warnText}>LOW</Text>
          </Animated.View>
        )}
      </View>

      <View style={s.gaugeArea}>
        <View style={[s.outerRing, { borderColor: c.bgSecondary }]}>
          <Animated.View style={[s.innerRing, { borderTopColor: gaugeColor, borderRightColor: gaugeColor, borderLeftColor: c.bgSecondary, borderBottomColor: c.bgSecondary }, gaugeStyle]}>
            <Animated.View style={[s.center, pctStyle]}>
              <Text style={[s.pctText, { color: gaugeColor }]}>{pct}%</Text>
              <Text style={[s.pctSub, { color: c.textMuted }]}>remaining</Text>
            </Animated.View>
          </Animated.View>
        </View>
      </View>

      <View style={s.details}>
        <View style={s.detailCol}>
          <Text style={[s.dVal, { color: c.text }]}>{prediction.fuelRemaining}L</Text>
          <Text style={[s.dLabel, { color: c.textMuted }]}>Fuel Left</Text>
        </View>
        <Animated.View style={[s.detailCol, rangeStyle]}>
          <Text style={[s.dVal, { color: c.accent }]}>~{prediction.remainingKm}km</Text>
          <Text style={[s.dLabel, { color: c.textMuted }]}>Range Left</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  top: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', flex: 1, textTransform: 'uppercase', letterSpacing: 1 },
  warnBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  warnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  gaugeArea: { marginBottom: 16 },
  outerRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  innerRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 6, justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-45deg' }] },
  center: { alignItems: 'center' },
  pctText: { fontSize: 28, fontWeight: '800' }, pctSub: { fontSize: 10, fontWeight: '500' },
  details: { flexDirection: 'row', width: '100%' }, detailCol: { flex: 1, alignItems: 'center' },
  dVal: { fontSize: 16, fontWeight: '800' }, dLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
});
