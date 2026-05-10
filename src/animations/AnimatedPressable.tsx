import { Pressable, PressableProps } from 'react-native';
import { MotiView } from 'moti';
import { useState, ReactNode } from 'react';

interface AnimatedPressableProps extends PressableProps {
  children: ReactNode;
}

export function AnimatedPressable({ children, style, ...props }: AnimatedPressableProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPressIn={(e) => { setPressed(true); props.onPressIn?.(e); }}
      onPressOut={(e) => { setPressed(false); props.onPressOut?.(e); }}
      {...props}
      style={style}
    >
      <MotiView
        animate={{ scale: pressed ? 0.97 : 1, opacity: pressed ? 0.92 : 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
