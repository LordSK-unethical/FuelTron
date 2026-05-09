import { Vehicle, Refill, Ride } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const now = Date.now();
const DAY = 86400000;

const CAR_KMPL = 15;
const BIKE_KMPL = 35;

export const sampleVehicles: Vehicle[] = [
  {
    id: generateId(),
    name: 'Honda City',
    type: 'Car',
    number: 'MH-01-AB-1234',
    fuelTankCapacity: 40,
    fuelType: 'Petrol',
    range: 620,
    createdAt: now - 90 * DAY,
  },
  {
    id: generateId(),
    name: 'Royal Enfield',
    type: 'Bike',
    number: 'MH-02-CD-5678',
    fuelTankCapacity: 15,
    fuelType: 'Petrol',
    range: 350,
    createdAt: now - 60 * DAY,
  },
];

function generateRefills(
  vehicleId: string,
  baseOdometer: number,
  tankCapacity: number,
  count: number,
  startDaysAgo: number,
  kmpl: number
): Refill[] {
  const refills: Refill[] = [];
  let currentOdometer = baseOdometer;
  let currentDate = now - startDaysAgo * DAY;
  let existingRange = 0;

  for (let i = 0; i < count; i++) {
    const distDriven = Math.floor(Math.random() * 300) + 100;
    currentOdometer += distDriven;
    currentDate += Math.floor(Math.random() * 5) + 3 * DAY;

    existingRange = Math.max(0, existingRange - distDriven);

    const fuelAdded = Math.round((tankCapacity * (0.7 + Math.random() * 0.3)) * 100) / 100;
    const fuelCost = Math.round(fuelAdded * 106 * 100) / 100;
    const fullTank = fuelAdded > tankCapacity * 0.85;
    const rangeAdded = Math.round(fuelAdded * kmpl);
    existingRange += rangeAdded;

    refills.push({
      id: generateId(),
      vehicleId,
      date: currentDate,
      odometer: currentOdometer,
      fuelAdded,
      fuelCost,
      fullTank,
      notes: fullTank ? 'Full tank refill' : 'Partial refill',
      rangeAdded,
    });
  }

  return refills;
}

export const sampleRefills: Refill[] = [
  ...generateRefills(sampleVehicles[0].id, 5000, 40, 12, 90, CAR_KMPL),
  ...generateRefills(sampleVehicles[1].id, 2000, 15, 8, 60, BIKE_KMPL),
];

function generateRides(
  vehicleId: string,
  refills: Refill[],
  kmpl: number,
  count: number
): Ride[] {
  const rides: Ride[] = [];
  const vehicleRefills = [...refills].sort((a, b) => a.date - b.date);

  for (let i = 0; i < count; i++) {
    const refillIndex = Math.min(i, vehicleRefills.length - 1);
    const refill = vehicleRefills[refillIndex];
    const previousRefill = vehicleRefills[Math.max(0, refillIndex - 1)];

    const previousOdometer = previousRefill
      ? previousRefill.odometer + Math.floor(Math.random() * 50)
      : refill.odometer - Math.floor(Math.random() * 200) - 50;

    const rideDist = Math.floor(Math.random() * 60) + 5;
    const currentOdometer = previousOdometer + rideDist;
    const fuelUsed = Math.round((rideDist / kmpl) * 100) / 100;
    const rangeLeft = refill.rangeAdded - rideDist * (i + 1) * 0.3;
    const remainingRange = Math.max(0, Math.round(rangeLeft));
    const rideTypes: Array<'City' | 'Highway' | 'Mixed'> = ['City', 'Highway', 'Mixed'];
    const rideType = rideTypes[Math.floor(Math.random() * rideTypes.length)];

    const dateOffset = Math.floor(Math.random() * 3) + 1;
    const rideDate = refill.date + dateOffset * 86400000 + Math.floor(Math.random() * 12) * 3600000;

    rides.push({
      id: generateId(),
      vehicleId,
      previousOdometer,
      currentOdometer,
      distance: rideDist,
      fuelUsed,
      remainingRange,
      rideType,
      notes: '',
      createdAt: rideDate,
    });
  }

  return rides.sort((a, b) => a.createdAt - b.createdAt);
}

export const sampleRides: Ride[] = [
  ...generateRides(sampleVehicles[0].id, sampleRefills.filter(r => r.vehicleId === sampleVehicles[0].id), CAR_KMPL, 20),
  ...generateRides(sampleVehicles[1].id, sampleRefills.filter(r => r.vehicleId === sampleVehicles[1].id), BIKE_KMPL, 12),
];
