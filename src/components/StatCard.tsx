import { View, Text, StyleSheet } from 'react-native';
import { FuelTrackTheme } from '../store/theme';

interface Props { title: string; value: string; subtitle?: string; icon: string; color?: string; theme: 'light' | 'dark'; }

export function StatCard({ title, value, subtitle, icon, color, theme }: Props) {
  const c = FuelTrackTheme[theme];
  const a = color || c.primary;
  return (
    <View style={[s.card, { backgroundColor: c.card, shadowColor: c.cardShadow }]}>
      <View style={[s.iconWrap, { backgroundColor: a + '18' }]}><Text style={s.icon}>{icon}</Text></View>
      <View style={s.content}>
        <Text style={[s.title, { color: c.textMuted }]}>{title}</Text>
        <Text style={[s.value, { color: c.text }]}>{value}</Text>
        {subtitle && <Text style={[s.sub, { color: c.textMuted }]}>{subtitle}</Text>}
      </View>
      <View style={[s.bar, { backgroundColor: a }]} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2, overflow: 'hidden', position: 'relative' },
  iconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 18 }, content: { flex: 1, marginLeft: 12 },
  title: { fontSize: 11, fontWeight: '600', marginBottom: 2 }, value: { fontSize: 18, fontWeight: '800' }, sub: { fontSize: 10, marginTop: 2 },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
});
