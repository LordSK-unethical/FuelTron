import { create } from 'zustand';
import { Vehicle, Refill, ThemeMode, Ride } from '../types';
import { storage } from '../services/storage';
import { sampleVehicles, sampleRefills, sampleRides } from '../utils/sampleData';

interface AppState {
  vehicles: Vehicle[];
  refills: Refill[];
  rides: Ride[];
  activeVehicleId: string | null;
  theme: ThemeMode;
  initialized: boolean;
  loading: boolean;

  initialize: () => Promise<void>;
  setActiveVehicle: (id: string) => void;
  addVehicle: (vehicle: Vehicle) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addRefill: (refill: Refill) => Promise<void>;
  updateRefill: (refill: Refill) => Promise<void>;
  deleteRefill: (id: string) => Promise<void>;
  addRide: (ride: Ride) => Promise<void>;
  deleteRide: (id: string) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  loadSampleData: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  vehicles: [],
  refills: [],
  rides: [],
  activeVehicleId: null,
  theme: 'system',
  initialized: false,
  loading: true,

  initialize: async () => {
    try {
      const [vehicles, refills, rides, settings] = await Promise.all([
        storage.loadVehicles(),
        storage.loadRefills(),
        storage.loadRides(),
        storage.loadSettings(),
      ]);
      set({
        vehicles,
        refills,
        rides,
        theme: settings?.theme || 'system',
        activeVehicleId: vehicles.length > 0 ? vehicles[0].id : null,
        initialized: true,
        loading: false,
      });
    } catch {
      set({ initialized: true, loading: false });
    }
  },

  setActiveVehicle: (id: string) => set({ activeVehicleId: id }),

  addVehicle: async (vehicle: Vehicle) => {
    const vehicles = [...get().vehicles, vehicle];
    await storage.saveVehicles(vehicles);
    set({
      vehicles,
      activeVehicleId: get().activeVehicleId || vehicle.id,
    });
  },

  updateVehicle: async (vehicle: Vehicle) => {
    const vehicles = get().vehicles.map((v) => (v.id === vehicle.id ? vehicle : v));
    await storage.saveVehicles(vehicles);
    set({ vehicles });
  },

  deleteVehicle: async (id: string) => {
    const vehicles = get().vehicles.filter((v) => v.id !== id);
    const refills = get().refills.filter((r) => r.vehicleId !== id);
    const rides = get().rides.filter((r) => r.vehicleId !== id);
    await Promise.all([
      storage.saveVehicles(vehicles),
      storage.saveRefills(refills),
      storage.saveRides(rides),
    ]);
    set({
      vehicles,
      refills,
      rides,
      activeVehicleId:
        get().activeVehicleId === id
          ? vehicles.length > 0
            ? vehicles[0].id
            : null
          : get().activeVehicleId,
    });
  },

  addRefill: async (refill: Refill) => {
    const refills = [...get().refills, refill];
    await storage.saveRefills(refills);
    set({ refills });
  },

  updateRefill: async (refill: Refill) => {
    const refills = get().refills.map((r) => (r.id === refill.id ? refill : r));
    await storage.saveRefills(refills);
    set({ refills });
  },

  deleteRefill: async (id: string) => {
    const refills = get().refills.filter((r) => r.id !== id);
    await storage.saveRefills(refills);
    set({ refills });
  },

  addRide: async (ride: Ride) => {
    const rides = [...get().rides, ride];
    await storage.saveRides(rides);
    set({ rides });
  },

  deleteRide: async (id: string) => {
    const rides = get().rides.filter((r) => r.id !== id);
    await storage.saveRides(rides);
    set({ rides });
  },

  setTheme: async (theme: ThemeMode) => {
    await storage.saveSettings({ theme });
    set({ theme });
  },

  loadSampleData: async () => {
    await Promise.all([
      storage.saveVehicles(sampleVehicles),
      storage.saveRefills(sampleRefills),
      storage.saveRides(sampleRides),
    ]);
    set({
      vehicles: sampleVehicles,
      refills: sampleRefills,
      rides: sampleRides,
      activeVehicleId: sampleVehicles[0].id,
    });
  },

  resetAllData: async () => {
    await storage.clearAll();
    set({ vehicles: [], refills: [], rides: [], activeVehicleId: null });
  },
}));
