// src/pages/dashboard/DashboardHome.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
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
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// ========================
// TOP 10 ANUNCIOS / PRODUCTOS
// ========================

type TopAd = {
  adId: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
};

type TopProduct = {
  productName: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
};

const buildTopAds = (rows: VentaRow[]): TopAd[] => {
  const map = new Map<string, TopAd>();

  rows.forEach((row) => {
    const rawId =
      (row['ID_Anuncio'] ??
        row['Id_Anuncio'] ??
        row['ID_Ad'] ??
        row['Ad_ID'] ??
        '') as string | number;

    const adId = String(rawId || 'SIN_ID');
    const venta = toNumber(row['Valor_Venta']);
    const utilidad = toNumber(row['Utilidad']);

    const current =
      map.get(adId) || {
        adId,
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
      };

    current.totalSales += 1;
    current.totalRevenue += venta;
    current.totalProfit += utilidad;

    map.set(adId, current);
  });

  return Array.from(map.values()).sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  );
};

const buildTopProducts = (rows: VentaRow[]): TopProduct[] => {
  const map = new Map<string, TopProduct>();

  rows.forEach((row) => {
    const rawName = (row['Producto'] ?? row['Product'] ?? '') as
      | string
      | number;
    const productName = String(rawName || 'SIN_PRODUCTO');
    const venta = toNumber(row['Valor_Venta']);
    const utilidad = toNumber(row['Utilidad']);

    const current =
      map.get(productName) || {
        productName,
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
      };

    current.totalSales += 1;
    current.totalRevenue += venta;
    current.totalProfit += utilidad;

    map.set(productName, current);
  });

  return Array.from(map.values()).sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  );
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

  if (total === 0) {
    return {
      labels: ['Sin datos'],
      datasets: [
        {
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderWidth: 0,
        },
      ],
    };
  }

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
        backgroundColor: ['#22c55e', '#f97316', '#0ea5e9', '#eab308', '#a855f7'],
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
            const direccion2 =
              row['Dirección_2_Barrio'] ?? row['Direccion_2_Barrio'];
            const telefono = row['Teléfono'] ?? row['Telefono'];
            const transportadora = row['Transportadora_Dropi'];
            const estadoLog = row['EstadoLogistico_Dropi'];
            const valorVenta = row['Valor_Venta'];
            const utilidad = row['Utilidad'];

            const direccion = [direccion1, direccion2]
              .filter(Boolean)
              .join(' - ');

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
// HEALTH SCORE HELPER
// ========================

type HealthStatus = {
  score: number;   // 0 - 100
  label: string;
  color: string;
  comment: string;
};

const getHealthStatus = (margen: number, roas: number): HealthStatus => {
  // Valores razonables para ecommerce de pago
  if (margen >= 40 && roas >= 3) {
    return {
      score: 95,
      label: 'EXCELENTE',
      color: '#22c55e',
      comment: 'La cuenta está muy saludable, puedes escalar presupuesto con cuidado.',
    };
  }
  if (margen >= 25 && roas >= 2) {
    return {
      score: 82,
      label: 'BUENA',
      color: '#3b82f6',
      comment: 'Resultados sólidos, podrías probar incrementos graduales de inversión.',
    };
  }
  if (margen >= 15 && roas >= 1.5) {
    return {
      score: 68,
      label: 'NEUTRAL',
      color: '#eab308',
      comment: 'La cuenta se sostiene, pero hay poco colchón. Revisa costos y creatividades.',
    };
  }
  return {
    score: 45,
    label: 'CRÍTICA',
    color: '#ef4444',
    comment: 'Cuidado: margen o ROAS son bajos. Prioriza optimización antes de escalar.',
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
  const [topTab, setTopTab] = useState<'anuncios' | 'productos'>('anuncios');

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

  const totalOrdenes = ventas.length;
  const ticketPromedio =
    totalOrdenes > 0 ? ingresoTotal / totalOrdenes : 0;

  const costosDoughnutData = getCostosDoughnutData(
    costoProveedor,
    costoEnvio,
    costoPublicidad,
    comisionesPlata,
    utilidadTotal,
  );

  // ==== KPIs HOY ====
  const isToday = (value: unknown): boolean => {
    if (!value) return false;
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const ventasHoy = ventas.filter((v) =>
    isToday(v['Fecha'] ?? v['fecha'] ?? ''),
  );

  const ingresoHoy = sumByKey<VentaRow>(ventasHoy, 'Valor_Venta');
  const utilidadHoy = sumByKey<VentaRow>(ventasHoy, 'Utilidad');
  const costoPublicidadHoy = sumByKey<VentaRow>(ventasHoy, 'Costo_CPA');

  const margenBrutoHoy =
    ingresoHoy > 0 ? (utilidadHoy / ingresoHoy) * 100 : 0;

  const roasHoy =
    costoPublicidadHoy > 0 ? ingresoHoy / costoPublicidadHoy : 0;

  const ventasCantidadHoy = ventasHoy.length;

  // ========================
  // KPI PRINCIPALES (GAUGES)
  // ========================

  const kpis: Kpi[] = [
    // Fila 1: RESULTADOS
    {
      id: 'ingreso-total',
      label: 'Ingreso total (rango)',
      value: ingresoTotal,
      currency: true,
      color: '#00BCD4',
    },
    {
      id: 'ticket-promedio',
      label: 'Ticket promedio por orden',
      value: ticketPromedio,
      currency: true,
      color: '#3B82F6',
    },
    {
      id: 'utilidad-bruta',
      label: 'Utilidad bruta total',
      value: utilidadTotal,
      currency: true,
      color: '#22C55E',
    },
    // Fila 2: COSTOS
    {
      id: 'utilidad-neta',
      label: 'Utilidad neta final',
      value: utilidadNeta,
      currency: true,
      color: '#22C55E',
    },
    {
      id: 'cpa',
      label: 'Costo publicidad (CPA)',
      value: costoPublicidad,
      currency: true,
      color: '#EF4444',
    },
    {
      id: 'comisiones',
      label: 'Comisiones plataforma',
      value: comisionesPlata,
      currency: true,
      color: '#A855F7',
    },
  ];

  // KPI laterales (texto)
  const margenGlobal =
    ingresoTotal > 0 ? (utilidadTotal / ingresoTotal) * 100 : 0;
  const roasGlobal =
    costoPublicidad > 0 ? ingresoTotal / costoPublicidad : 0;

  const rightSideKpis: Kpi[] = [
    {
      id: 'margen',
      label: 'Margen Bruto (%)',
      value: margenGlobal,
      unit: '%',
      color: '#22C55E',
    },
    {
      id: 'roas-global',
      label: 'ROAS global (ingreso / ads)',
      value: roasGlobal,
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

  const healthStatus = getHealthStatus(margenGlobal, roasGlobal);

  // Listas para tablas
  const ventasOrdenadas = [...ventas].sort((a, b) => {
    const da = new Date(String(a['Fecha'] ?? a['fecha'] ?? '')).getTime() || 0;
    const db = new Date(String(b['Fecha'] ?? b['fecha'] ?? '')).getTime() || 0;
    return db - da;
  });

  const ventasTabla = ventasOrdenadas.slice(0, 50);
  const topAds = buildTopAds(ventas).slice(0, 10);
  const topProducts = buildTopProducts(ventas).slice(0, 10);

  return (
    <Layout>
      {loading && <p>Cargando datos del dashboard...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Barra de fechas + tarjetas HOY */}
          <DateRangeBar
            margenHoy={margenBrutoHoy}
            roasHoy={roasHoy}
            ventasHoy={ventasCantidadHoy}
            totalOrdenes={totalOrdenes}
          />

          {/* KPIs principales */}
          <KpiGrid kpis={kpis} />

          {/* TOP 10 */}
          <div
            className="card top-ads-section"
            style={{
              marginTop: 24,
              padding: 16,
              background: '#ffffff',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            }}
          >
            <div
              className="card-title"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: 8,
              }}
            >

<div
  className="card-title"
  style={{
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 4,
  }}
>
  Desempeño de ventas
</div>

<p
  style={{
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  }}
>
  Identifica qué anuncios o productos concentran el mayor porcentaje
  del ingreso en el rango de fechas seleccionado.
</p>




              Desempeño de ventas
            </div>

            {/* PESTAÑAS */}
            <div
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                background: '#e2e8f0',
                padding: 2,
                marginBottom: 12,
              }}
            >
              <button
                onClick={() => setTopTab('anuncios')}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  cursor: 'pointer',
                  background:
                    topTab === 'anuncios' ? '#ffffff' : 'transparent',
                  color: topTab === 'anuncios' ? '#0f172a' : '#64748b',
                  fontWeight: topTab === 'anuncios' ? 600 : 500,
                }}
              >
                Por anuncio
              </button>
              <button
                onClick={() => setTopTab('productos')}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  cursor: 'pointer',
                  background:
                    topTab === 'productos' ? '#ffffff' : 'transparent',
                  color: topTab === 'productos' ? '#0f172a' : '#64748b',
                  fontWeight: topTab === 'productos' ? 600 : 500,
                }}
              >
                Por producto
              </button>
            </div>

            {topTab === 'anuncios' ? (
              topAds.length === 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    color: '#64748B',
                    marginTop: 8,
                  }}
                >
                  Aún no hay datos suficientes para calcular el Top 10 de
                  anuncios.
                </p>
              ) : (
                <div style={{ overflowX: 'auto', marginTop: 10 }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 12,
                      minWidth: 800,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>ID Anuncio</th>
                        <th style={thStyle}>Ventas</th>
                        <th style={thStyle}>Ingreso total</th>
                        <th style={thStyle}>% ingreso total</th>
                        <th style={thStyle}>Utilidad total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topAds.map((ad, index) => {
                        const share =
                          ingresoTotal > 0
                            ? (ad.totalRevenue / ingresoTotal) * 100
                            : 0;

                        return (
                          <tr
                            key={ad.adId + index}
                            style={{
                              borderBottom: '1px solid #e2e8f0',
                              background:
                                index === 0
                                  ? '#eff6ff'
                                  : index % 2 === 0
                                  ? '#ffffff'
                                  : '#f9fafb',
                            }}
                          >
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              {index + 1}
                            </td>
                            <td style={tdStyle}>{ad.adId}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              {ad.totalSales.toLocaleString('es-CO')}
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              {formatCurrency(ad.totalRevenue)}
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              {`${share.toLocaleString('es-CO', {
                                maximumFractionDigits: 1,
                              })} %`}
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              {formatCurrency(ad.totalProfit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : topProducts.length === 0 ? (
              <p
                style={{
                  fontSize: 13,
                  color: '#64748B',
                  marginTop: 8,
                }}
              >
                Aún no hay datos suficientes para calcular el Top 10 de
                productos.
              </p>
            ) : (
              <div style={{ overflowX: 'auto', marginTop: 10 }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 12,
                    minWidth: 800,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Producto</th>
                      <th style={thStyle}>Ventas</th>
                      <th style={thStyle}>Ingreso total</th>
                      <th style={thStyle}>% ingreso total</th>
                      <th style={thStyle}>Utilidad total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, index) => {
                      const share =
                        ingresoTotal > 0
                          ? (p.totalRevenue / ingresoTotal) * 100
                          : 0;

                      return (
                        <tr
                          key={p.productName + index}
                          style={{
                            borderBottom: '1px solid #e2e8f0',
                            background:
                              index === 0
                                ? '#eff6ff'
                                : index % 2 === 0
                                ? '#ffffff'
                                : '#f9fafb',
                          }}
                        >
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            {index + 1}
                          </td>
                          <td style={tdStyle}>{p.productName}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            {p.totalSales.toLocaleString('es-CO')}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            {formatCurrency(p.totalRevenue)}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            {`${share.toLocaleString('es-CO', {
                              maximumFractionDigits: 1,
                            })} %`}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            {formatCurrency(p.totalProfit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Gráfico grande + Dona + indicadores */}
          <div
            className="main-metrics-section"
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 24,
              marginTop: 24,
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

            {/* Columna derecha: Dona + indicadores */}
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
                        : kpi.unit === '%'
                        ? `${kpi.value.toLocaleString('es-CO', {
                            maximumFractionDigits: 1,
                          })}%`
                        : kpi.unit === 'x'
                        ? `${kpi.value.toLocaleString('es-CO', {
                            maximumFractionDigits: 2,
                          })}x`
                        : kpi.value.toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}

                {/* HEALTH SCORE */}
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#64748b',
                      marginBottom: 4,
                    }}
                  >
                    Health score de la cuenta
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: healthStatus.color,
                      }}
                    >
                      {healthStatus.label} · {healthStatus.score}/100
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#64748b',
                        textAlign: 'right',
                        maxWidth: 230,
                      }}
                    >
                      {healthStatus.comment}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla ejecutiva de ventas */}
          <div
            className="card detail-table-section"
            style={{
              padding: 16,
              marginTop: 24,
              marginBottom: 48,
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
