// =========================
// KPI DATA TYPE
// =========================

export interface KPIData {
  // ID para gráficas, cards, etc.
  id: string;

  // Para algunos casos usamos "label" (mockData),
  // en otros usamos "title" (componentes). Los dejamos opcionales.
  label?: string;
  title?: string;

  // Valor numérico principal
  value: number;

  // Opcional: si ese valor es dinero
  currency?: boolean;

  // Campos usados en algunas views (cards con gauge, etc.)
  formattedValue?: string;
  score?: number; // 0 a 100
  trend?: 'up' | 'down' | 'stable';
}

// Alias para compatibilidad con imports existentes
export type Kpi = KPIData;


// =========================
// TOP ADS ROW
// =========================

export interface TopAdRow {
  idAnuncio: string;
  nombreAnuncio: string;
  ventas: number;
  ingresos: number;
  roasReal: number;
}


// =========================
// PERFORMANCE LEVEL
// (sin enum, compatible con 'erasableSyntaxOnly')
// =========================

export const PerformanceLevel = {
  POOR: 'POOR',
  FAIR: 'FAIR',
  GOOD: 'GOOD',
  EXCELLENT: 'EXCELLENT',
} as const;

export type PerformanceLevel =
  (typeof PerformanceLevel)[keyof typeof PerformanceLevel];


// =========================
// GAUGE COLORS
// =========================

export const GAUGE_COLORS = {
  RED: '#ef4444',    // Poor
  ORANGE: '#f97316', // Fair
  YELLOW: '#eab308', // Good
  GREEN: '#22c55e',  // Excellent
  BG: '#e5e7eb',     // Fondo del track
};
