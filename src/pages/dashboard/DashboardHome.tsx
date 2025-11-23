// src/pages/dashboard/DashboardHome.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
// import TopAdsTable from '../../components/TopAdsTable'; // ❌ Ya no la usamos
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
  Costo_Envío?: string | number;
  Costo_CPA?: string | number;
  Costo_de_Venta?: string | number;
  Utilidad?: string | number;
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

const formatCurrency = (value: unknown): string => {
  const n = toNumber(value);
  if (!n) return '$ 0';
  return `$ ${n.toLocaleString('es-CO')}`;
};

const formatDate = (value: unknown): string => {
  if (!value) return '';
  // Asumimos formato YYYY-MM-DD o similar
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

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
// GAUGE CARD (KPI AGUJA)
// ========================

const computeGaugePercent = (kpi: Kpi): number => {
  if (kpi.unit === '%') {
    return Math.max(0, Math.min(100, kpi.value));
  }
  return 70;
};

const GaugeCard: React.FC<{ kpi: Kpi }> = ({ kpi }) => {
  const percent = computeGaugePercent(kpi);
  const needleAngle = (percent / 100) * 120 - 60;

  return (
    <div
      className="card card-gauge"
      style={{
        textAlign: 'center',
        padding: '20px 10px',
        height: 140,
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 8px 20px rgba(15,23,42,0.1)',
      }}
    >
      <p className="kpi-label" style={{ fontSize: 12, margin: 0 }}>
        {kpi.label}
      </p>
      <h2
        className="kpi-value"
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: kpi.color || '#0f172a',
          margin: '8px 0',
        }}
      >
        {kpi.currency
          ? `$ ${kpi.value.toLocaleString('es-CO')}`
          : kpi.value.toLocaleString('es-CO')}
        {kpi.unit ?? ''}
      </h2>

      <div
        style={{
          position: 'relative',
          height: 60,
          borderRadius: 999,
          marginTop: 6,
          background:
            'linear-gradient(90deg, #e2e8f0 0%, #e2e8f0 50%, #e2e8f0 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 10,
            right: 10,
            bottom: 18,
            height: 8,
            borderRadius: 999,
            background: '#e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              borderRadius: 999,
              background: kpi.color || '#0ea5e9',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 10,
            width: 2,
            height: 24,
            background: kpi.color || '#0ea5e9',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${needleAngle}deg)`,
            transition: 'transform 0.4s ease',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 8,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#ffffff',
            border: `2px solid ${kpi.color || '#0ea5e9'}`,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  );
};

// ========================
// TABLA EJECUTIVA DE VENTAS
// ========================

interface SalesTableProps {
  rows: VentaRow[];
}

const SalesTable: React.FC<SalesTableProps> = ({ rows }) => {
  if (!rows.length) {
    return (
      <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>
        Aún no hay ventas para mostrar en la tabla ejecutiva.
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: 10 }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 12,
          minWidth: 960,
        }}
      >
        <thead>
          <tr
            style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <th style={thStyle}>Fecha</th>
            <th style={thStyle}>ID Venta</th>
            <th style={thStyle}>Pedido</th>
            <th style={thStyle}>Producto</th>
            <th style={thStyle}>Cant.</th>
            <th style={thStyle}>Cliente</th>
            <th style={thStyle}>Ciudad</th>
            <th style={thStyle}>Dirección</th>
            <th style={thStyle}>Teléfono</th>
            <th style={thStyle}>Transportadora</th>
            <th style={thStyle}>Estado logístico</th>
            <th style={thStyle}>Valor venta</th>
            <th style={thStyle}>Utilidad</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const fecha = row['Fecha'];
            const idVenta = row['ID_Venta'];
            const idPedido = row['ID_Pedido_Shopify'];
            const producto = row['Producto'];
            const cantidad = row['Cantidad'];
            const cliente = row['Nombre_Cliente'];
            const ciudad = row['Ciudad'];
            const direccion1 = row['Dirección_1'] ?? row['Direccion_1'];
            const direccion2 = row['Dirección_2_Barrio'] ?? row['Direccion_2_Barrio'];
            const telefono = row['Teléfono'] ?? row['Telefono'];
            const transportadora = row['Transportadora_Dropi'];
            const estadoLog = row['EstadoLogistico_Dropi'];
            const valorVenta = row['Valor_Venta'];
            const utilidad = row['Utilidad'];

            const direccion = [direccion1, direccion2].filter(Boolean).join(' - ');

            return (
              <tr
                key={`${idVenta ?? idPedido ?? idx}`}
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  background: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                }}
              >
                <td style={tdStyle}>{formatDate(fecha)}</td>
                <td style={tdStyle}>{String(idVenta ?? '')}</td>
                <td style={tdStyle}>{String(idPedido ?? '')}</td>
                <td style={tdStyle}>{String(producto ?? '')}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {cantidad ?? ''}
                </td>
                <td style={tdStyle}>{String(cliente ?? '')}</td>
                <td style={tdStyle}>{String(ciudad ?? '')}</td>
                <td style={tdStyle}>{direccion}</td>
                <td style={tdStyle}>{String(telefono ?? '')}</td>
                <td style={tdStyle}>{String(transportadora ?? '')}</td>
                <td style={tdStyle}>{String(estadoLog ?? '')}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {formatCurrency(valorVenta)}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {formatCurrency(utilidad)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#0f172a',
  fontSize: 11,
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 10px',
  color: '#0f172a',
  fontSize: 11,
  verticalAlign: 'top',
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
  const costoEnvio = sumByKey<VentaRow>(ventas, 'Costo_Envío');
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
      label: 'Conversiones (estimado)',
      value: ventas.length * 1.5,
      color: '#F97316',
    },
  ];

  // Ordenar ventas por fecha y tomar las últimas 50
  const ventasOrdenadas = [...ventas].sort((a, b) => {
    const da = new Date(String(a['Fecha'] ?? a['fecha'] ?? '')).getTime() || 0;
    const db = new Date(String(b['Fecha'] ?? b['fecha'] ?? '')).getTime() || 0;
    return db - da;
  });

  const ventasTabla = ventasOrdenadas.slice(0, 50);

  return (
    <Layout>
      {loading && <p>Cargando datos del dashboard...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && !error && (
        <>
          <DateRangeBar />

          {/* Barra KPI principal */}
          <KpiGrid kpis={kpis} />

          {/* Gauges estilo WordOps */}
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
            {kpis.slice(0, 4).map((kpi) => (
              <GaugeCard key={kpi.id} kpi={kpi} />
            ))}
          </div>

          {/* Gráfico grande + Dona + indicadores */}
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
                {/* Dummy data temporal */}
                <Bar
                  data={{
                    labels: ['Ene', 'Feb', 'Mar'],
                    datasets: [
                      {
                        label: 'Utilidad',
                        data: [1, 2, 3],
                        backgroundColor: '#00BCD4',
                      },
                    ],
                  }}
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
                <div className="card-title">Estructura de Costos vs Utilidad</div>
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

          {/* Tabla ejecutiva de ventas (todo el ancho, con buen margen abajo) */}
          <div
            className="card detail-table-section"
            style={{
              padding: 16,
              marginTop: 24,
              marginBottom: 48, // margen inferior para despegar del footer
              background: '#ffffff',
            }}
          >
            <div className="card-title" style={{ fontSize: 16 }}>
              Ventas recientes (últimas 50)
            </div>
            <SalesTable rows={ventasTabla} />
          </div>
        </>
      )}
    </Layout>
  );
};

export default DashboardHome;
