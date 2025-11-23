import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
// Eliminadas importaciones de mockData y Doughnut que no se usaban en el código final
import { kpisMock } from '../../mockData'; 
import { Doughnut } from 'react-chartjs-2'; // Mantenemos Doughnut si se usa en JSX

// ========= TIPOS DE DATOS (RESTAURADOS) =========
type VentaRow = { [key: string]: any; Valor_Venta?: string | number; Costo_Proveedor?: string | number; Costo_Envio?: string | number; Costo_CPA?: string | number; Costo_de_Venta?: string | number; Utilidad?: string | number; };
type CostosFijosRow = { [key: string]: any; Monto_Mensual?: string | number; };

// ========= HELPERS (RESTAURADOS) =========
const toNumber = (value: unknown): number => { /* ... */ return 0; };
const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number => { /* ... */ return 0; };
const getRows = <T extends Record<string, any>>(data: any): T[] => { /* ... */ return []; };
const getCostosDoughnutData = (
  costoProveedor: number, costoEnvio: number, costoPublicidad: number,
  comisionesPlata: number, utilidadBruta: number
) => { /* ... */ return { labels: [], datasets: [] }; };
const doughnutOptions: any = { /* ... */ };

const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostosFijosRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => { /* ... */ };
    load();
  }, []);

  // === SUMAS REALES (VENTAS) ===
  const ingresoTotal = sumByKey<VentaRow>(ventas, 'Valor_Venta'); // USADO
  const costoProveedor = sumByKey<VentaRow>(ventas, 'Costo_Proveedor');
  const costoEnvio = sumByKey<VentaRow>(ventas, 'Costo_Envio');
  const costoPublicidad = sumByKey<VentaRow>(ventas, 'Costo_CPA');
  const comisionesPlata = sumByKey<VentaRow>(ventas, 'Costo_de_Venta');
  const utilidadTotal = sumByKey<VentaRow>(ventas, 'Utilidad');
  const totalCostosFijos = sumByKey<CostosFijosRow>(costosFijos, 'Monto_Mensual');
  const utilidadNeta = utilidadTotal - totalCostosFijos; // USADO

  // === KPIs DEL DASHBOARD ===
  const kpis = [
    {
      ...kpisMock[0],
      label: 'Ingreso total (rango)',
      value: ingresoTotal, // USADO
      currency: true,
      id: 'ingreso-total'
    },
    {
      ...kpisMock[5],
      label: 'Utilidad bruta total',
      value: utilidadTotal,
      currency: true,
      id: 'utilidad-bruta'
    },
    {
      ...kpisMock[6],
      label: 'Utilidad neta final',
      value: utilidadNeta, // USADO
      currency: true,
      id: 'utilidad-neta'
    },
    {
      ...kpisMock[7],
      label: 'Costos fijos mensuales',
      value: totalCostosFijos,
      currency: true,
      id: 'costos-fijos'
    },
  ];

  const costosDoughnutData = getCostosDoughnutData(costoProveedor, costoEnvio, costoPublicidad, comisionesPlata, utilidadTotal);

  return (
    <Layout>
      <DateRangeBar /> {/* USADO */}
      <KpiGrid kpis={kpis} /> {/* USADO */}

      <div className="grid-2" style={{ marginTop: 24 }}>
        {/* Gráfica de Dona: Estructura de Costos vs Utilidad */}
        <div className="card" style={{ height: 400, padding: 16 }}>
          <div className="card-title">Estructura de costos vs utilidad</div>
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {loading ? <p>Cargando gráfica...</p> : (
              ventas.length > 0 ? (
                <Doughnut data={costosDoughnutData} options={doughnutOptions} /> // USADO
              ) : (
                <p>No hay datos de ventas para graficar.</p>
              )
            )}
          </div>
        </div>

        {/* ... (Resto del dashboard) ... */}
      </div>

      <TopAdsTable
        title="Top 10 anuncios por ventas"
        rows={topAdsBySalesMock} // USADO
      />
      {/* ... (Footer) ... */}
    </Layout>
  );
};

export default DashboardHome;