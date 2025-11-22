// src/pages/dashboard/DashboardHome.tsx
import React, { useEffect, useState } from 'react';

// Rutas corregidas desde /pages/dashboard/
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';

import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock, topAdsBySalesMock } from '../../mockData';

// -------------------------------
// Tipo de fila real según tu Sheet
// -------------------------------
type VentaRow = {
  [key: string]: any;
  Valor_Venta?: string | number;
  Costo_Producto?: string | number;
  Costo_Envio?: string | number;
  Utilidad?: string | number;
};

// -------------------------------
// Convierte "$450.000", "1.359.670", etc. en números
// -------------------------------
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

const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------
  // Carga desde Google Sheets REAL
  // -------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSheet('Ventas');

        const rows = Array.isArray((data as any)?.rows)
          ? (data as any).rows
          : Array.isArray(data)
          ? data
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

  // -------------------------------
  // KPIs reales desde Google Sheets
  // -------------------------------
  const ingresoTotal = ventas.reduce(
    (acc, row) => acc + toNumber(row.Valor_Venta),
    0
  );

  const costoProductoTotal = ventas.reduce(
    (acc, row) => acc + toNumber(row.Costo_Producto),
    0
  );

  const costoEnvioTotal = ventas.reduce(
    (acc, row) => acc + toNumber(row.Costo_Envio),
    0
  );

  const utilidadTotal = ventas.reduce(
    (acc, row) => acc + toNumber(row.Utilidad),
    0
  );

  // -------------------------------
  // KPIs del dashboard
  // -------------------------------
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
      value: costoProductoTotal,
      currency: true,
    },
    {
      ...kpisMock[2],
      label: 'Costo envío',
      value: costoEnvioTotal,
      currency: true,
    },
    {
      ...kpisMock[3],
      label: 'Utilidad bruta total',
      value: utilidadTotal,
      currency: true,
    },
    kpisMock[4],
    kpisMock[5],
    kpisMock[6],
    kpisMock[7],
  ];

  return (
    <Layout>
      <DateRangeBar />
      <KpiGrid kpis={kpis} />

      <div className="grid-2">
        <div className="card card--placeholder">
          <div className="card-title">Estructura de costos vs utilidad</div>
          <p>Aún no hay datos para graficar (conectaremos con Google Sheets después).</p>
        </div>

        <div className="card card--placeholder">
          <div className="card-title">Indicadores clave</div>
          <p>Margen bruto, margen neto y peso de la publicidad sobre el ingreso.</p>
        </div>
      </div>

      <TopAdsTable title="Top 10 anuncios por ventas" rows={topAdsBySalesMock} />

      <div style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        {loading && <span>Actualizando datos desde Google Sheets...</span>}
        {error && <span style={{ color: '#f87171' }}>{error}</span>}
        {!loading && !error && (
          <span>Fuente: {ventas.length} filas leídas desde la hoja <b>"Ventas"</b>.</span>
        )}
      </div>
    </Layout>
  );
};

export default DashboardHome;
