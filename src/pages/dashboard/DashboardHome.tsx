// src/pages/dashboard/DashboardHome.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import type { Kpi } from '../../types';

// Charts
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ================== TIPOS ==================
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

// ================== HELPERS ==================
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value
      .replace(/[\s$€]/g, '')
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

// ============ GRÁFICA DONA =============
const getCostosDoughnutData = (
  costoProveedor: number,
  costoEnvio: number,
  costoPublicidad: number,
  comisionesPlata: number,
  utilidadBruta: number
) => {
  const totalCostos =
    costoProveedor + costoEnvio + costoPublicidad + comisionesPlata;
  const total = totalCostos + utilidadBruta;

  if (total === 0) return { labels: [], datasets: [] };

  return {
    labels: [
      'Utilidad Bruta',
      'Costo Proveedor',
      'Costo Envío',
      'Costo Publicidad (CPA)',
      'Comisiones Plataforma',
    ],
    datasets: [
      {
        data: [
          utilidadBruta,
          costoProveedor,
          costoEnvio,
          costoPublicidad,
          comisionesPlata,
        ],
        backgroundColor: [
          '#22c55e',
          '#f97316',
          '#0ea5e9',
          '#eab308',
          '#a855f7',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4,
      },
    ],
  };
};

const doughnutOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#64748B', boxWidth: 14 },
    },
  },
};

// ================== COMPONENTE ==================
const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostosFijosRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [ventasData, costosFijosData] = await Promise.all([
          fetchSheet('Ventas'),
          fetchSheet('Costos_Fijos'),
        ]);

        setVentas(getRows<VentaRow>(ventasData));
        setCostosFijos(getRows<CostosFijosRow>(costosFijosData));
      } catch (e) {
        console.error(e);
        setError('No pudimos leer los datos de Google Sheets.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // === CÁLCULOS PRINCIPALES ===
  const ingresoTotal = sumByKey<VentaRow>(ventas, 'Valor_Venta');
  const costoProveedor = sumByKey<VentaRow>(ventas, 'Costo_Proveedor');
  const costoEnvio = sumByKey<VentaRow>(ventas, 'Costo_Envio');
  const costoPublicidad = sumByKey<VentaRow>(ventas, 'Costo_CPA');
  const comisionesPlata = sumByKey<VentaRow>(ventas, 'Costo_de_Venta');
  const utilidadTotal = sumByKey<VentaRow>(ventas, 'Utilidad');
  const totalCostosFijos = sumByKey<CostosFijosRow>(
    costosFijos,
    'Monto_Mensual'
  );
  const utilidadNeta = utilidadTotal - totalCostosFijos;

  const costosDoughnutData = getCostosDoughnutData(
    costoProveedor,
    costoEnvio,
    costoPublicidad,
    comisionesPlata,
    utilidadTotal
  );

  // === KPIs PRINCIPALES (se usan en KpiGrid y en las cards) ===
  const kpis: Kpi[] = [
    {
      id: 'ingreso-total',
      label: 'Ingreso total (rango)',
      value: ingresoTotal,
      currency: true,
      color: '#00BCD4',
    },
    {
      id: 'utilidad-neta',
      label: 'Utilidad neta final',
      value: utilidadNeta,
      currency: true,
      color: '#22C55E',
    },
    {
      id: 'costo-prov',
      label: 'Costo producto (proveedor)',
      value: costoProveedor,
      currency: true,
      color: '#F97316',
    },
    {
      id: 'cpa',
      label: 'Costo publicidad (CPA)',
      value: costoPublicidad,
      currency: true,
      color: '#EF4444',
    },
    {
      id: 'utilidad-bruta',
      label: 'Utilidad bruta total',
      value: utilidadTotal,
      currency: true,
      color: '#22C55E',
    },
    {
      id: 'comisiones',
      label: 'Comisiones plataforma',
      value: comisionesPlata,
      currency: true,
      color: '#A855F7',
    },
  ];

  const rightSideKpis: Kpi[] = [
    {
      id: 'margen',
      label: 'Margen Bruto (%)',
      value: ingresoTotal > 0 ? (utilidadTotal / ingresoTotal) * 100 : 0,
      unit: '%',
      color: '#22C55E',
    },
    {
      id: 'roas',
      label: 'ROAS',
      value: totalCostosFijos > 0 ? ingresoTotal / totalCostosFijos : 0,
      unit: 'x',
      color: '#00BCD4',
    },
    {
      id: 'conv',
      label: 'Conversiones',
      value: ventas.length * 1.5,
      color: '#F97316',
    },
  ];

  // ================== RENDER ==================
  return (
      return (
    <Layout>
      {loading && <p>Cargando datos del dashboard...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Barra de rango de fechas */}
          <DateRangeBar />

          {/* KPIs superiores (tarjetas tipo WordOps, usando tu KpiGrid actualizado) */}
          <KpiGrid kpis={kpis} />

          {/* 2. Gráfico grande + Dona + indicadores (2 columnas) */}
          <div
            className="main-metrics-section"
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 24,
              marginTop: 24,
            }}
          >
            {/* Columna izquierda: Bar de tendencia mensual */}
            <div className="card chart-large" style={{ height: 450, padding: 20 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                Tendencia Mensual de Utilidad
              </div>
              <div style={{ height: 380 }}>
                <Bar
                  data={{
                    labels: ['Ene', 'Feb', 'Mar'], // luego conectamos con datos reales
                    datasets: [
                      {
                        data: [1, 2, 3],
                        backgroundColor: '#00BCD4',
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>

            {/* Columna derecha: Dona + badges de indicadores */}
            <div
              className="status-and-donut"
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {/* Gráfico de dona: estructura de costos vs utilidad */}
              <div className="card" style={{ padding: 20, flexGrow: 1 }}>
                <div className="card-title">Estructura de Costos vs Utilidad</div>
                <div style={{ height: 200, margin: '10px 0' }}>
                  <Doughnut data={costosDoughnutData} options={doughnutOptions} />
                </div>
              </div>

              {/* Badges de indicadores clave */}
              <div className="card status-badges" style={{ padding: 15 }}>
                <div className="card-title">Indicadores Clave de Rentabilidad</div>
                {rightSideKpis.map((kpi) => (
                  <div
                    key={kpi.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: '1px dashed #E2E8F0',
                      fontSize: 13,
                    }}
                  >
                    <span>{kpi.label}</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: kpi.color || '#0f172a',
                      }}
                    >
                      {kpi.currency
                        ? `$ ${Number(kpi.value || 0).toLocaleString('es-CO')}`
                        : Number(kpi.value || 0).toLocaleString('es-CO')}
                      {kpi.unit ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Tabla de detalle (full width) */}
          <div className="card detail-table-section" style={{ padding: 16, marginTop: 24 }}>
            <div className="card-title" style={{ fontSize: 16 }}>
              Detalle: Top 10 anuncios por ventas
            </div>
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
              {/* Cuando tengas datos reales, pásalos aquí */}
              <TopAdsTable rows={[]} title="" />
            </div>
          </div>
        </>
      )}
    </Layout>
   );
};

export default DashboardHome;
