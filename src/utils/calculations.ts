import { Refill, Vehicle, MileageData, MonthlyExpense, Prediction, VehicleFuelState, Ride, RideStats, RideType } from '../types';

export function getVehicleRefills(vehicleId: string, refills: Refill[]): Refill[] {
  return refills
    .filter((r) => r.vehicleId === vehicleId)
    .sort((a, b) => a.date - b.date);
}

export function getLastRefill(vehicleId: string, refills: Refill[]): Refill | null {
  const sorted = getVehicleRefills(vehicleId, refills);
  return sorted.length > 0 ? sorted[sorted.length - 1] : null;
}

export function getLastOdometer(vehicleId: string, refills: Refill[], rides: Ride[] = []): number {
  const lastRefill = getLastRefill(vehicleId, refills);
  const refillOdo = lastRefill ? lastRefill.odometer : 0;
  const ridesOdo = rides
    .filter((r) => r.vehicleId === vehicleId)
    .reduce((max, r) => Math.max(max, r.currentOdometer), 0);
  return Math.max(refillOdo, ridesOdo);
}

export function calculateKmpl(rangeAdded: number, fuelAdded: number): number {
  if (fuelAdded <= 0 || rangeAdded <= 0) return 0;
  return Math.round((rangeAdded / fuelAdded) * 100) / 100;
}

export function calculateCostPerKm(totalCost: number, totalDistance: number): number {
  if (totalDistance <= 0) return 0;
  return Math.round((totalCost / totalDistance) * 100) / 100;
}

export function getVehicleFuelState(vehicle: Vehicle, refills: Refill[], rides: Ride[] = []): VehicleFuelState {
  const sorted = getVehicleRefills(vehicle.id, refills);

  if (sorted.length === 0) {
    return {
      currentFuelLiters: 0,
      remainingRange: 0,
      currentKmpl: 0,
      fuelEndOdometer: 0,
      totalDistanceTraveled: 0,
      totalFuelCost: 0,
      totalFuelConsumed: 0,
      fuelPercent: 0,
      lowFuel: true,
      lastRefillOdometer: 0,
    };
  }

  const refillsWithRange = sorted.filter((r) => r.rangeAdded > 0 && r.fuelAdded > 0);

  let currentKmpl = 0;
  if (refillsWithRange.length > 0) {
    const totalWeightedKmpl = refillsWithRange.reduce(
      (sum, r) => sum + r.fuelAdded * (r.rangeAdded / r.fuelAdded), 0
    );
    const totalFuel = refillsWithRange.reduce((sum, r) => sum + r.fuelAdded, 0);
    currentKmpl = totalFuel > 0 ? totalWeightedKmpl / totalFuel : 0;
  } else if (vehicle.range > 0 && vehicle.fuelTankCapacity > 0) {
    currentKmpl = vehicle.range / vehicle.fuelTankCapacity;
  } else if (vehicle.fuelTankCapacity > 0) {
    currentKmpl = 15;
  }

  let totalRangeBudget = 0;
  let prevOdometer = 0;

  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    if (r.rangeAdded > 0) {
      totalRangeBudget += r.rangeAdded;
    } else if (r.fuelAdded > 0 && currentKmpl > 0) {
      totalRangeBudget += r.fuelAdded * currentKmpl;
    }
    prevOdometer = r.odometer;
  }

  const totalRideDistance = rides
    .filter((r) => r.vehicleId === vehicle.id)
    .reduce((sum, r) => sum + r.distance, 0);

  const remainingRange = Math.max(0, totalRangeBudget - totalRideDistance);
  const currentFuelLiters = currentKmpl > 0
    ? Math.round((remainingRange / currentKmpl) * 10) / 10
    : 0;

  const latestOdometer = getLastOdometer(vehicle.id, refills, rides);
  const fuelEndOdometer = latestOdometer + remainingRange;
  const fuelPercent = vehicle.fuelTankCapacity > 0
    ? Math.min(100, Math.round((currentFuelLiters / vehicle.fuelTankCapacity) * 100))
    : 0;
  const totalFuelConsumed = sorted.reduce((sum, r) => sum + r.fuelAdded, 0);
  const totalFuelCost = sorted.reduce((sum, r) => sum + r.fuelCost, 0);
  const totalDistanceTraveled = Math.round(totalRideDistance);

  return {
    currentFuelLiters,
    remainingRange: Math.round(remainingRange),
    currentKmpl: Math.round(currentKmpl * 100) / 100,
    fuelEndOdometer: Math.round(fuelEndOdometer),
    totalDistanceTraveled,
    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
    totalFuelConsumed: Math.round(totalFuelConsumed * 100) / 100,
    fuelPercent,
    lowFuel: remainingRange < 100,
    lastRefillOdometer: latestOdometer,
  };
}

export function getMileageData(vehicleId: string, refills: Refill[]): MileageData[] {
  const sorted = getVehicleRefills(vehicleId, refills);
  const data: MileageData[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    const kmpl = calculateKmpl(r.rangeAdded, r.fuelAdded);
    if (kmpl > 0) {
      let distance = 0;
      if (i > 0) {
        distance = Math.max(0, r.odometer - sorted[i - 1].odometer);
      }
      data.push({
        date: r.date,
        kmpl,
        distance,
        cost: r.fuelCost,
      });
    }
  }
  return data;
}

export function getMonthlyExpenses(vehicleId: string, refills: Refill[]): MonthlyExpense[] {
  const sorted = getVehicleRefills(vehicleId, refills);
  const monthlyMap: Record<string, { totalCost: number; totalFuel: number; totalDistance: number }> = {};

  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    const date = new Date(r.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = { totalCost: 0, totalFuel: 0, totalDistance: 0 };
    }
    monthlyMap[key].totalCost += r.fuelCost;
    monthlyMap[key].totalFuel += r.fuelAdded;
    if (i > 0) {
      monthlyMap[key].totalDistance += Math.max(0, r.odometer - sorted[i - 1].odometer);
    }
  }

  return Object.entries(monthlyMap)
    .map(([month, data]) => ({
      month,
      totalCost: Math.round(data.totalCost * 100) / 100,
      totalFuel: Math.round(data.totalFuel * 100) / 100,
      totalDistance: Math.round(data.totalDistance * 100) / 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function calculateAverageKmpl(vehicleId: string, refills: Refill[]): number {
  const data = getMileageData(vehicleId, refills);
  if (data.length === 0) return 0;
  return Math.round((data.reduce((sum, d) => sum + d.kmpl, 0) / data.length) * 100) / 100;
}

export function getEstimatedKmpl(vehicle: Vehicle, refills: Refill[]): number {
  const state = getVehicleFuelState(vehicle, refills);
  if (state.currentKmpl > 0) return state.currentKmpl;
  if (vehicle.range > 0 && vehicle.fuelTankCapacity > 0) {
    return Math.round((vehicle.range / vehicle.fuelTankCapacity) * 100) / 100;
  }
  return 15;
}

export function getTotalDistance(vehicleId: string, refills: Refill[], rides: Ride[] = []): number {
  return getVehicleFuelState({ id: vehicleId } as Vehicle, refills, rides).totalDistanceTraveled;
}

export function getTotalFuelConsumed(vehicleId: string, refills: Refill[]): number {
  return getVehicleFuelState({ id: vehicleId } as Vehicle, refills).totalFuelConsumed;
}

export function getTotalFuelCost(vehicleId: string, refills: Refill[]): number {
  return getVehicleFuelState({ id: vehicleId } as Vehicle, refills).totalFuelCost;
}

export function getMonthlyFuelCost(vehicleId: string, refills: Refill[]): number {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const expenses = getMonthlyExpenses(vehicleId, refills);
  const current = expenses.find((e) => e.month === currentMonth);
  return current ? current.totalCost : 0;
}

export function predictNextRefill(vehicle: Vehicle, refills: Refill[], rides: Ride[] = []): Prediction {
  const state = getVehicleFuelState(vehicle, refills, rides);
  const avgKmpl = state.currentKmpl > 0 ? state.currentKmpl : getEstimatedKmpl(vehicle, refills);
  const dailyKm = avgKmpl > 0 ? 30 : 0;
  const daysLeft = dailyKm > 0 ? Math.round(state.remainingRange / dailyKm) : 0;

  return {
    remainingKm: state.remainingRange,
    estimatedDaysLeft: Math.max(0, daysLeft),
    nextRefillDate: daysLeft > 0 ? Date.now() + daysLeft * 86400000 : Date.now() + 7 * 86400000,
    lowFuel: state.lowFuel,
    fuelRemaining: state.currentFuelLiters,
    fuelPercent: state.fuelPercent,
    currentKmpl: avgKmpl,
    fuelEndOdometer: state.fuelEndOdometer,
  };
}

export function validateRefill(
  odometer: number,
  fuelAdded: number,
  fuelCost: number,
  rangeAdded: number,
  vehicleId: string,
  refills: Refill[],
  editingId?: string
): string | null {
  if (odometer <= 0) return 'Odometer reading must be greater than 0';
  if (fuelAdded <= 0) return 'Fuel added must be greater than 0';
  if (fuelCost <= 0) return 'Fuel cost must be greater than 0';
  if (rangeAdded < 0) return 'Range gained cannot be negative';
  if (rangeAdded === 0) return 'Please enter the approximate range you expect to gain';

  const lastOdo = getLastOdometer(vehicleId, refills.filter((r) => r.id !== editingId));
  if (lastOdo > 0 && odometer < lastOdo) {
    return `Odometer cannot be less than last reading (${lastOdo} km)`;
  }

  return null;
}

export function computeRefillData(
  refill: Refill,
  allRefills: Refill[]
): { kmpl: number; distanceTraveled: number; costPerKm: number } {
  const vehicleRefills = allRefills
    .filter((r) => r.vehicleId === refill.vehicleId && r.date < refill.date)
    .sort((a, b) => b.date - a.date);

  const prevRefill = vehicleRefills.length > 0 ? vehicleRefills[0] : null;
  const distanceTraveled = prevRefill ? Math.max(0, refill.odometer - prevRefill.odometer) : 0;

  return {
    distanceTraveled,
    kmpl: calculateKmpl(refill.rangeAdded, refill.fuelAdded),
    costPerKm: calculateCostPerKm(refill.fuelCost, distanceTraveled),
  };
}

// ===== RIDE FUNCTIONS =====

export function calculateRideDistance(previousOdometer: number, currentOdometer: number): number {
  return Math.max(0, currentOdometer - previousOdometer);
}

export function calculateFuelUsed(distance: number, kmpl: number): number {
  if (kmpl <= 0 || distance <= 0) return 0;
  return Math.round((distance / kmpl) * 100) / 100;
}

export function calculateRemainingRangeAfterRide(previousRange: number, rideDistance: number): number {
  return Math.max(0, Math.round(previousRange - rideDistance));
}

export function validateRide(
  currentOdometer: number,
  vehicleId: string,
  refills: Refill[],
  rides: Ride[],
  editingId?: string
): string | null {
  if (currentOdometer <= 0) return 'Odometer reading must be greater than 0';

  const existingRides = rides.filter((r) => r.vehicleId === vehicleId && r.id !== editingId);
  const duplicates = existingRides.some((r) => r.currentOdometer === currentOdometer);
  if (duplicates) return 'This odometer reading was already logged';

  const lastOdo = getLastOdometer(vehicleId, refills, existingRides);
  if (lastOdo > 0 && currentOdometer <= lastOdo) {
    return `Odometer must be greater than last reading (${lastOdo} km)`;
  }

  const maxJump = 2000;
  if (lastOdo > 0 && currentOdometer - lastOdo > maxJump) {
    return `Unrealistic jump of ${currentOdometer - lastOdo} km (max ${maxJump} km allowed)`;
  }

  return null;
}

export function getRideStats(vehicleId: string, rides: Ride[], refills: Refill[]): RideStats {
  const vehicleRides = rides.filter((r) => r.vehicleId === vehicleId);
  const now = Date.now();
  const DAY = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const weekStart = todayStart - today.getDay() * DAY;
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();

  const todayRides = vehicleRides.filter((r) => r.createdAt >= todayStart);
  const weekRides = vehicleRides.filter((r) => r.createdAt >= weekStart);
  const monthRides = vehicleRides.filter((r) => r.createdAt >= monthStart);

  const todayDistance = todayRides.reduce((s, r) => s + r.distance, 0);
  const weekDistance = weekRides.reduce((s, r) => s + r.distance, 0);
  const monthDistance = monthRides.reduce((s, r) => s + r.distance, 0);

  const fuelConsumedToday = todayRides.reduce((s, r) => s + r.fuelUsed, 0);

  const sinceFirstRide = vehicleRides.length > 0
    ? Math.max(1, (now - vehicleRides[0].createdAt) / DAY)
    : 1;
  const totalDist = vehicleRides.reduce((s, r) => s + r.distance, 0);
  const avgDailyUsage = Math.round(totalDist / sinceFirstRide);

  return {
    totalRides: vehicleRides.length,
    todayDistance: Math.round(todayDistance),
    weekDistance: Math.round(weekDistance),
    monthDistance: Math.round(monthDistance),
    avgRideDistance: vehicleRides.length > 0
      ? Math.round(totalDist / vehicleRides.length)
      : 0,
    fuelConsumedToday: Math.round(fuelConsumedToday * 100) / 100,
    avgDailyUsage,
  };
}
