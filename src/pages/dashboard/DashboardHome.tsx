// src/pages/dashboard/DashboardHome.tsx
import React, { useEffect, useState } from 'react';

import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';

// Si ya no usas mocks, puedes borrar estas importaciones más adelante
import { kpisMock, topAdsBySalesMock } from '../../mockData';

// Tipo genérico de fila de la hoja "Ventas"
type VentaRow = {
  [key: string]: any;
  Valor_Venta?: string | number;
  Costo_Proveedor?: string | number;
  Costo_Envio?: string | number;
  Costo_CPA?: string | number;
  Costo_de_Venta?: string | number;
  Costo_Producto?: string | number;
  Utilidad?: string | number;
};

// Convierte "220.000", "$450.000", etc. a number
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value
      .replace(/[\s$]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const n = Number(normalized);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

// Helper para sumar una columna por nombre de campo
const sumByKey = (rows: VentaRow[], key: keyof VentaRow): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);

const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSheet('Ventas');

        // Apps Script devuelve { rows: [...] }
        const rows = Array.isArray((data as any)?.rows)
          ? ((data as any).rows as VentaRow[])
          : Array.isArray(data)
          ? (data as VentaRow[])
          : [];

        setVentas(rows);
      } catch (e) {
        console.error(e);
        setError('No pudimos leer los datos de Google Sheets.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // === SUMAS REALES (todas las filas) ===
  const ingresoTotal      = sumByKey(ventas, 'Valor_Venta');      // P
  const costoProveedor    = sumByKey(ventas, 'Costo_Proveedor');  // Q
  const costoEnvio        = sumByKey(ventas, 'Costo_Envio');      // R
  const costoPublicidad   = sumByKey(ventas, 'Costo_CPA');        // S (Ads / CPA)
  const comisionesPlata   = sumByKey(ventas, 'Costo_de_Venta');   // T (plataforma / contraentrega)
  const utilidadTotal     = sumByKey(ventas, 'Utilidad');         // V

  // Si quieres una "utilidad neta" igual a bruta por ahora:
  const utilidadNeta = utilidadTotal;

  // === KPIs DEL DASHBOARD (ya sin números fijos) ===
  const kpis = [
    {
      ...kpisMock[0],
      label: 'Ingreso total (rango)',
      value: ingresoTotal,
      currency: true,
    },
    {
      ...kpisMock[1],
      label: 'Costo producto',
      value: costoProveedor,
      currency: true,
    },
    {
      ...kpisMock[2],
      label: 'Costo envío',
      value: costoEnvio,
      currency: true,
    },
    {
      ...kpisMock[3],
      label: 'Comisiones plataforma',
      value: comisionesPlata,
      currency: true,
    },
    {
      ...kpisMock[4],
      label: 'Costo publicidad',
      value: costoPublicidad,
      currency: true,
    },
    {
      ...kpisMock[5],
      label: 'Utilidad bruta total',
      value: utilidadTotal,
      currency: true,
    },
    {
      ...kpisMock[6],
      label: 'Utilidad neta final',
      value: utilidadNeta,
      currency: true,
    },
    // Si quieres dejar un KPI libre para otra cosa,
    // puedes poner 0 o algo temporal:
    {
      ...kpisMock[7],
      label: 'KPI libre',
      value: 0,
      currency: true,
    },
  ];

  return (
    <Layout>
      <DateRangeBar />
      <KpiGrid kpis={kpis} />

      <div className="grid-2">
        <div className="card card--placeholder">
          <div className="card-title">Estructura de costos vs utilidad</div>
          <p>
            Aún no hay datos para graficar (conectaremos con Google Sheets
            después).
          </p>
        </div>

        <div className="card card--placeholder">
          <div className="card-title">Indicadores clave</div>
          <p>
            Margen bruto, margen neto y peso de la publicidad sobre el ingreso.
          </p>
        </div>
      </div>

      <TopAdsTable
        title="Top 10 anuncios por ventas"
        rows={topAdsBySalesMock} // más adelante lo conectamos también a Sheets
      />

      <div style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        {loading && <span>Actualizando datos desde Google Sheets...</span>}
        {error && <span style={{ color: '#f87171' }}>{error}</span>}
        {!loading && !error && (
          <span>
            Fuente: {ventas.length} filas leídas desde la hoja <b>"Ventas"</b>.
          </span>
        )}
      </div>
    </Layout>
  );
};

export default DashboardHome;
