import { useEffect } from 'react';
import { Text, TextProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedNumberProps extends TextProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  style,
  ...props
}: AnimatedNumberProps) {
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    const display = animatedValue.value.toFixed(decimals);
    return { text: `${prefix}${display}${suffix}` } as any;
  });

  return (
    <AnimatedText
      animatedProps={animatedProps}
      style={style}
      {...props}
    />
  );
}
