import { useMemo } from 'react';

export function useStaggeredAnimation(index: number, baseDelay = 60) {
  return useMemo(
    () => ({
      from: { opacity: 0, translateY: 20, scale: 0.97 },
      animate: { opacity: 1, translateY: 0, scale: 1 },
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 150,
        mass: 0.7,
        delay: index * baseDelay,
      },
    }),
    [index, baseDelay]
  );
}
