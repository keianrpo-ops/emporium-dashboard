// src/types.ts

export interface Kpi {
  id: string;
  label: string;
  value: number;
  currency?: boolean;
  percentage?: boolean;
}

export interface TopAdRow {
  idAnuncio: string;
  nombreAnuncio: string;
  ventas: number;
  ingresos: number;
  roasReal: number;
}
