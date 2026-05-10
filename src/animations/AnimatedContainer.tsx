import { MotiView } from 'moti';
import { ReactNode } from 'react';

interface AnimatedContainerProps {
  children: ReactNode;
  index?: number;
  style?: any;
  delay?: number;
}

export function AnimatedContainer({
  children,
  index = 0,
  style,
  delay = 0,
}: AnimatedContainerProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 130,
        mass: 0.7,
        delay: index * 60 + delay,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
