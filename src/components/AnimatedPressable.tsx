import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressAnimation } from '../utils/animations';

interface Props extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedPressable({ children, style, ...props }: Props) {
  const { pressStyle, pressIn, pressOut } = usePressAnimation();
  return (
    <Animated.View style={[pressStyle, style as any]}>
      <Pressable onPressIn={pressIn} onPressOut={pressOut} {...props}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
