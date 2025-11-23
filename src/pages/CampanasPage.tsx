// src/pages/CampanasPage.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
import { kpisMock } from '../mockData';

type CampañaRow = {
  [key: string]: any;

  Plataforma_Ads?: string;
  ID_Campaña_Ads?: string;
  Nombre_Campaña?: string;
  Estado_Campaña?: string;
  Presupuesto_Diario?: string | number;
  Moneda?: string;
  Fecha_Inicio?: string;
  Fecha_Fin?: string;
  Nombre_Adset?: string;
  Resultado_Campaña?: string;
  Impresiones_Post_Adset?: string | number;
  Costo_por_Resultado_Ads?: string | number;
  Impresiones?: string | number;
  Alcance?: string | number;
  Clics?: string | number;
  CTR_%?: string | number;
  CPC?: string | number;
  CPM?: string | number;
  Conversiones?: string | number;
  ROAS_Plataforma?: string | number;
  ROAS_Total?: string | number;
  Inversion?: string | number;
  Ventas_registradas?: string | number;
};

// --- helpers numéricos ---
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

const sumByKey = (rows: CampañaRow[], key: keyof CampañaRow): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);

const CampanasPage: React.FC = () => {
  const [rows, setRows] = useState<CampañaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSheet('Campañas_Ads');

        const parsed = Array.isArray((data as any)?.rows)
          ? ((data as any).rows as CampañaRow[])
          : Array.isArray(data)
          ? (data as CampañaRow[])
          : [];

        setRows(parsed);
      } catch (e) {
        console.error(e);
        setError('No pudimos leer la hoja "Campañas_Ads".');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ======== KPIs de campañas ========
  const totalInversion     = sumByKey(rows, 'Inversion');
  const totalPresupuesto   = sumByKey(rows, 'Presupuesto_Diario');
  const totalImpresiones   = sumByKey(rows, 'Impresiones');
  const totalClics         = sumByKey(rows, 'Clics');
  const totalConversiones  = sumByKey(rows, 'Conversiones');
  const totalVentasReg     = sumByKey(rows, 'Ventas_registradas');

  const ctrGlobal =
    totalImpresiones > 0 ? (totalClics * 100) / totalImpresiones : 0;

  const avgRoasPlat =
    rows.length > 0
      ? sumByKey(rows, 'ROAS_Plataforma') / rows.length
      : 0;

  const campKpis = [
    {
      ...kpisMock[0],
      label: 'Inversión total (ads)',
      value: totalInversion,
      currency: true,
    },
    {
      ...kpisMock[1],
      label: 'Presupuesto diario total',
      value: totalPresupuesto,
      currency: true,
    },
    {
      ...kpisMock[2],
      label: 'Impresiones',
      value: totalImpresiones,
      currency: false,
    },
    {
      ...kpisMock[3],
      label: 'Clics',
      value: totalClics,
      currency: false,
    },
    {
      ...kpisMock[4],
      label: 'CTR global (%)',
      value: ctrGlobal,
      currency: false,
    },
    {
      ...kpisMock[5],
      label: 'Conversiones reportadas',
      value: totalConversiones,
      currency: false,
    },
    {
      ...kpisMock[6],
      label: 'Ventas registradas (ads)',
      value: totalVentasReg,
      currency: false,
    },
    {
      ...kpisMock[7],
      label: 'ROAS plataforma medio',
      value: avgRoasPlat,
      currency: false,
    },
  ];

  // Top 10 campañas por inversión
  const topCampanias = [...rows]
    .sort(
      (a, b) => toNumber(b.Inversion) - toNumber(a.Inversion)
    )
    .slice(0, 10);

  return (
    <Layout>
      <h1 className="page-title">Campañas de Ads</h1>

      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Resumen de tus campañas conectadas desde la hoja <b>“Campañas_Ads”</b>.
      </p>

      <KpiGrid kpis={campKpis} />

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">Top 10 campañas por inversión</div>

        {loading && <p>Cargando campañas desde Google Sheets…</p>}
        {error && (
          <p style={{ color: '#f87171' }}>
            {error}
          </p>
        )}

        {!loading && !error && topCampanias.length === 0 && (
          <p>No hay campañas registradas aún.</p>
        )}

        {!loading && !error && topCampanias.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plataforma</th>
                  <th>Nombre campaña</th>
                  <th>Estado</th>
                  <th>Presupuesto diario</th>
                  <th>Inversión</th>
                  <th>Impresiones</th>
                  <th>Clics</th>
                  <th>CTR %</th>
                  <th>Conv.</th>
                  <th>ROAS plat.</th>
                </tr>
              </thead>
              <tbody>
                {topCampanias.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.Plataforma_Ads ?? '-'}</td>
                    <td>{row.Nombre_Campaña ?? '-'}</td>
                    <td>{row.Estado_Campaña ?? '-'}</td>
                    <td>{toNumber(row.Presupuesto_Diario).toLocaleString('es-CO')}</td>
                    <td>{toNumber(row.Inversion).toLocaleString('es-CO')}</td>
                    <td>{toNumber(row.Impresiones).toLocaleString('es-CO')}</td>
                    <td>{toNumber(row.Clics).toLocaleString('es-CO')}</td>
                    <td>{toNumber(row['CTR_%']).toFixed(2)}</td>
                    <td>{toNumber(row.Conversiones).toLocaleString('es-CO')}</td>
                    <td>{toNumber(row.ROAS_Plataforma).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            Fuente: {rows.length} filas leídas desde la hoja{' '}
            <b>“Campañas_Ads”</b>.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default CampanasPage;
