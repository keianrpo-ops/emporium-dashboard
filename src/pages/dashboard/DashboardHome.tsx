import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock, topAdsBySalesMock } from '../../mockData'; // Asegúrate de que esta ruta sea correcta: '../../mockData'
import { Doughnut } from 'react-chartjs-2';

// ... (Tus definiciones de tipos y helpers existentes) ...
// Eliminando 'loading' y 'error' de las declaraciones si no se usan en el JSX.

const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostosFijosRow[]>([]);
  // Declaraciones removidas para TS6133:
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

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
        // setError('No pudimos leer los datos de Google Sheets.'); // Removido para TS6133
      } finally {
        // setLoading(false); // Removido para TS6133
      }
    };

    load();
  }, []);

  // ... (Resto del componente, ahora sin los errores de variables no usadas) ...
  const ingresoTotal = sumByKey<VentaRow>(ventas, 'Valor_Venta');
  // ... (otros cálculos) ...
  const utilidadNeta = utilidadTotal - totalCostosFijos;

  // ... (Resto del JSX) ...
  return (
    <Layout>
      {/* ... */}
    </Layout>
  );
};

export default DashboardHome;