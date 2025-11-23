// src/pages/dashboard/DashboardHome.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';

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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

// ========================
// TIPOS Y HELPERS
// ========================

type VentaRow = {
  [key: string]: any;
  Valor_Venta?: string | number;
  Costo_Proveedor?: string | number;
  Costo_Envio?: string | number;
  Costo_CPA?: string | number;
  Costo_de_Venta?: string | number;
  Utilidad?: string | number;
  Fecha?: string | Date;
  Fecha_Venta?: string | Date;
};

type CostosFijosRow = {
  [key: string]: any;
  Monto_Mensual?: string | number;
};

type Kpi = {
  id: string;
  label: string;
  value: number;
  currency?: boolean;
  unit?: string;
  color?: string;
};

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
  key: keyof T,
): number => rows.reduce((acc, row) => acc + toNumber(row[key]), 0);

const getRows = <T extends Record<string, any>>(data: any): T[] => {
  if (Array.isArray(data?.rows)) return data.rows as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
};

const parseDate = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

// ========================
// DONUT DE COSTOS
// ========================

const getCostosDoughnutData = (
  costoProveedor: number,
  costoEnvio: number,
  costoPublicidad: number,
  comisionesPlata: number,
  utilidadBruta: number,
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
      labels: {
        color: '#64748B',
        boxWidth: 14,
      },
    },
  },
};

// ========================
// HELPERS PARA EL GAUGE SVG
// ========================

const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

// ========================
// GAUGE CARD (ESTILO WORDOPS)
// ========================

const computeGaugePercent = (kpi: Kpi): number => {
  if (kpi.unit === '%') {
    return Math.max(0, Math.min(100, kpi.value));
  }
  // si no es %, dejamos 70% por defecto visual
  return 70;
};

const GaugeCard: React.FC<{ kpi: Kpi }> = ({ kpi }) => {
  const percent = computeGaugePercent(kpi);

  // Configuración del gauge
  const width = 200;
  const height = 120;
  const cx = width / 2;
  const cy = height; // centro en la parte baja del SVG
  const radius = 80;

  // Arco de fondo (media luna completa 180° -> 0°)
  const backgroundPath = describeArc(cx, cy, radius, 180, 0);

  // Arco de valor (desde 180° hasta el ángulo correspondiente al porcentaje)
  const valueAngle = 180 - (percent / 100) * 180; // 180° (0%) a 0° (100%)
  const foregroundPath = describeArc(cx, cy, radius, 180, valueAngle);

  // Aguja
  const needleLength = radius - 8;
  const needleAngle = valueAngle;
  const needleRad = ((needleAngle - 90) * Math.PI) / 180;
  const needleX = cx + needleLength * Math.cos(needleRad);
  const needleY = cy + needleLength * Math.sin(needleRad);

  const mainColor = kpi.color || '#0ea5e9';

  return (
    <div
      className="card card-gauge"
      style={{
        textAlign: 'center',
        padding: '16px 12px',
        height: 190,
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 8px 20px rgba(15,23,42,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <p
        className="kpi-label"
        style={{ fontSize: 12, margin: 0, color: '#64748B' }}
      >
        {kpi.label}
      </p>

      <h2
        className="kpi-value"
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: mainColor,
          margin: '4px 0 0 0',
        }}
      >
        {kpi.currency
          ? `$ ${kpi.value.toLocaleString('es-CO')}`
          : kpi.value.toLocaleString('es-CO')}
        {kpi.unit ?? ''}
      </h2>

      {/* Gauge grande tipo WordOps */}
      <div
        style={{
          marginTop: 8,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* arco de fondo */}
          <path
            d={backgroundPath}
            stroke="#E2E8F0"
            strokeWidth={12}
            fill="none"
          />

          {/* arco de valor */}
          <path
            d={foregroundPath}
            stroke={mainColor}
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
          />

          {/* aguja */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke={mainColor}
            strokeWidth={3}
          />

          {/* pivote */}
          <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#ffffff"
            stroke={mainColor}
            strokeWidth={2}
          />

          {/* valor porcentual grande en el centro del gauge */}
          {kpi.unit === '%' && (
            <text
              x={cx}
              y={cy - 25}
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill={mainColor}
            >
              {percent.toFixed(0)}%
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};

// ========================
// UTILIDAD MENSUAL (BAR CHART)
// ========================

const getMonthlyUtilidadChartData = (ventas: VentaRow[]) => {
  if (!ventas.length) {
    return {
      labels: [],
      datasets: [
        {
          label: 'Utilidad',
          data: [],
          backgroundColor: '#00BCD4',
        },
      ],
    };
  }

  const byMonth: Record<string, number> = {};

  ventas.forEach((venta) => {
    const fecha =
      parseDate(venta.Fecha) ||
      parseDate(venta.Fecha_Venta) ||
      null;

    if (!fecha) return;

    const year = fecha.getFullYear();
    const month = fecha.getMonth(); // 0-11
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!byMonth[key]) byMonth[key] = 0;
    byMonth[key] += toNumber(venta.Utilidad);
  });

  const keys = Object.keys(byMonth).sort(); // orden cronológico
  const labels = keys.map((key) => {
    const [yearStr, monthStr] = key.split('-');
    const monthIndex = Number(monthStr) - 1;
    const monthName = MONTHS_SHORT[monthIndex] ?? monthStr;
    return `${monthName} ${yearStr}`;
  });

  const data = keys.map((key) => byMonth[key]);

  return {
    labels,
    datasets: [
      {
        label: 'Utilidad',
        data,
        backgroundColor: '#00BCD4',
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };
};

// ========================
// COMPONENTE PRINCIPAL
// ========================

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

  // Cálculos principales
  const ingresoTotal = sumByKey<VentaRow>(ventas, 'Valor_Venta');
  const costoProveedor = sumByKey<VentaRow>(ventas, 'Costo_Proveedor');
  const costoEnvio = sumByKey<VentaRow>(ventas, 'Costo_Envio');
  const costoPublicidad = sumByKey<VentaRow>(ventas, 'Costo_CPA');
  const comisionesPlata = sumByKey<VentaRow>(ventas, 'Costo_de_Venta');
  const utilidadTotal = sumByKey<VentaRow>(ventas, 'Utilidad');
  const totalCostosFijos = sumByKey<CostosFijosRow>(
    costosFijos,
    'Monto_Mensual',
  );
  const utilidadNeta = utilidadTotal - totalCostosFijos;

  const costosDoughnutData = getCostosDoughnutData(
    costoProveedor,
    costoEnvio,
    costoPublicidad,
    comisionesPlata,
    utilidadTotal,
  );

  const monthlyUtilidadData = getMonthlyUtilidadChartData(ventas);

  const ticketPromedio =
    ventas.length > 0 ? ingresoTotal / ventas.length : 0;

  // ========================
  // KPIs PRINCIPALES
  // ========================
  const mainKpis: Kpi[] = [
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

  // ========================
  // KPIs DE AGUJA (PORCENTAJES)
  // ========================
  const gaugeKpis: Kpi[] = [
    {
      id: 'margen-bruto',
      label: 'Margen bruto sobre ingresos',
      value: ingresoTotal > 0 ? (utilidadTotal / ingresoTotal) * 100 : 0,
      unit: '%',
      color: '#22C55E',
    },
    {
      id: 'margen-neto',
      label: 'Margen neto sobre ingresos',
      value: ingresoTotal > 0 ? (utilidadNeta / ingresoTotal) * 100 : 0,
      unit: '%',
      color: '#0EA5E9',
    },
    {
      id: 'peso-costos-fijos',
      label: 'Costos fijos / utilidad bruta',
      value: utilidadTotal > 0 ? (totalCostosFijos / utilidadTotal) * 100 : 0,
      unit: '%',
      color: '#F97316',
    },
    {
      id: 'comisiones-share',
      label: 'Comisiones / ingresos',
      value: ingresoTotal > 0 ? (comisionesPlata / ingresoTotal) * 100 : 0,
      unit: '%',
      color: '#A855F7',
    },
  ];

  // ========================
  // INDICADORES LATERALES
  // ========================
  const rightSideKpis: Kpi[] = [
    {
      id: 'roas',
      label: 'ROAS',
      value: costoPublicidad > 0 ? ingresoTotal / costoPublicidad : 0,
      unit: 'x',
      color: '#00BCD4',
    },
    {
      id: 'ticket-promedio',
      label: 'Ticket promedio',
      value: ticketPromedio,
      currency: true,
      color: '#22C55E',
    },
    {
      id: 'conv',
      label: 'Conversiones (estimado)',
      value: ventas.length * 1.5,
      color: '#F97316',
    },
  ];

  return (
    <Layout>
      {loading && <p>Cargando datos del dashboard...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && !error && (
        <>
          <DateRangeBar />

          {/* KPIs principales */}
          <KpiGrid kpis={mainKpis} />

          {/* KPIs tipo WordOps con agujas grandes */}
          <div
            className="status-kpis-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 24,
              marginBottom: 24,
              marginTop: 24,
            }}
          >
            {gaugeKpis.map((kpi) => (
              <GaugeCard key={kpi.id} kpi={kpi} />
            ))}
          </div>

          {/* Gráfico grande + Dona + indicadores laterales */}
          <div
            className="main-metrics-section"
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 24,
            }}
          >
            {/* Columna izquierda: Bar */}
            <div
              className="card chart-large"
              style={{ height: 450, padding: 20, background: '#ffffff' }}
            >
              <div className="card-title" style={{ fontSize: 16 }}>
                Tendencia Mensual de Utilidad
              </div>
              <div style={{ height: 380 }}>
                <Bar
                  data={monthlyUtilidadData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>

            {/* Columna derecha: Dona + badges */}
            <div
              className="status-and-donut"
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <div
                className="card"
                style={{ padding: 20, flexGrow: 1, background: '#ffffff' }}
              >
                <div className="card-title">
                  Estructura de Costos vs Utilidad
                </div>
                <div style={{ height: 200, margin: '10px 0' }}>
                  <Doughnut
                    data={costosDoughnutData}
                    options={doughnutOptions}
                  />
                </div>
              </div>

              <div
                className="card status-badges"
                style={{ padding: 15, background: '#ffffff' }}
              >
                <div className="card-title">
                  Indicadores Clave de Rentabilidad
                </div>
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
                        ? `$ ${kpi.value.toLocaleString('es-CO')}`
                        : kpi.value.toLocaleString('es-CO')}
                      {kpi.unit ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla detalle */}
          <div
            className="card detail-table-section"
            style={{ padding: 16, marginTop: 24, background: '#ffffff' }}
          >
            <div className="card-title" style={{ fontSize: 16 }}>
              Detalle: Top 10 anuncios por ventas
            </div>
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
              <TopAdsTable rows={[]} title="Top 10 anuncios por ventas" />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default DashboardHome;
