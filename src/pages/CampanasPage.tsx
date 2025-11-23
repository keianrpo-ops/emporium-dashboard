// src/pages/CampanasPage.tsx (VERSIÓN CON GRÁFICAS)
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
  // ... (Tus definiciones de tipos existentes) ...
  Fecha_Inicio?: string;
  Inversion?: string | number;
  Ventas_registradas?: string | number;
  [key: string]: any;
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
    // Asumimos que la fecha de inicio es la mejor para agrupar la campaña
    const fecha = row.Fecha_Inicio ? row.Fecha_Inicio.substring(0, 7) : 'N/A'; // Agrupar por Mes/Año

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
      <div className="chart-tooltip">
        <p className="label">{`Mes: ${payload[0].payload.name}`}</p>
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

  // ======== Datos para Gráficas y KPIs ========
  const tendenciaData = useMemo(() => getTendenciaData(rows), [rows]);

  const totalInversion      = sumByKey(rows, 'Inversion');
  const totalImpresiones    = sumByKey(rows, 'Impresiones');
  const totalClics          = sumByKey(rows, 'Clics');
  const totalVentasReg      = sumByKey(rows, 'Ventas_registradas');

  const campKpis = [
    {
      ...kpisMock[0],
      label: 'Inversión total (ads)',
      value: totalInversion,
      currency: true,
    },
    // ... (Tus otros KPIs existentes) ...
    {
      ...kpisMock[6],
      label: 'Ventas registradas (ads)',
      value: totalVentasReg,
      currency: false,
    },
  ];

  return (
    <Layout>
      <h1 className="page-title">Campañas de Ads</h1>
      <KpiGrid kpis={campKpis} />

      {/* Gráfica de Tendencia */}
      {!loading && !error && rows.length > 0 && (
        <div className="card" style={{ marginTop: 24, padding: 16 }}>
          <div className="card-title">Tendencia: Inversión vs Ventas registradas</div>
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

      {/* Tabla de detalle */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">Top 10 campañas por inversión</div>
        
        {/* ... (Tu lógica de carga y tabla) ... */}
        
        {/* ... (Resto de la tabla y footer) ... */}
      </div>
    </Layout>
  );
};

export default CampanasPage;