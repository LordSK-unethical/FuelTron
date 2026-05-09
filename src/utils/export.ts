import { Platform } from 'react-native';
import { Vehicle, Refill } from '../types';
import { computeRefillData } from './calculations';

let FileSystem: any = null;
let Sharing: any = null;

try {
  FileSystem = require('expo-file-system');
} catch {}
try {
  Sharing = require('expo-sharing');
} catch {}

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function refillsToCSV(vehicle: Vehicle, refills: Refill[]): string {
  const headers = ['Date', 'Odometer (km)', 'Fuel Added (L)', 'Fuel Cost', 'Range Added (km)', 'Full Tank', 'Distance (km)', 'KMPL', 'Cost/km', 'Notes'];
  const rows = refills
    .sort((a, b) => a.date - b.date)
    .map((r) => {
      const computed = computeRefillData(r, refills);
      const date = new Date(r.date).toLocaleDateString();
      return [
        escapeCSV(date),
        escapeCSV(r.odometer),
        escapeCSV(r.fuelAdded),
        escapeCSV(r.fuelCost),
        escapeCSV(r.rangeAdded || 0),
        escapeCSV(r.fullTank ? 'Yes' : 'No'),
        escapeCSV(computed.distanceTraveled || 0),
        escapeCSV(computed.kmpl || 0),
        escapeCSV(computed.costPerKm || 0),
        escapeCSV(r.notes || ''),
      ].join(',');
    });

  return [
    `FuelTron Export - ${vehicle.name} (${vehicle.number})`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    headers.join(','),
    ...rows,
  ].join('\n');
}

export async function exportToCSV(vehicle: Vehicle, refills: Refill[]): Promise<void> {
  if (!FileSystem || !Sharing) {
    console.warn('[FuelTron] Export modules not available');
    return;
  }

  const csv = refillsToCSV(vehicle, refills);
  const filename = `FuelTron_${vehicle.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;

  try {
    const dir = FileSystem.documentDirectory || '';
    const fileUri = dir + filename;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType?.UTF8 || 'utf8',
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Refill History',
      });
    }
  } catch (err) {
    console.warn('[FuelTron] Export failed:', err);
  }
}

export function generateMonthlyReport(vehicle: Vehicle, refills: Refill[]): string {
  const sorted = refills
    .filter((r) => r.vehicleId === vehicle.id)
    .sort((a, b) => a.date - b.date);

  const totalFuel = sorted.reduce((s, r) => s + r.fuelAdded, 0);
  const totalCost = sorted.reduce((s, r) => s + r.fuelCost, 0);
  const entriesCount = sorted.length;

  return [
    'FUELTRON - MONTHLY REPORT',
    '========================',
    `Vehicle: ${vehicle.name} (${vehicle.number})`,
    `Type: ${vehicle.type} | Fuel: ${vehicle.fuelType}`,
    `Report Generated: ${new Date().toLocaleString()}`,
    '',
    'SUMMARY',
    '-------',
    `Total Refills: ${entriesCount}`,
    `Total Fuel Consumed: ${totalFuel.toFixed(2)} L`,
    `Total Cost: ₹${totalCost.toFixed(2)}`,
    `Average Cost/Refill: ₹${entriesCount > 0 ? (totalCost / entriesCount).toFixed(2) : '0.00'}`,
    '',
    'REFILL HISTORY',
    '-------------',
    ...sorted.map((r, i) => {
      const date = new Date(r.date).toLocaleDateString();
      return `${i + 1}. ${date} - ${r.fuelAdded}L @ ₹${r.fuelCost} (Odo: ${r.odometer}km)`;
    }),
  ].join('\n');
}
