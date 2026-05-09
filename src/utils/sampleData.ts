import { Vehicle, Refill } from '../types';

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
