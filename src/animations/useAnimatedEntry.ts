import { useMemo } from 'react';

export function useAnimatedEntry(index = 0) {
  return useMemo(
    () => ({
      from: { opacity: 0, translateY: 24, scale: 0.96 },
      animate: { opacity: 1, translateY: 0, scale: 1 },
      transition: {
        type: 'spring' as const,
        damping: 18,
        stiffness: 120,
        mass: 0.8,
        delay: index * 80,
      },
    }),
    [index]
  );
}
