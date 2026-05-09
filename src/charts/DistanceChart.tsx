import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MileageData } from '../types';
import { FuelTrackTheme } from '../store/theme';

interface Props { data: MileageData[]; theme: 'light' | 'dark'; }

export function DistanceChart({ data, theme }: Props) {
  const c = FuelTrackTheme[theme];
  const w = Dimensions.get('window').width - 32;
  if (data.length < 2) return <View style={[s.empty, { backgroundColor: c.card }]}><Text style={[s.emptyText, { color: c.textMuted }]}>Add at least 2 refills to see distance</Text></View>;

  const labels = data.slice(-6).map((d) => { const dt = new Date(d.date); return `${dt.getMonth()+1}/${dt.getDate()}`; });
  const distances = data.slice(-6).map((d) => d.distance);

  return (
    <View style={[s.card, { backgroundColor: c.card }]}>
      <Text style={[s.title, { color: c.text }]}>Distance per Refill</Text>
      <LineChart data={{ labels, datasets: [{ data: distances, color: () => c.accent, strokeWidth: 2 }] }} width={w - 32} height={180}
        yAxisSuffix="km" chartConfig={{
          backgroundColor: c.card, backgroundGradientFrom: c.card, backgroundGradientTo: c.card,
          decimalPlaces: 0, color: () => c.textMuted, labelColor: () => c.textSecondary,
          propsForDots: { r: '4', strokeWidth: '2', stroke: c.accent },
          propsForBackgroundLines: { strokeDasharray: '', stroke: c.border, strokeWidth: 0.5 },
        }} bezier style={s.chart} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 12 }, title: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chart: { borderRadius: 12 }, empty: { borderRadius: 16, padding: 40, marginBottom: 12, alignItems: 'center' }, emptyText: { fontSize: 14, textAlign: 'center' },
});
