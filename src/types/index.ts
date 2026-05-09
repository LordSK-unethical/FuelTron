export type VehicleType = 'Car' | 'Bike' | 'Scooty' | 'Truck';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'CNG';
export type ThemeMode = 'light' | 'dark' | 'system';
export type RideType = 'City' | 'Highway' | 'Mixed';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  number: string;
  fuelTankCapacity: number;
  fuelType: FuelType;
  range: number;
  createdAt: number;
}

export interface Refill {
  id: string;
  vehicleId: string;
  date: number;
  odometer: number;
  fuelAdded: number;
  fuelCost: number;
  fullTank: boolean;
  notes: string;
  rangeAdded: number;
}

export interface Ride {
  id: string;
  vehicleId: string;
  previousOdometer: number;
  currentOdometer: number;
  distance: number;
  fuelUsed: number;
  remainingRange: number;
  rideType: RideType;
  notes: string;
  createdAt: number;
}

export interface VehicleFuelState {
  currentFuelLiters: number;
  remainingRange: number;
  currentKmpl: number;
  fuelEndOdometer: number;
  totalDistanceTraveled: number;
  totalFuelCost: number;
  totalFuelConsumed: number;
  fuelPercent: number;
  lowFuel: boolean;
  lastRefillOdometer: number;
}

export interface MileageData {
  date: number;
  kmpl: number;
  distance: number;
  cost: number;
}

export interface RideStats {
  totalRides: number;
  todayDistance: number;
  weekDistance: number;
  monthDistance: number;
  avgRideDistance: number;
  fuelConsumedToday: number;
  avgDailyUsage: number;
}

export interface MonthlyExpense {
  month: string;
  totalCost: number;
  totalFuel: number;
  totalDistance: number;
}

export interface Prediction {
  remainingKm: number;
  estimatedDaysLeft: number;
  nextRefillDate: number;
  lowFuel: boolean;
  fuelRemaining: number;
  fuelPercent: number;
  currentKmpl: number;
  fuelEndOdometer: number;
}
