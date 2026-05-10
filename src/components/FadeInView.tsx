import { ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useEntranceAnimation } from '../utils/animations';

interface Props extends ViewProps {
  index?: number;
  delay?: number;
  children: React.ReactNode;
}

export function FadeInView({ index = 0, delay, children, style, ...props }: Props) {
  const animStyle = useEntranceAnimation(index, delay);
  return (
    <Animated.View style={[animStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
