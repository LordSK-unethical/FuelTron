import { useColorScheme as useRNColorScheme, useWindowDimensions } from 'react-native';
import { useStore } from '../store/useStore';

export function useTheme() {
  const systemScheme = useRNColorScheme();
  const storeTheme = useStore((s) => s.theme);

  const resolved: 'light' | 'dark' =
    storeTheme === 'system' ? systemScheme || 'light' : storeTheme;

  return resolved;
}
