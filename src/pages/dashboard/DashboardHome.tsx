import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock } from '../../mockData'; 
import { Doughnut, Bar } from 'react-chartjs-2';

// === TIPOS Y HELPERS (RESTAURADOS LOCALMENTE) ===
type VentaRow = { [key: string]: any; Valor_Venta?: string | number; Costo_Proveedor?: string | number; Costo_Envio?: string | number; Costo_CPA?: string | number; Costo_de_Venta?: string | number; Utilidad?: string | number; Fecha?: string; };
type CostosFijosRow = { [key: string]: any; Monto_Mensual?: string | number; };

const toNumber = (value: unknown): number => { /* ... */ return 0; };
const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number => rows.reduce((acc, row) => acc + toNumber(row[key]), 0);
const getRows = <T extends Record<string, any>>(data: any): T[] => { /* ... */ return []; };
const getCostosDoughnutData = (
  costoProveedor: number, costoEnvio: number, costoPublicidad: number,
  comisionesPlata: number, utilidadBruta: number
) => { /* ... */ return { labels: [], datasets: [] }; };
const doughnutOptions: any = { /* ... */ }; 
// NOTA: Para que compile, debes tener la implementación completa de estos helpers.
// Asumimos que los tienes definidos en el archivo como te lo di en el paso anterior.


// === CÓDIGO DE GRÁFICA DE EJEMPLO DE LÍNEA ===
const lineChartData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
        {
            label: 'Utilidad Bruta',
            data: [120000, 180000, 150000, 220000],
            borderColor: '#22C55E', // Verde de Utilidad
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            fill: true,
            tension: 0.4
        }
    ]
};
const lineChartOptions: any = { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#64748B' } }, y: { ticks: { color: '#64748B' } } } };


// ========= COMPONENTE PRINCIPAL (ESTRUCTURA PROFESIONAL) =========
const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostosFijosRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... (Tu useEffect para carga de datos) ...

  // === CÁLCULOS ===
  const ingresoTotal = 3557800; // Mockeado para diseño
  const utilidadNeta = 2000000; // Mockeado para diseño
  const costoPublicidad = 88000;
  const utilidadTotal = 2600000;
  
  const costosDoughnutData = getCostosDoughnutData(124000, 0, costoPublicidad, 262000, utilidadTotal);

  const kpis = [
      { label: 'Ingreso total (rango)', value: ingresoTotal, currency: true, id: 'ingreso-total' },
      { label: 'Costo producto (proveedor)', value: 124000, currency: true, id: 'costo-prov' },
      { label: 'Utilidad neta final', value: utilidadNeta, currency: true, id: 'utilidad-neta' },
      { label: 'Costo publicidad (CPA)', value: costoPublicidad, currency: true, id: 'cpa' },
  ];
  const rightSideKpis = [
      { label: 'Margen Bruto (%)', value: 35.5, unit: '%', id: 'margen' },
      { label: 'ROAS', value: 3.2, unit: 'x', id: 'roas' },
      { label: 'Conversiones', value: 124, id: 'conv' },
  ];

  return (
    <Layout>
      <DateRangeBar /> 
      
      {loading && <p>Cargando dashboard...</p>}
      {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}

      <div className="main-dashboard-grid" style={{ marginTop: 24, display: 'grid', gap: 24, gridTemplateColumns: '1fr' }}>
        
        {/* 1. KPIs de Estado (Fila Superior) - Estilo Speedometer/Gauges */}
        <div className="status-kpis-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {kpis.slice(0, 4).map(kpi => (
            <div key={kpi.id} className="card card-status" style={{ textAlign: 'center', padding: '20px 10px', height: '140px' }}>
              <p className="kpi-label">{kpi.label}</p>
              <h2 className="kpi-value" style={{ fontSize: 24, color: kpi.id === 'utilidad-neta' ? '#22C55E' : '#00BCD4' }}>
                ${kpi.value.toLocaleString('es-CO')}
              </h2>
            </div>
          ))}
        </div>


        {/* 2. GRÁFICOS PRINCIPALES Y DATOS DE STATUS */}
        <div className="main-metrics-section" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          
          {/* Columna Izquierda: Gráfico de Tendencia */}
          <div className="card chart-large" style={{ height: 450, padding: 20 }}>
            <div className="card-title" style={{ fontSize: 16 }}>Tendencia de Utilidad Bruta (6 Meses)</div>
            <div style={{ height: '380px' }}>
              {/* Placeholder para la gráfica de Línea/Área (Utilidad vs Ingreso) */}
              <Bar data={lineChartData} options={lineChartOptions} /> 
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
                <div key={kpi.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span>{kpi.label}</span>
                  <span style={{ fontWeight: 600, color: '#22C55E' }}>{kpi.value}{kpi.unit}</span>
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
              {/* NOTA: En tu código real, debes poblar las filas. */}
              <TopAdsTable rows={[]} title="" /> 
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default DashboardHome;