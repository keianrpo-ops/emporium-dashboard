
export interface KPIData {
  id: number;
  title: string;
  value: number;
  formattedValue: string;
  score: number; // 0 to 100
  trend: 'up' | 'down' | 'stable';
}

export interface TopAdRow {
  idAnuncio: string;
  nombreAnuncio: string;
  ventas: number;
  ingresos: number;
  roasReal: number;
}

export enum PerformanceLevel {
  POOR = 'POOR',
  FAIR = 'FAIR',
  GOOD = 'GOOD',
  EXCELLENT = 'EXCELLENT',
}

export const GAUGE_COLORS = {
  RED: '#ef4444',    // Poor
  ORANGE: '#f97316', // Fair
  YELLOW: '#eab308', // Good
  GREEN: '#22c55e',  // Excellent
  BG: '#e5e7eb',     // Track background
};