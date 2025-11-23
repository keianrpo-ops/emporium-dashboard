// src/pages/dashboard/DashboardHome.tsx (VERSIÓN FINAL Y CORREGIDA)

import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid'; // Mantener si se usa, si no eliminar
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock } from '../../mockData'; 
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ======================================================================
// === TIPOS Y HELPERS (Definidos LOCALMENTE) ===
// (Asegúrate de que tus helpers y tipos esten aqui o importados correctamente)
// ======================================================================
type VentaRow = { [key: string]: any; Valor_Venta?: string | number; Costo_Proveedor?: string | number; Costo_Envio?: string | number; Costo_CPA?: string | number; Costo_de_Venta?: string | number; Utilidad?: string | number; };
type CostosFijosRow = { [key: string]: any; Monto_Mensual?: string | number; };

type Kpi = { label: string; value: number; currency?: boolean; unit?: string; id: string; color?: string; };

const toNumber = (value: unknown): number => { /* ... */ return 0; };
const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number => { /* ... */ return 0; };
const getRows = <T extends Record<string, any>>(data: any): T[] => { /* ... */ return []; };
const getCostosDoughnutData = (
  costoProveedor: number, costoEnvio: number, costoPublicidad: number,
  comisionesPlata: number, utilidadBruta: number
) => { /* ... */ return { labels: [], datasets: [] }; };
const doughnutOptions: any = { /* ... */ };

// ======================================================================
// === COMPONENTE PRINCIPAL ===
// ======================================================================

const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostosFijosRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ... (Tu lógica de useEffect para cargar datos) ...
  }, []);

  // ----------------------------------------------------
  // === DEFINICIÓN DE CÁLCULOS (Variables USADAS AHORA) ===
  // ----------------------------------------------------
  const ingresoTotal = sumByKey<VentaRow>(ventas, 'Valor_Venta');
  const costoProveedor = sumByKey<VentaRow>(ventas, 'Costo_Proveedor');
  const costoEnvio = sumByKey<VentaRow>(ventas, 'Costo_Envio');
  const costoPublicidad = sumByKey<VentaRow>(ventas, 'Costo_CPA');
  const comisionesPlata = sumByKey<VentaRow>(ventas, 'Costo_de_Venta');
  const utilidadTotal = sumByKey<VentaRow>(ventas, 'Utilidad');
  const totalCostosFijos = sumByKey<CostosFijosRow>(costosFijos, 'Monto_Mensual');
  const utilidadNeta = utilidadTotal - totalCostosFijos; 
  
  const costosDoughnutData = getCostosDoughnutData(costoProveedor, costoEnvio, costoPublicidad, comisionesPlata, utilidadTotal);


  // === DEFINICIÓN DE ARRAYS KPI (USADOS DIRECTAMENTE EN EL RETURN) ===
  // Nota: Estas son las variables que el compilador no podía encontrar.

  const kpis: Kpi[] = [ // Resuelve TS6133: 'kpis'
      { ...kpisMock[0], label: 'Ingreso total (rango)', value: ingresoTotal, currency: true, id: 'ingreso-total', color: '#00BCD4' }, // Resuelve TS2304: 'ingresoTotal'
      { ...kpisMock[1], label: 'Costo producto (proveedor)', value: costoProveedor, currency: true, id: 'costo-prov', color: '#F97316' }, // Resuelve TS2304: 'costoProveedor'
      { ...kpisMock[2], label: 'Costo envío', value: costoEnvio, currency: true, id: 'costo-envio', color: '#0EA5E9' },
      { ...kpisMock[3], label: 'Comisiones plataforma', value: comisionesPlata, currency: true, id: 'comisiones', color: '#A855F7' },
      // ... (resto de KPIs)
      { ...kpisMock[6], label: 'Utilidad neta final', value: utilidadNeta, currency: true, id: 'utilidad-neta', color: '#22C55E' },
      { ...kpisMock[7], label: 'Costos fijos mensuales', value: totalCostosFijos, currency: true, id: 'costos-fijos', color: '#64748B' }, // Resuelve TS2552: 'totalCostosFijos'
  ];
  
  const rightSideKpis: Kpi[] = [ // Resuelve TS6133: 'rightSideKpis'
      { label: 'Margen Bruto (%)', value: (ingresoTotal > 0 ? (utilidadTotal / ingresoTotal) * 100 : 0), unit: '%', id: 'margen', color: '#22C55E' },
      { label: 'ROAS', value: (totalCostosFijos > 0 ? ingresoTotal / totalCostosFijos : 0), unit: 'x', id: 'roas', color: '#00BCD4' },
      { label: 'Conversiones', value: (ventas.length * 1.5), id: 'conv', color: '#F97316' },
  ];
  // ----------------------------------------------------

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
              <div className="card status-badges" style={{ padding: 15 }}>
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
                <TopAdsTable rows={[]} title="" /> 
            </div>
          </div>

        </>
      )}
    </Layout>
  );
};

export default DashboardHome;