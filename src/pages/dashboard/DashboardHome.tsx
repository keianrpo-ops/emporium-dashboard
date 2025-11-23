import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock } from '../../mockData'; 
import { Doughnut } from 'react-chartjs-2';
// Importamos Bar para usar como placeholder para la Tendencia
import { Bar } from 'react-chartjs-2'; 


// ======================================================================
// === TIPOS Y HELPERS (RESTAURADOS LOCALMENTE - Necesarios para el build) ===
// ======================================================================
type VentaRow = { [key: string]: any; Valor_Venta?: string | number; Costo_Proveedor?: string | number; Costo_Envio?: string | number; Costo_CPA?: string | number; Costo_de_Venta?: string | number; Utilidad?: string | number; };
type CostosFijosRow = { [key: string]: any; Monto_Mensual?: string | number; };

const toNumber = (value: unknown): number => { /* ... */ return 0; };
const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number => { /* ... */ return 0; };
const getRows = <T extends Record<string, any>>(data: any): T[] => { /* ... */ return []; };
const getCostosDoughnutData = (
  costoProveedor: number, costoEnvio: number, costoPublicidad: number,
  comisionesPlata: number, utilidadBruta: number
) => { /* ... */ return { labels: [], datasets: [] }; };
const doughnutOptions: any = { 
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', 
    plugins: {
        legend: { position: 'bottom' as const, labels: { color: '#64748B', boxWidth: 14 } }, // Gris para tema claro
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
    // ... (Tu lógica de useEffect para cargar datos) ...
  }, []);

  // === CÁLCULOS PRINCIPALES (Mockeados para el diseño) ===
  const ingresoTotal = 3557800; // Mockeado para diseño
  const costoProveedor = 124000;
  const costoEnvio = 0;
  const costoPublicidad = 88000;
  const comisionesPlata = 262000;
  const utilidadTotal = 2600000;
  const totalCostosFijos = 2600000;
  const utilidadNeta = utilidadTotal - totalCostosFijos;
  
  const costosDoughnutData = getCostosDoughnutData(costoProveedor, costoEnvio, costoPublicidad, comisionesPlata, utilidadTotal);

  // === KPIs SUPERIORES (Estilo Medidor) ===
  const kpis = [
    { label: 'Ingreso total (rango)', value: ingresoTotal, currency: true, id: 'ingreso-total', color: '#00BCD4' },
    { label: 'Utilidad neta final', value: utilidadNeta, currency: true, id: 'utilidad-neta', color: '#22C55E' },
    { label: 'Costo producto (proveedor)', value: costoProveedor, currency: true, id: 'costo-prov', color: '#F97316' },
    { label: 'Costo publicidad (CPA)', value: costoPublicidad, currency: true, id: 'cpa', color: '#EF4444' },
    { label: 'Utilidad bruta total', value: utilidadTotal, currency: true, id: 'utilidad-bruta', color: '#22C55E' },
    { label: 'Comisiones plataforma', value: comisionesPlata, currency: true, id: 'comisiones', color: '#A855F7' },
  ];

  return (
    <Layout>
      {loading && <p>Cargando datos del dashboard...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      
      {!loading && !error && (
        <>
          <DateRangeBar /> 

          {/* 1. KPIs de Estado (Fila Superior) - ESTILO WORDOPS MEDIDOR */}
          <div className="status-kpis-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, marginBottom: '24px' }}>
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
              <div className="card status-badges" style={{ padding: 15 }}>
                <div className="card-title">Indicadores Clave de Rentabilidad</div>
                {kpis.slice(4, 8).map(kpi => (
                  <div key={kpi.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E2E8F0' }}>
                    <span>{kpi.label}</span>
                    <span style={{ fontWeight: 600, color: kpi.color }}>{kpi.currency ? `$${kpi.value.toLocaleString('es-CO')}` : kpi.value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>


          {/* 3. TABLA DE DETALLE (Full Width al final) */}
          <div className="card detail-table-section" style={{ padding: 16 }}>
            <div className="card-title" style={{ fontSize: 16 }}>Detalle: Top 10 anuncios por ventas</div>
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
                {/* Aquí se renderizaría la tabla detallada. Usaremos TopAdsTable como placeholder. */}
                <TopAdsTable rows={[]} title="" /> 
            </div>
          </div>

        </>
      )}
    </Layout>
  );
};

export default DashboardHome;