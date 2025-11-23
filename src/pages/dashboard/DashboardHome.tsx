import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
// Corregimos las importaciones de React Chart JS
import { Doughnut, Bar } from 'react-chartjs-2'; 
import { kpisMock } from '../../mockData'; 


// ======================================================================
// === TIPOS Y HELPERS (COMPLETOS y definidos localmente) ===
// ======================================================================
type VentaRow = { [key: string]: any; Valor_Venta?: string | number; Costo_Proveedor?: string | number; Costo_Envio?: string | number; Costo_CPA?: string | number; Costo_de_Venta?: string | number; Utilidad?: string | number; };
type CostosFijosRow = { [key: string]: any; Monto_Mensual?: string | number; };

// Definición de tipo Kpi para resolver TS2339 (Propiedades color, currency, unit)
type Kpi = {
    label: string;
    value: number;
    currency?: boolean; 
    unit?: string;
    id: string;
    color?: string; // Necesario para que la propiedad 'color' exista
};


// Helper para convertir a número
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

// Helper para sumar por clave
const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);

// Helper para obtener filas
const getRows = <T extends Record<string, any>>(data: any): T[] => {
  if (Array.isArray(data?.rows)) return data.rows as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
};


// Lógica de Gráfica de Dona (Usado)
const getCostosDoughnutData = (
  costoProveedor: number, costoEnvio: number, costoPublicidad: number,
  comisionesPlata: number, utilidadBruta: number
) => {
  const totalCostos = costoProveedor + costoEnvio + costoPublicidad + comisionesPlata;
  const total = totalCostos + utilidadBruta;
  if (total === 0) return { labels: [], datasets: [] };

  return {
    labels: ['Utilidad Bruta', 'Costo Proveedor', 'Costo Envío', 'Costo Publicidad (CPA)', 'Comisiones Plataforma'],
    datasets: [
      {
        data: [utilidadBruta, costoProveedor, costoEnvio, costoPublicidad, comisionesPlata],
        backgroundColor: ['#22c55e', '#f97316', '#0ea5e9', '#eab308', '#a855f7'],
        borderWidth: 2, borderColor: '#FFFFFF', hoverOffset: 4,
      },
    ],
  };
};

const doughnutOptions: any = { 
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', 
    plugins: {
        legend: { position: 'bottom' as const, labels: { color: '#64748B', boxWidth: 14 } },
    }
};

// ======================================================================
// === COMPONENTE PRINCIPAL (ESTRUCTURA WORDOPS) ===
// ======================================================================

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

  // === CÁLCULOS PRINCIPALES ===
  const ingresoTotal = sumByKey<VentaRow>(ventas, 'Valor_Venta');
  const costoProveedor = sumByKey<VentaRow>(ventas, 'Costo_Proveedor');
  const costoEnvio = sumByKey<VentaRow>(ventas, 'Costo_Envio');
  const costoPublicidad = sumByKey<VentaRow>(ventas, 'Costo_CPA');
  const comisionesPlata = sumByKey<VentaRow>(ventas, 'Costo_de_Venta');
  const utilidadTotal = sumByKey<VentaRow>(ventas, 'Utilidad');
  const totalCostosFijos = sumByKey<CostosFijosRow>(costosFijos, 'Monto_Mensual');
  const utilidadNeta = utilidadTotal - totalCostosFijos; 
  
  const costosDoughnutData = getCostosDoughnutData(costoProveedor, costoEnvio, costoPublicidad, comisionesPlata, utilidadTotal);

  // === KPIs SUPERIORES (Estilo Medidor) ===
  const kpis: Kpi[] = [ // Usamos el tipo Kpi[] aquí
      { label: 'Ingreso total (rango)', value: ingresoTotal, currency: true, id: 'ingreso-total', color: '#00BCD4' },
      { label: 'Utilidad neta final', value: utilidadNeta, currency: true, id: 'utilidad-neta', color: '#22C55E' },
      { label: 'Costo producto (proveedor)', value: costoProveedor, currency: true, id: 'costo-prov', color: '#F97316' },
      { label: 'Costo publicidad (CPA)', value: costoPublicidad, currency: true, id: 'cpa', color: '#EF4444' },
      { label: 'Utilidad bruta total', value: utilidadTotal, currency: true, id: 'utilidad-bruta', color: '#22C55E' },
      { label: 'Comisiones plataforma', value: comisionesPlata, currency: true, id: 'comisiones', color: '#A855F7' },
  ];
  const rightSideKpis: Kpi[] = [ // Usamos el tipo Kpi[] aquí
      { label: 'Margen Bruto (%)', value: (ingresoTotal > 0 ? (utilidadTotal / ingresoTotal) * 100 : 0), unit: '%', id: 'margen', color: '#22C55E' },
      { label: 'ROAS', value: (totalCostosFijos > 0 ? ingresoTotal / totalCostosFijos : 0), unit: 'x', id: 'roas', color: '#00BCD4' },
      { label: 'Conversiones', value: (ventas.length * 1.5), id: 'conv', color: '#F97316' },
  ];


  return (
    <Layout>
      {loading && <p>Cargando datos del dashboard...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      
      {!loading && !error && (
        <>
          <DateRangeBar /> 

          {/* 1. KPIs de Estado (Fila Superior) - ESTILO WORDOPS MEDIDOR */}
          <div className="status-kpis-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: '24px' }}>
              {kpis.slice(0, 4).map(kpi => (
                  <div key={kpi.id} className="card card-gauge" style={{ textAlign: 'center', padding: '20px 10px', height: '140px' }}>
                    <p className="kpi-label">{kpi.label}</p>
                    <h2 className="kpi-value" style={{ fontSize: 24, fontWeight: 700, color: kpi.color }}>
                        {kpi.currency ? `$${kpi.value.toLocaleString('es-CO')}` : kpi.value}
                    </h2>
                    {/* Placeholder para el componente de Aguja/Gauge */}
                    <div style={{ height: 60, background: '#F0F4F8', borderRadius: '4px', marginTop: '10px' }}>
                        <p style={{ fontSize: 11, color: '#64748B' }}>[Medidor visual aquí]</p>
                    </div>
                  </div>
              ))}
          </div>

          {/* 2. GRÁFICOS PRINCIPALES Y STATUS DE RENDIMIENTO (2 columnas) */}
          <div className="main-metrics-section" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            
            {/* Columna Izquierda: Gráfico de Tendencia (Main Metrics) */}
            <div className="card chart-large" style={{ height: 450, padding: 20 }}>
              <div className="card-title" style={{ fontSize: 16 }}>Tendencia Mensual de Utilidad</div>
              <div style={{ height: '380px' }}>
                {/* Usamos Bar como placeholder de Tendencia */}
                <Bar data={{labels: ['Ene', 'Feb', 'Mar'], datasets: [{data: [1,2,3], backgroundColor: '#00BCD4'}]}} options={{responsive: true, maintainAspectRatio: false}} />
              </div>
            </div>
            
            {/* Columna Derecha: Dona y Status Badges */}
            <div className="status-and-donut" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Gráfico de Dona: Estructura de Costos */}
              <div className="card" style={{ padding: 20, flexGrow: 1 }}>
                <div className="card-title">Estructura de Costos vs Utilidad</div>
                <div style={{ height: '200px', margin: '10px 0' }}>
                  <Doughnut data={costosDoughnutData} options={doughnutOptions} />
                </div>
              </div>

              {/* Badges de Estado (como en WordOps) */}
              <div className className="card status-badges" style={{ padding: 15 }}>
                <div className="card-title">Indicadores Clave de Rentabilidad</div>
                {rightSideKpis.map(kpi => (
                  <div key={kpi.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E2E8F0' }}>
                    <span>{kpi.label}</span>
                    <span style={{ fontWeight: 600, color: kpi.color }}>{kpi.currency ? `$${kpi.value.toLocaleString('es-CO')}` : kpi.value}{kpi.unit}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>


          {/* 3. TABLA DE DETALLE (Full Width al final) */}
          <div className="card detail-table-section" style={{ padding: 16 }}>
            <div className="card-title" style={{ fontSize: 16 }}>Detalle: Top 10 anuncios por ventas</div>
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
                {/* Placeholder para la tabla */}
                <TopAdsTable rows={[]} title="" /> 
            </div>
          </div>

        </>
      )}
    </Layout>
  );
};

export default DashboardHome;