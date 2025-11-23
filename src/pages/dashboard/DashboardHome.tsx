import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock } from '../../mockData'; 
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ======================================================================
// === TIPOS Y HELPERS (Definidos para una compilación exitosa) ===
// ======================================================================
type VentaRow = { [key: string]: any; Valor_Venta?: string | number; Costo_Proveedor?: string | number; Costo_Envio?: string | number; Costo_CPA?: string | number; Costo_de_Venta?: string | number; Utilidad?: string | number; };
type CostosFijosRow = { [key: string]: any; Monto_Mensual?: string | number; };
type Kpi = { label: string; value: number; currency?: boolean; unit?: string; id: string; color?: string; };

const toNumber = (value: unknown): number => { /* ... */ return 0; };
const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number => { /* ... */ return 0; };
const getRows = <T extends Record<string, any>>(data: any): T[] => { /* ... */ return []; };
const getCostosDoughnutData = (costoProveedor: number, costoEnvio: number, costoPublicidad: number, comisionesPlata: number, utilidadBruta: number) => { /* ... */ return { labels: [], datasets: [] }; };
const doughnutOptions: any = { /* ... */ }; 

// === NUEVO COMPONENTE DE TARJETA DE COLOR SOLIDO (PARA LA FILA SUPERIOR) ===
const SolidColorKpiCard: React.FC<{ kpi: Kpi, icon: string }> = ({ kpi, icon }) => {
    const formattedValue = kpi.currency 
        ? `$${kpi.value.toLocaleString('es-CO')}` 
        : kpi.value.toLocaleString('es-CO');

    return (
        <div 
            key={kpi.id} 
            className="card card-solid-kpi" 
            style={{ 
                background: kpi.color, 
                color: 'white', 
                padding: 20, 
                borderRadius: '8px', 
                boxShadow: `0 4px 10px ${kpi.color}88`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 5 }}>{kpi.label}</p>
                <span style={{ fontSize: 40, opacity: 0.8 }}>{icon}</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
                {formattedValue}
                {kpi.unit && <span style={{ fontSize: 16, marginLeft: 5 }}>{kpi.unit}</span>}
            </h2>
        </div>
    );
};


const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostosFijosRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... (Tu useEffect y lógica de carga) ...

  // === CÁLCULOS PRINCIPALES (Mockeados para el diseño, para que el componente compile) ===
  const ingresoTotal = 3557800;
  const costoProveedor = 124000;
  const costoEnvio = 0;
  const costoPublicidad = 88000;
  const comisionesPlata = 262000;
  const utilidadTotal = 2600000;
  const totalCostosFijos = 2600000;
  const utilidadNeta = utilidadTotal - totalCostosFijos; 
  
  const costosDoughnutData = getCostosDoughnutData(costoProveedor, costoEnvio, costoPublicidad, comisionesPlata, utilidadTotal);

  // === KPIs SUPERIORES (Estilo Tarjeta de Color) ===
  const kpis: Kpi[] = [ 
      { label: 'Ingreso total (rango)', value: ingresoTotal, currency: true, id: 'ingreso-total', color: '#00BCD4' },
      { label: 'Utilidad neta final', value: utilidadNeta, currency: true, id: 'utilidad-neta', color: '#22C55E' },
      { label: 'Costo producto (proveedor)', value: costoProveedor, currency: true, id: 'costo-prov', color: '#F97316' },
      { label: 'Costo publicidad (CPA)', value: costoPublicidad, currency: true, id: 'cpa', color: '#EF4444' },
  ];
  const rightSideKpis: Kpi[] = [ 
      { label: 'Margen Bruto (%)', value: 35.5, unit: '%', id: 'margen', color: '#22C55E' },
      { label: 'ROAS', value: 3.2, unit: 'x', id: 'roas', color: '#00BCD4' },
      { label: 'Conversiones', value: 124, id: 'conv', color: '#F97316' },
  ];

  return (
    <Layout>
      {loading && <p>Cargando datos del dashboard...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      
      {!loading && !error && (
        <>
          <DateRangeBar /> 

          {/* 1. KPIs DE COLOR SOLIDO (TARJETAS GRANDES) */}
          <div className="kpi-color-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: '30px', marginTop: '10px' }}>
              {kpis.map((kpi, index) => (
                  <SolidColorKpiCard 
                      key={kpi.id}
                      kpi={kpi} 
                      icon={['🛒', '💵', '📦', '📣'][index]}
                  />
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
                <div classNameos="card-title">Estructura de Costos vs Utilidad</div>
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