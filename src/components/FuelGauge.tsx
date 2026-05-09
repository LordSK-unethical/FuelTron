import { View, Text, StyleSheet } from 'react-native';
import { FuelTrackTheme } from '../store/theme';
import { Prediction } from '../types';

interface Props { prediction: Prediction; theme: 'light' | 'dark'; }

export function FuelGauge({ prediction, theme }: Props) {
  const c = FuelTrackTheme[theme];
  const pct = Math.min(100, Math.max(0, prediction.fuelPercent));

  const gaugeColor = pct >= 50 ? c.primary : pct >= 25 ? c.warning : c.danger;

  return (
    <View style={[s.wrap, { backgroundColor: c.card, borderColor: c.border, shadowColor: c.cardShadow }]}>
      <View style={s.top}>
        <Text style={[s.label, { color: c.textMuted }]}>Fuel Level</Text>
      </View>

      <View style={s.gaugeArea}>
        <View style={[s.outerRing, { borderColor: c.bgSecondary }]}>
          <View style={[s.innerRing, { borderColor: gaugeColor, borderLeftColor: c.bgSecondary, borderBottomColor: c.bgSecondary }]}>
            <View style={s.center}>
              <Text style={[s.pctText, { color: gaugeColor }]}>{pct}%</Text>
              <Text style={[s.pctSub, { color: c.textMuted }]}>remaining</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={s.details}>
        <View style={s.detailCol}>
          <Text style={[s.dVal, { color: c.text }]}>{prediction.fuelRemaining}L</Text>
          <Text style={[s.dLabel, { color: c.textMuted }]}>Fuel Left</Text>
        </View>
        <View style={s.detailCol}>
          <Text style={[s.dVal, { color: c.accent }]}>~{prediction.remainingKm}km</Text>
          <Text style={[s.dLabel, { color: c.textMuted }]}>Range Left</Text>
        </View>
      </View>
    </View>
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
  center: { transform: [{ rotate: '45deg' }], alignItems: 'center' },
  pctText: { fontSize: 28, fontWeight: '800' }, pctSub: { fontSize: 10, fontWeight: '500' },
  details: { flexDirection: 'row', width: '100%' }, detailCol: { flex: 1, alignItems: 'center' },
  dVal: { fontSize: 16, fontWeight: '800' }, dLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
});
