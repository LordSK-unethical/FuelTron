import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ThemeColors } from '../store/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 65;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface AnimatedGaugeProps {
  percent: number;
  colors: ThemeColors;
  theme: 'light' | 'dark';
  lowFuel: boolean;
}

export function AnimatedGauge({ percent, colors, lowFuel }: AnimatedGaugeProps) {
  const progress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    progress.value = withTiming(percent / 100, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [percent]);

  useEffect(() => {
    if (lowFuel) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0.3, { duration: 400 });
    }
  }, [lowFuel]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const gaugeColor = percent >= 50 ? colors.primary : percent >= 25 ? colors.warning : colors.danger;

  const bgAnimatedProps = useAnimatedProps(() => ({
    stroke: interpolateColor(
      progress.value,
      [0, 0.25, 0.5, 1],
      [colors.danger, colors.warning, colors.primary, colors.primary]
    ),
  }));

  return (
    <View style={s.container}>
      <Svg width={RADIUS * 2 + STROKE * 2} height={RADIUS * 2 + STROKE * 2}>
        <Circle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          stroke={colors.bgSecondary}
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          stroke={gaugeColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${RADIUS + STROKE} ${RADIUS + STROKE})`}
        />
      </Svg>

      <Animated.View
        style={[
          s.glow,
          {
            backgroundColor: gaugeColor,
            opacity: glowOpacity as any,
          },
        ]}
      />

      <View style={s.centerContent}>
        <Text style={[s.percentText, { color: gaugeColor }]}>{percent}%</Text>
        <Text style={[s.subText, { color: colors.textMuted }]}>remaining</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: RADIUS * 2 + STROKE * 2,
    height: RADIUS * 2 + STROKE * 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  glow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.15,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentText: {
    fontSize: 28,
    fontWeight: '800',
  },
  subText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
