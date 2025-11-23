import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock } from '../../mockData'; 
import { Doughnut } from 'react-chartjs-2';

// ========= TIPOS DE DATOS Y HELPERS (Definidos localmente) =========
type VentaRow = { [key: string]: any; Valor_Venta?: string | number; Costo_Proveedor?: string | number; Costo_Envio?: string | number; Costo_CPA?: string | number; Costo_de_Venta?: string | number; Utilidad?: string | number; };
type CostosFijosRow = { [key: string]: any; Monto_Mensual?: string | number; };

// Helper para convertir a número (usado)
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value
      .replace(/[\s$]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const n = Number(normalized);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

// Helper para sumar por clave (usado)
const sumByKey = <T extends Record<string, any>>(
  rows: T[],
  key: keyof T
): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);

// Helper para obtener filas (usado)
const getRows = <T extends Record<string, any>>(data: any): T[] => {
  if (Array.isArray(data?.rows)) return data.rows as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
};


// Lógica de Gráfica de Dona (usada)
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
        borderWidth: 2, borderColor: '#020617', hoverOffset: 4,
      },
    ],
  };
};

const doughnutOptions: any = { /* ... */ }; // Placeholder

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

  // === CÁLCULOS PRINCIPALES (Todas estas variables están siendo usadas en KPIs) ===
  const ingresoTotal = sumByKey<VentaRow>(ventas, 'Valor_Venta');
  const costoProveedor = sumByKey<VentaRow>(ventas, 'Costo_Proveedor');
  const costoEnvio = sumByKey<VentaRow>(ventas, 'Costo_Envio');
  const costoPublicidad = sumByKey<VentaRow>(ventas, 'Costo_CPA');
  const comisionesPlata = sumByKey<VentaRow>(ventas, 'Costo_de_Venta');
  const utilidadTotal = sumByKey<VentaRow>(ventas, 'Utilidad');
  const totalCostosFijos = sumByKey<CostosFijosRow>(costosFijos, 'Monto_Mensual');
  const utilidadNeta = utilidadTotal - totalCostosFijos; 
  
  const costosDoughnutData = getCostosDoughnutData(costoProveedor, costoEnvio, costoPublicidad, comisionesPlata, utilidadTotal);

  // === KPIs DEL DASHBOARD (Usando las variables) ===
  const kpis = [
    { label: 'Ingreso total (rango)', value: ingresoTotal, currency: true, id: 'ingreso-total' },
    // ... (resto de los KPIs que usan las variables) ...
  ];

  return (
    <Layout>
      <DateRangeBar /> 
      <KpiGrid kpis={kpis} /> 

      <div className="grid-2" style={{ marginTop: 24 }}>
        {/* Gráfica de Dona: Estructura de Costos vs Utilidad */}
        <div className="card" style={{ height: 400, padding: 16 }}>
          <div className="card-title">Estructura de costos vs utilidad</div>
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {loading ? <p>Cargando gráfica...</p> : (
              ventas.length > 0 ? (
                <Doughnut data={costosDoughnutData} options={doughnutOptions} />
              ) : (
                <p>No hay datos de ventas para graficar.</p>
              )
            )}
          </div>
        </div>
        {/* ... (El resto de la página) ... */}
      </div>
      <TopAdsTable
        title="Top 10 anuncios por ventas"
        rows={[]}
      />
    </Layout>
  );
};

export default DashboardHome;