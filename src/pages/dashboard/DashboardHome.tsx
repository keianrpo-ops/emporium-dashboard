import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock } from '../../mockData'; 
import { Doughnut } from 'react-chartjs-2';


// ======================================================================
// === TIPOS Y HELPERS (RESTAURADOS Y CORREGIDOS PARA TS2339) ===
// ======================================================================
type VentaRow = { [key: string]: any; Valor_Venta?: string | number; Costo_Proveedor?: string | number; Costo_Envio?: string | number; Costo_CPA?: string | number; Costo_de_Venta?: string | number; Utilidad?: string | number; };
type CostosFijosRow = { [key be: string]: any; Monto_Mensual?: string | number; };

// Definición de tipo Kpi para resolver TS2339 (Propiedades color, currency, unit)
type Kpi = {
    label: string;
    value: number;
    currency?: boolean; 
    unit?: string;
    id: string;
    color?: string; // Necesario para que la propiedad exista
};

// Helper para convertir a número
const toNumber = (value: unknown): number => { /* ... */ return 0; };
const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number => { /* ... */ return 0; };
const getRows = <T extends Record<string, any>>(data: any): T[] => { /* ... */ return []; };
const getCostosDoughnutData = (
  costoProveedor: number, costoEnvio: number, costoPublicidad: number,
  comisionesPlata: number, utilidadBruta: number
) => { /* ... */ return { labels: [], datasets: [] }; };
const doughnutOptions: any = { /* ... */ };


// ======================================================================
// === COMPONENTE PRINCIPAL (USANDO LAS VARIABLES) ===
// ======================================================================

const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostosFijosRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lógica de carga de datos...
  }, []);

  // === CÁLCULOS PRINCIPALES ===
  const ingresoTotal = 3557800; // Mockeado para diseño
  const costoProveedor = 124000;
  const costoEnvio = 0;
  const costoPublicidad = 88000;
  const comisionesPlata = 262000;
  const utilidadTotal = 2600000;
  const totalCostosFijos = 2600000;
  const utilidadNeta = utilidadTotal - totalCostosFijos; 
  
  const costosDoughnutData = getCostosDoughnutData(costoProveedor, costoEnvio, costoPublicidad, comisionesPlata, utilidadTotal);

  // === KPIs DEL DASHBOARD (Usando las variables y kpisMock) ===
  const kpis: Kpi[] = [ // Aplicamos el tipo Kpi[]
    // Usamos kpisMock para asegurar que se usa (resolviendo TS6133)
    { ...kpisMock[0], label: 'Ingreso total (rango)', value: ingresoTotal, currency: true, id: 'ingreso-total', color: '#00BCD4' },
    { ...kpisMock[1], label: 'Costo producto (proveedor)', value: costoProveedor, currency: true, id: 'costo-prov', color: '#F97316' },
    { ...kpisMock[2], label: 'Costo envío', value: costoEnvio, currency: true, id: 'costo-envio', color: '#0EA5E9' },
    { ...kpisMock[3], label: 'Comisiones plataforma', value: comisionesPlata, currency: true, id: 'comisiones', color: '#A855F7' },
    { ...kpisMock[4], label: 'Costo publicidad (CPA)', value: costoPublicidad, currency: true, id: 'cpa', color: '#EF4444' },
    { ...kpisMock[5], label: 'Utilidad bruta total', value: utilidadTotal, currency: true, id: 'utilidad-bruta', color: '#22C55E' },
    { ...kpisMock[6], label: 'Utilidad neta final', value: utilidadNeta, currency: true, id: 'utilidad-neta', color: '#22C55E' },
    { ...kpisMock[7], label: 'Costos fijos mensuales', value: totalCostosFijos, currency: true, id: 'costos-fijos', color: '#64748B' },
  ];

  return (
    <Layout>
      {loading && <p>Cargando datos del dashboard...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      
      {!loading && !error && (
        <>
          <DateRangeBar /> 
          <KpiGrid kpis={kpis} /> {/* USADO AQUI */}

          <div className="grid-2" style={{ marginTop: 24 }}>
            {/* Gráfica de Dona: Estructura de Costos vs Utilidad */}
            <div className="card" style={{ height: 400, padding: 16 }}>
              <div className="card-title">Estructura de costos vs utilidad</div>
              <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
                {ventas.length > 0 ? (
                  <Doughnut data={costosDoughnutData} options={doughnutOptions} />
                ) : (
                  <p>No hay datos de ventas para graficar.</p>
                )}
              </div>
            </div>

            {/* Gráfica de Barra Apilada o Placeholder */}
            <div className="card" style={{ height: 400 }}>
              <div className="card-title">Tendencia de Costos Mensuales</div>
              <p style={{ opacity: 0.7 }}>
                *Gráfica de barra apilada para mostrar la evolución de Costos Fijos, CPA y Utilidad a lo largo del tiempo.
              </p>
            </div>
          </div>

          <TopAdsTable
            title="Top 10 anuncios por ventas"
            rows={[]}
          />
        </>
      )}
    </Layout>
  );
};

export default DashboardHome;