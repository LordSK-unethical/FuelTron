import { Platform } from 'react-native';
import { Vehicle, Refill } from '../types';
import { computeRefillData } from './calculations';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { printToFileAsync } from 'expo-print';

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return `${formatDate(ts)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

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
      const date = formatDate(r.date);
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
    `Generated: ${formatDateTime(Date.now())}`,
    '',
    headers.join(','),
    ...rows,
  ].join('\n');
}

function buildPDFHtml(vehicle: Vehicle, refills: Refill[]): string {
  const sorted = [...refills]
    .filter((r) => r.vehicleId === vehicle.id)
    .sort((a, b) => a.date - b.date);

  const totalFuel = sorted.reduce((s, r) => s + r.fuelAdded, 0);
  const totalCost = sorted.reduce((s, r) => s + r.fuelCost, 0);
  const entriesCount = sorted.length;

  const rows = sorted
    .map((r) => {
      const computed = computeRefillData(r, refills);
      const date = formatDate(r.date);
      return `<tr>
        <td>${date}</td>
        <td>${r.odometer.toLocaleString()}</td>
        <td>${r.fuelAdded} L</td>
        <td>₹${r.fuelCost.toFixed(2)}</td>
        <td>${computed.kmpl.toFixed(1)}</td>
        <td>${computed.distanceTraveled.toFixed(0)} km</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; padding: 24px; color: #1a1a2e; }
    h1 { font-size: 22px; margin-bottom: 4px; color: #6C63FF; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .summary-card {
      background: #f4f4f9; border-radius: 10px; padding: 14px 18px; flex: 1; min-width: 120px;
    }
    .summary-card .value { font-size: 20px; font-weight: 700; color: #1a1a2e; }
    .summary-card .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #6C63FF; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) td { background: #fafafa; }
    .footer { margin-top: 24px; font-size: 11px; color: #aaa; text-align: center; }
  </style>
</head>
<body>
  <h1>FuelTron Report</h1>
  <div class="subtitle">${vehicle.name} (${vehicle.number}) &middot; ${vehicle.type} &middot; ${vehicle.fuelType}</div>

  <div class="summary">
    <div class="summary-card">
      <div class="value">${entriesCount}</div>
      <div class="label">Refills</div>
    </div>
    <div class="summary-card">
      <div class="value">${totalFuel.toFixed(1)} L</div>
      <div class="label">Total Fuel</div>
    </div>
    <div class="summary-card">
      <div class="value">₹${totalCost.toFixed(2)}</div>
      <div class="label">Total Cost</div>
    </div>
    <div class="summary-card">
      <div class="value">${entriesCount > 0 ? '₹' + (totalCost / entriesCount).toFixed(2) : '-'}</div>
      <div class="label">Avg / Refill</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th><th>Odometer</th><th>Fuel</th><th>Cost</th><th>KMPL</th><th>Distance</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">Generated on ${formatDateTime(Date.now())} &middot; FuelTron</div>
</body>
</html>`;
}

async function shareFile(uri: string, mimeType: string, dialogTitle: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle });
  }
}

export async function exportToCSV(vehicle: Vehicle, refills: Refill[]): Promise<void> {
  try {
    const csv = refillsToCSV(vehicle, refills);
    const filename = `FuelTron_${vehicle.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    const file = new File(Paths.cache, filename);
    file.create({ overwrite: true });
    file.write(csv);
    await shareFile(file.uri, 'text/csv', 'Export Refill History');
  } catch (err) {
    console.warn('[FuelTron] Export failed:', err);
  }
}

export async function exportToPDF(vehicle: Vehicle, refills: Refill[]): Promise<void> {
  try {
    const html = buildPDFHtml(vehicle, refills);
    const { uri } = await printToFileAsync({ html });
    const filename = `FuelTron_${vehicle.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const source = new File(uri);
    const dest = new File(Paths.cache, filename);
    source.copy(dest);
    await shareFile(dest.uri, 'application/pdf', 'Export PDF Report');
  } catch (err) {
    console.warn('[FuelTron] PDF export failed:', err);
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
    `Report Generated: ${formatDateTime(Date.now())}`,
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
      const date = formatDate(r.date);
      return `${i + 1}. ${date} - ${r.fuelAdded}L @ ₹${r.fuelCost} (Odo: ${r.odometer}km)`;
    }),
  ].join('\n');
}
