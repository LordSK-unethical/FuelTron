import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { useTheme } from '../src/hooks/useColorScheme';
import { FuelTrackTheme } from '../src/store/theme';

function LoadingScreen() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  return (
    <View style={[styles.loading, { backgroundColor: colors.bg }]}>
      <Text style={[styles.loadingIcon]}>⛽</Text>
      <Text style={[styles.loadingTitle, { color: colors.text }]}>FuelTrack</Text>
      <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
    </View>
  );
}

export default function RootLayout() {
  const theme = useTheme();
  const colors = FuelTrackTheme[theme];
  const initialize = useStore((s) => s.initialize);
  const initialized = useStore((s) => s.initialized);
  const loading = useStore((s) => s.loading);

  useEffect(() => {
    initialize();
  }, []);

  if (!initialized || loading) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-vehicle"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="add-refill"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="vehicle/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="refill/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="log-ride" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
});
