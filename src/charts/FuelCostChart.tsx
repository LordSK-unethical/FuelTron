import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { MonthlyExpense } from '../types';
import { FuelTrackTheme } from '../store/theme';

interface Props { data: MonthlyExpense[]; theme: 'light' | 'dark'; }

export function FuelCostChart({ data, theme }: Props) {
  const c = FuelTrackTheme[theme];
  const w = Dimensions.get('window').width - 32;
  if (data.length === 0) return <View style={[s.empty, { backgroundColor: c.card }]}><Text style={[s.emptyText, { color: c.textMuted }]}>No monthly data yet</Text></View>;

  const recent = data.slice(-6);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = recent.map((d) => months[parseInt(d.month.split('-')[1])-1]);
  const costs = recent.map((d) => d.totalCost);

  return (
    <View style={[s.card, { backgroundColor: c.card }]}>
      <Text style={[s.title, { color: c.text }]}>Monthly Fuel Cost</Text>
      <BarChart data={{ labels, datasets: [{ data: costs.length > 0 ? costs : [0] }] }} width={w - 32} height={180}
        yAxisSuffix="" yAxisLabel="₹" chartConfig={{
          backgroundColor: c.card, backgroundGradientFrom: c.card, backgroundGradientTo: c.card,
          decimalPlaces: 0, color: () => c.primary, labelColor: () => c.textSecondary, barPercentage: 0.6,
          propsForBackgroundLines: { strokeDasharray: '', stroke: c.border, strokeWidth: 0.5 },
        }} style={s.chart} fromZero />
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 12 }, title: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chart: { borderRadius: 12 }, empty: { borderRadius: 16, padding: 40, marginBottom: 12, alignItems: 'center' }, emptyText: { fontSize: 14, textAlign: 'center' },
});
