import { MotiView } from 'moti';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  style?: any;
}

export function AnimatedCard({ children, index = 0, style }: AnimatedCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 150,
        mass: 0.6,
        delay: index * 80,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
