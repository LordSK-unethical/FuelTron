import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FuelTrackTheme } from '../store/theme';

interface Props { icon: string; title: string; subtitle: string; actionLabel?: string; onAction?: () => void; theme: 'light' | 'dark'; }

export function EmptyState({ icon, title, subtitle, actionLabel, onAction, theme }: Props) {
  const c = FuelTrackTheme[theme];
  return (
    <View style={s.container}>
      <View style={[s.iconWrap, { backgroundColor: c.primary + '12' }]}><Text style={s.icon}>{icon}</Text></View>
      <Text style={[s.title, { color: c.text }]}>{title}</Text>
      <Text style={[s.sub, { color: c.textSecondary }]}>{subtitle}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={({ pressed }) => [s.btn, { backgroundColor: c.primary, opacity: pressed ? 0.9 : 1 }]}>
          <Text style={s.btnText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  iconWrap: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  icon: { fontSize: 40 }, title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  btn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  btnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
