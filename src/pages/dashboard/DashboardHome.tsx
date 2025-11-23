// src/pages/dashboard/DashboardHome.tsx (VERSIÓN FINAL CON GRÁFICAS)
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock, topAdsBySalesMock } from '../../mockData';
import { Doughnut } from 'react-chartjs-2'; // Usaremos Chart.js para la Dona

// Importamos los tipos de datos necesarios
type VentaRow = {
  [key: string]: any;
  Valor_Venta?: string | number;
  Costo_Proveedor?: string | number;
  Costo_Envio?: string | number;
  Costo_CPA?: string | number;
  Costo_de_Venta?: string | number;
  Utilidad?: string | number;
};
type CostosFijosRow = {
  [key: string]: any;
  Monto_Mensual?: string | number;
};

// ... (Tus helpers toNumber, sumByKey, getRows existentes) ...
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
const sumByKey = <T extends Record<string, any>>(
  rows: T[],
  key: keyof T
): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);
const getRows = <T extends Record<string, any>>(data: any): T[] => {
  if (Array.isArray(data?.rows)) return data.rows as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
};


// ========= LÓGICA DE GRÁFICAS PARA COSTOS =========
const getCostosDoughnutData = (
  costoProveedor: number,
  costoEnvio: number,
  costoPublicidad: number,
  comisionesPlata: number,
  utilidadBruta: number
) => {
  const totalCostos = costoProveedor + costoEnvio + costoPublicidad + comisionesPlata;
  const total = totalCostos + utilidadBruta;
  
  if (total === 0) return { labels: [], datasets: [] };

  return {
    labels: [
      'Utilidad Bruta', 
      'Costo Proveedor', 
      'Costo Envío', 
      'Costo Publicidad (CPA)', 
      'Comisiones Plataforma'
    ],
    datasets: [
      {
        data: [
          utilidadBruta, 
          costoProveedor, 
          costoEnvio, 
          costoPublicidad, 
          comisionesPlata
        ],
        backgroundColor: ['#22c55e', '#f97316', '#0ea5e9', '#eab308', '#a855f7'],
        hoverBackgroundColor: ['#4ade80', '#fb923c', '#38bdf8', '#facc15', '#c084fc'],
        borderWidth: 2,
        borderColor: '#020617',
        hoverOffset: 4,
      },
    ],
  };
};

const doughnutOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%', // efecto dona
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#e5e7eb', boxWidth: 14 },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: $${value.toLocaleString('es-CO')} (${percentage}%)`;
        },
      },
    },
  },
};


// ========= COMPONENTE PRINCIPAL =========

const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostosFijosRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... (Tu useEffect para cargar datos) ...
  useEffect(() => {
    const load = async () => {
      try {
        const [ventasData, costosFijosData] = await Promise.all([
          fetchSheet('Ventas'),
          fetchSheet('Costos_Fijos'),
        ]);

        const ventasRows = getRows<VentaRow>(ventasData);
        const costosFijosRows = getRows<CostosFijosRow>(costosFijosData);

        setVentas(ventasRows);
        setCostosFijos(costosFijosRows);
      } catch (e) {
        console.error(e);
        setError('No pudimos leer los datos de Google Sheets.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  // === SUMAS REALES (VENTAS) ===
  const ingresoTotal = sumByKey<VentaRow>(ventas, 'Valor_Venta');
  const costoProveedor = sumByKey<VentaRow>(ventas, 'Costo_Proveedor');
  const costoEnvio = sumByKey<VentaRow>(ventas, 'Costo_Envio');
  const costoPublicidad = sumByKey<VentaRow>(ventas, 'Costo_CPA');
  const comisionesPlata = sumByKey<VentaRow>(ventas, 'Costo_de_Venta');
  const utilidadTotal = sumByKey<VentaRow>(ventas, 'Utilidad');

  // === SUMA COSTOS FIJOS ===
  const totalCostosFijos = sumByKey<CostosFijosRow>(
    costosFijos,
    'Monto_Mensual'
  );

  // === CÁLCULOS ESTADÍSTICOS DE MARGEN ===
  const utilidadNeta = utilidadTotal - totalCostosFijos;
  const margenBrutoPct = ingresoTotal > 0 ? (utilidadTotal / ingresoTotal) * 100 : 0;
  const pesoPublicidadPct = ingresoTotal > 0 ? (costoPublicidad / ingresoTotal) * 100 : 0;

  // === KPIs DEL DASHBOARD ===
  const kpis = [
    // ... (Tu lista de KPIs existentes) ...
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
    {
      label: 'Margen Bruto (%)',
      value: margenBrutoPct,
      unit: '%',
    },
    {
      label: 'Peso publicidad (%)',
      value: pesoPublicidadPct,
      unit: '%',
    },
  ];

  const costosDoughnutData = getCostosDoughnutData(costoProveedor, costoEnvio, costoPublicidad, comisionesPlata, utilidadTotal);


  return (
    <Layout>
      <DateRangeBar />
      <KpiGrid kpis={kpis} />

      <div className="grid-2" style={{ marginTop: 24 }}>
        {/* Gráfica de Dona: Estructura de Costos vs Utilidad */}
        <div className="card" style={{ height: 400, padding: 16 }}>
          <div className="card-title">Estructura de costos vs utilidad</div>
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {ventas.length > 0 ? (
              <Doughnut data={costosDoughnutData} options={doughnutOptions} />
            ) : (
              <p className="loading-state">Cargando datos...</p>
            )}
          </div>
        </div>

        {/* Gráfica de Barra Apilada o Placeholder */}
        <div className="card" style={{ height: 400 }}>
          <div className="card-title">Tendencia de Costos Mensuales</div>
          <p style={{ opacity: 0.7 }}>
            *Gráfica de barra apilada para mostrar la evolución de Costos Fijos, CPA y Utilidad a lo largo del tiempo. (Requiere el campo "Fecha" en la hoja de Costos Fijos).
          </p>
          {/* Aquí iría el componente de Barra Apilada */}
        </div>
      </div>

      <TopAdsTable
        title="Top 10 anuncios por ventas"
        rows={topAdsBySalesMock}
      />

      {/* ... (Tu footer de fuente de datos) ... */}
    </Layout>
  );
};

export default DashboardHome;