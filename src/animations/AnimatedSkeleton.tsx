import { MotiView } from 'moti';
import { useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

interface AnimatedSkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: any;
}

export function AnimatedSkeleton({
  width = '100%',
  height = 20,
  radius = 8,
  style,
}: AnimatedSkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: '#2E2E2E' },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: any }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={[{ padding: 16, borderRadius: 16, backgroundColor: '#242424' }, style]}
    >
      <AnimatedSkeleton width="40%" height={14} radius={6} style={{ marginBottom: 12 }} />
      <AnimatedSkeleton width="100%" height={32} radius={8} style={{ marginBottom: 8 }} />
      <AnimatedSkeleton width="60%" height={14} radius={6} />
    </MotiView>
  );
}
