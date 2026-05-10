import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: Props) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius, backgroundColor: '#E1E1E1' }, animStyle, style]}
    />
  );
}

export function SkeletonCard({ style }: { style?: any }) {
  return (
    <View style={[sk.card, style]}>
      <View style={sk.row}>
        <Skeleton width={42} height={42} borderRadius={12} />
        <View style={sk.content}>
          <Skeleton width="60%" height={12} />
          <Skeleton width="80%" height={20} style={{ marginTop: 6 }} />
        </View>
      </View>
    </View>
  );
}

const sk = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  content: { flex: 1, marginLeft: 12 },
});
