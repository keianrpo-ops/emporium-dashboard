// src/App.tsx
import React from 'react';
import Layout from './components/Layout';
import DateRangeBar from './components/DateRangeBar';
import KpiGrid from './components/KpiGrid';
import TopAdsTable from './components/TopAdsTable';
import { kpisMock, topAdsBySalesMock } from './mockData';

const App: React.FC = () => {
  return (
    <Layout>
      <DateRangeBar />
      <KpiGrid kpis={kpisMock} />

      <div className="grid-2">
        <div className="card card--placeholder">
          <div className="card-title">Estructura de costos vs utilidad</div>
          <p>Aún no hay datos para graficar (conectaremos con Google Sheets después).</p>
        </div>

        <div className="card card--placeholder">
          <div className="card-title">Indicadores clave</div>
          <p>Margen bruto, margen neto y peso de la publicidad sobre el ingreso.</p>
        </div>
      </div>

      <TopAdsTable title="Top 10 anuncios por ventas" rows={topAdsBySalesMock} />
    </Layout>
  );
};

export default App;
