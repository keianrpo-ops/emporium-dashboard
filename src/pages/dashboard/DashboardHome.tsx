// src/pages/DashboardHome.tsx
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';
import { kpisMock, topAdsBySalesMock } from '../../mockData';

const DashboardHome = () => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSheet('Ventas'); // hoja "Ventas"
        setVentas(data);
      } catch (e) {
        console.error(e);
        setError('No pudimos leer los datos de Google Sheets.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // 👉 Ajusta aquí el nombre de la columna si fuera necesario.
  // En el JSON que vimos venía como "Valor_Venta".
  const totalVentasReal = ventas.reduce(
    (acc: number, row: any) => {
      const bruto = Number(row.Valor_Venta || 0);
      if (isNaN(bruto)) return acc;
      return acc + bruto;
    },
    0
  );

  // Dejamos el value como NÚMERO (Kpi.value es number)
  const kpis = [
    {
      ...kpisMock[0],
      value: totalVentasReal > 0 ? totalVentasReal : kpisMock[0].value,
    },
    kpisMock[1],
    kpisMock[2],
    kpisMock[3],
    kpisMock[4],
    kpisMock[5],
    kpisMock[6],
    kpisMock[7],
  ];

  return (
    <Layout>
      <DateRangeBar />
      <KpiGrid kpis={kpis} />

      <div className="grid-2">
        <div className="card card--placeholder">
          <div className="card-title">Estructura de costos vs utilidad</div>
          <p>
            Aún no hay datos para graficar (conectaremos con Google Sheets
            después).
          </p>
        </div>

        <div className="card card--placeholder">
          <div className="card-title">Indicadores clave</div>
          <p>
            Margen bruto, margen neto y peso de la publicidad sobre el ingreso.
          </p>
        </div>
      </div>

      <TopAdsTable title="Top 10 anuncios por ventas" rows={topAdsBySalesMock} />

      {/* Estado de carga / error */}
      <div style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        {loading && <span>Actualizando datos desde Google Sheets...</span>}
        {error && <span style={{ color: '#f87171' }}>{error}</span>}
        {!loading && !error && (
          <span>
            Fuente: {ventas.length} filas leídas desde la hoja <b>"Ventas"</b>.
          </span>
        )}
      </div>
    </Layout>
  );
};

export default DashboardHome;
