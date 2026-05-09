import { Vehicle, Refill, Ride } from '../types';

const KEYS = {
  VEHICLES: '@fueltrack_vehicles',
  REFILLS: '@fueltrack_refills',
  RIDES: '@fueltrack_rides',
  SETTINGS: '@fueltrack_settings',
};

let AsyncStorageModule: any = null;

try {
  AsyncStorageModule = require('@react-native-async-storage/async-storage').default;
} catch {
  console.warn('[FuelTrack] AsyncStorage not available, using in-memory storage');
}

const memStore = new Map<string, string>();

function getStorage(): { getItem: (k: string) => Promise<string | null>; setItem: (k: string, v: string) => Promise<void>; removeItem: (k: string) => Promise<void> } {
  if (AsyncStorageModule) {
    return {
      getItem: (k: string) => AsyncStorageModule.getItem(k).catch(() => memStore.get(k) ?? null),
      setItem: (k: string, v: string) => AsyncStorageModule.setItem(k, v).catch(() => { memStore.set(k, v); }),
      removeItem: (k: string) => AsyncStorageModule.removeItem(k).catch(() => { memStore.delete(k); }),
    };
  }
  return {
    getItem: async (k: string) => memStore.get(k) ?? null,
    setItem: async (k: string, v: string) => { memStore.set(k, v); },
    removeItem: async (k: string) => { memStore.delete(k); },
  };
}

export const storage = {
  async saveVehicles(vehicles: Vehicle[]): Promise<void> {
    const store = getStorage();
    await store.setItem(KEYS.VEHICLES, JSON.stringify(vehicles));
  },

  async loadVehicles(): Promise<Vehicle[]> {
    const store = getStorage();
    const data = await store.getItem(KEYS.VEHICLES);
    return data ? JSON.parse(data) : [];
  },

  async saveRefills(refills: Refill[]): Promise<void> {
    const store = getStorage();
    await store.setItem(KEYS.REFILLS, JSON.stringify(refills));
  },

  async loadRefills(): Promise<Refill[]> {
    const store = getStorage();
    const data = await store.getItem(KEYS.REFILLS);
    return data ? JSON.parse(data) : [];
  },

  async saveRides(rides: Ride[]): Promise<void> {
    const store = getStorage();
    await store.setItem(KEYS.RIDES, JSON.stringify(rides));
  },

  async loadRides(): Promise<Ride[]> {
    const store = getStorage();
    const data = await store.getItem(KEYS.RIDES);
    return data ? JSON.parse(data) : [];
  },

  async saveSettings(settings: Record<string, any>): Promise<void> {
    const store = getStorage();
    await store.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async loadSettings<T = Record<string, any>>(): Promise<T | null> {
    const store = getStorage();
    const data = await store.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  async clearAll(): Promise<void> {
    const store = getStorage();
    await Promise.all([
      store.removeItem(KEYS.VEHICLES),
      store.removeItem(KEYS.REFILLS),
      store.removeItem(KEYS.RIDES),
      store.removeItem(KEYS.SETTINGS),
    ]);
  },

  async exportData(): Promise<string> {
    const store = getStorage();
    const [vehicles, refills, rides, settings] = await Promise.all([
      store.getItem(KEYS.VEHICLES),
      store.getItem(KEYS.REFILLS),
      store.getItem(KEYS.RIDES),
      store.getItem(KEYS.SETTINGS),
    ]);
    return JSON.stringify({ vehicles, refills, rides, settings }, null, 2);
  },

  async importData(json: string): Promise<void> {
    const store = getStorage();
    const data = JSON.parse(json);
    if (data.vehicles) await store.setItem(KEYS.VEHICLES, data.vehicles);
    if (data.refills) await store.setItem(KEYS.REFILLS, data.refills);
    if (data.rides) await store.setItem(KEYS.RIDES, data.rides);
    if (data.settings) await store.setItem(KEYS.SETTINGS, data.settings);
  },
};
