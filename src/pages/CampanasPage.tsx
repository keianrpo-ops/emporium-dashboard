// src/pages/CampanasPage.tsx (VERSIÓN CORREGIDA Y LIMPIA)

import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
import { kpisMock } from '../mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type CampañaRow = {
  [key: string]: any;
  Fecha_Inicio?: string;
  Inversion?: string | number;
  Ventas_registradas?: string | number;
  Impresiones?: string | number;
  Clics?: string | number;
  'CTR_%?': string | number;
  ROAS_Plataforma?: string | number;
  Presupuesto_Diario?: string | number;
  // ... (otros campos)
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

// Helper para agrupar datos por fecha (tendencia)
const getTendenciaData = (rows: CampañaRow[]) => {
  const acc: Record<string, { Inversion: number; Ventas: number }> = {};

  rows.forEach((row) => {
    // Agrupar por Mes/Año
    const fecha = row.Fecha_Inicio ? row.Fecha_Inicio.substring(0, 7) : 'N/A';

    if (!acc[fecha]) {
      acc[fecha] = { Inversion: 0, Ventas: 0 };
    }
    acc[fecha].Inversion += toNumber(row.Inversion);
    acc[fecha].Ventas += toNumber(row.Ventas_registradas);
  });

  return Object.entries(acc)
    .sort(([fechaA], [fechaB]) => (fechaA > fechaB ? 1 : -1))
    .map(([fecha, data]) => ({
      name: fecha,
      ...data,
    }));
};

// Custom Tooltip para el gráfico de línea
const CustomLineTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip" style={{ background: '#0f172a', padding: '8px', border: '1px solid #334155' }}>
        <p className="label" style={{ fontWeight: 600 }}>{`Mes: ${payload[0].payload.name}`}</p>
        <p className="value" style={{ color: '#0ea5e9' }}>{`Inversión: $${payload[0].value.toLocaleString('es-CO')}`}</p>
        <p className="value" style={{ color: '#22c55e' }}>{`Ventas: $${payload[1].value.toLocaleString('es-CO')}`}</p>
      </div>
    );
  }
  return null;
};

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

  // ======== Cálculos Estadísticos ========
  const tendenciaData = useMemo(() => getTendenciaData(rows), [rows]);

  const totalInversion      = sumByKey(rows, 'Inversion');
  const totalImpresiones    = sumByKey(rows, 'Impresiones');
  const totalClics          = sumByKey(rows, 'Clics');
  const totalVentasReg      = sumByKey(rows, 'Ventas_registradas');
  const totalPresupuesto    = sumByKey(rows, 'Presupuesto_Diario'); // USADO para el porcentaje

  const ctrGlobal =
    totalImpresiones > 0 ? (totalClics * 100) / totalImpresiones : 0;
  
  // Porcentaje de Presupuesto Consumido (USADO)
  const presupuestoConsumidoPct = totalPresupuesto > 0 ? (totalInversion / totalPresupuesto) * 100 : 0;

  const avgRoasPlat =
    rows.length > 0
      ? sumByKey(rows, 'ROAS_Plataforma') / rows.length
      : 0;

  // === KPIs ===
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
      unit: '%',
    },
    {
      ...kpisMock[5],
      label: 'Ventas registradas (ads)',
      value: totalVentasReg,
      currency: false,
    },
    {
      ...kpisMock[7],
      label: 'ROAS plataforma medio',
      value: avgRoasPlat,
      currency: false,
      unit: 'x',
    },
  ];

  // Top 10 campañas por inversión (USADO)
  const topCampanias = useMemo(() => ([...rows]
    .sort(
      (a, b) => toNumber(b.Inversion) - toNumber(a.Inversion)
    )
    .slice(0, 10)), [rows]);

  return (
    <Layout>
      <h1 className="page-title">Campañas de Ads</h1>
      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Resumen de tus campañas conectadas desde la hoja <b>“Campañas_Ads”</b>.
      </p>

      {/* Grid de KPIs */}
      <KpiGrid kpis={campKpis} />

      {/* Gráfica de Tendencia (Línea) y Barra de Progreso */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1fr',
          gap: 24,
          marginTop: 24
        }}
      >
        {/* Gráfica de Tendencia */}
        {!loading && !error && rows.length > 0 && (
          <div className="card" style={{ padding: 16 }}>
            <div className="card-title">Tendencia: Inversión vs Ventas (Mensual)</div>
            <div style={{ width: '100%', height: 300, color: '#9ca3af' }}>
              <ResponsiveContainer>
                <LineChart data={tendenciaData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis yAxisId="left" stroke="#0ea5e9" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#22c55e" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />

                  <Tooltip content={<CustomLineTooltip />} />

                  <Line yAxisId="left" type="monotone" dataKey="Inversion" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Inversión" />
                  <Line yAxisId="right" type="monotone" dataKey="Ventas" stroke="#22c55e" strokeWidth={2} dot={false} name="Ventas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Barra de Progreso de Presupuesto */}
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="card-title" style={{ marginBottom: 15 }}>Progreso del Presupuesto Total</div>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#f97316' }}>
            {presupuestoConsumidoPct.toFixed(1)}%
          </p>
          <p style={{ opacity: 0.7, fontSize: 13, marginBottom: 10 }}>
            Inversión total vs Presupuesto Diario proyectado.
          </p>
          {/* Componente de Barra de Progreso (Ahora con estilo inline para evitar la dependencia ProgressBar) */}
          <div style={{ height: 10, background: '#1f2937', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, presupuestoConsumidoPct)}%`,
                height: '100%',
                background: presupuestoConsumidoPct > 90 ? '#ef4444' : '#f97316',
                transition: 'width 0.5s'
              }}
            />
          </div>
          <p style={{ fontSize: 11, opacity: 0.5, marginTop: 10 }}>
            Total Invertido: ${totalInversion.toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      {/* Tabla de detalle */}
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

        {/* Tabla de Campañas */}
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