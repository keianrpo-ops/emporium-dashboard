// src/mockData.ts
import { Kpi, TopAdRow } from './types';

export const kpisMock: Kpi[] = [
  { id: 'ingreso', label: 'Ingreso total (rango)', value: 1359670, currency: true },
  { id: 'costoProducto', label: 'Costo producto', value: 520000, currency: true },
  { id: 'costoEmpaque', label: 'Costo empaque', value: 60000, currency: true },
  { id: 'costoEnvio', label: 'Costo envío', value: 180000, currency: true },
  { id: 'comisiones', label: 'Comisiones plataforma', value: 90000, currency: true },
  { id: 'costoPublicidad', label: 'Costo publicidad', value: 250000, currency: true },
  { id: 'utilidadBruta', label: 'Utilidad bruta total', value: 356670, currency: true },
  { id: 'utilidadNeta', label: 'Utilidad neta final', value: 200000, currency: true },
];

export const topAdsBySalesMock: TopAdRow[] = [
  {
    idAnuncio: '238745623847562384',
    nombreAnuncio: 'Meta – Video Hero 1',
    ventas: 34,
    ingresos: 450000,
    roasReal: 3.2,
  },
  {
    idAnuncio: '238745623847562385',
    nombreAnuncio: 'Meta – Carrusel Sneakers',
    ventas: 27,
    ingresos: 380000,
    roasReal: 2.7,
  },
  {
    idAnuncio: '238745623847562386',
    nombreAnuncio: 'TikTok – UGC Unboxing',
    ventas: 21,
    ingresos: 310000,
    roasReal: 2.9,
  },
];
