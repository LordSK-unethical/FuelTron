import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSharedValue, withSpring, withTiming, useAnimatedStyle, withDelay, WithSpringConfig } from 'react-native-reanimated';

const SPRING: WithSpringConfig = { damping: 16, stiffness: 200, mass: 0.6 };
const SPRING_LIGHT: WithSpringConfig = { damping: 14, stiffness: 160, mass: 0.7 };

export function useEntranceAnimation(index = 0, delay = 50) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const scale = useSharedValue(0.96);

  const play = useCallback(() => {
    opacity.value = 0;
    translateY.value = 24;
    scale.value = 0.96;
    const d = index * delay;
    opacity.value = withDelay(d, withTiming(1, { duration: 250 }));
    translateY.value = withDelay(d, withSpring(0, SPRING_LIGHT));
    scale.value = withDelay(d, withSpring(1, SPRING));
  }, [index, delay, opacity, translateY, scale]);

  useFocusEffect(
    useCallback(() => {
      play();
    }, [play])
  );

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return style;
}

export function usePressAnimation() {
  const scale = useSharedValue(1);

  const pressIn = () => { scale.value = withSpring(0.97, SPRING); };
  const pressOut = () => { scale.value = withSpring(1, SPRING); };

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { pressStyle: style, pressIn, pressOut };
}

export function useCountAnimation(target: number, duration = 400) {
  const value = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      value.value = 0;
      value.value = withTiming(target, { duration });
    }, [target, duration, value])
  );

  const animatedStyle = useAnimatedStyle(() => ({}));

  return { animatedStyle, value };
}

export function useSlideInLeft(index = 0) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useFocusEffect(
    useCallback(() => {
      opacity.value = 0;
      translateX.value = -20;
      const d = index * 40;
      opacity.value = withDelay(d, withTiming(1, { duration: 250 }));
      translateX.value = withDelay(d, withSpring(0, SPRING_LIGHT));
    }, [index, opacity, translateX])
  );

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return style;
}
