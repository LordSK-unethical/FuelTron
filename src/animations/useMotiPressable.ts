import { useMemo } from 'react';

export function useMotiPressable() {
  return useMemo(
    () => ({
      scale: 0.97,
      opacity: 0.92,
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 300,
        mass: 0.5,
      },
    }),
    []
  );
}
