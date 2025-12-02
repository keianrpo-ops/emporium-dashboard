import React, { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export interface VentaRow {
  [key: string]: any;
  Fecha?: string;
  ID_Venta?: string;
  Producto?: string;
  Valor_Venta?: number | string;
  Metodo_Pago?: string;
  Canal_Venta?: string;
  Ciudad?: string;
}

const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[\s$]/g, '').replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

interface Props {
  ventas: VentaRow[];
}

const VentasChartsGrid: React.FC<Props> = ({ ventas }) => {

  // --- DATOS ---
  const ventasPorCanal = useMemo(() => {
    const acc: Record<string, number> = {};
    ventas.forEach((v) => {
      const canal = (v.Canal_Venta || 'Otro') as string;
      acc[canal] = (acc[canal] || 0) + toNumber(v.Valor_Venta);
    });
    return acc;
  }, [ventas]);

  const ventasPorMetodoPago = useMemo(() => {
    const acc: Record<string, number> = {};
    ventas.forEach((v) => {
      const metodo = (v.Metodo_Pago || 'Otro') as string;
      acc[metodo] = (acc[metodo] || 0) + toNumber(v.Valor_Venta);
    });
    return acc;
  }, [ventas]);

  const ventasPorCiudad = useMemo(() => {
    const acc: Record<string, number> = {};
    ventas.forEach((v) => {
      const ciudad = (v.Ciudad || 'Desconocido') as string;
      acc[ciudad] = (acc[ciudad] || 0) + toNumber(v.Valor_Venta);
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [ventas]);

  const canalLabels = Object.keys(ventasPorCanal);
  const canalData = Object.values(ventasPorCanal);
  const metodoLabels = Object.keys(ventasPorMetodoPago);
  const metodoData = Object.values(ventasPorMetodoPago);
  const ciudadLabels = ventasPorCiudad.map(([c]) => c);
  const ciudadData = ventasPorCiudad.map(([, v]) => v);

  const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false, // CLAVE PARA QUE FUNCIONE EN HEIGHT FIJO
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 12 } },
    },
  };

  const barOptions = {
    ...commonOptions,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false } },
        y: { grid: { color: '#f1f5f9' }, border: { display: false } }
    }
  };

  const dataDonaCanal = { labels: canalLabels, datasets: [{ data: canalData, backgroundColor: colors, borderWidth: 0 }] };
  const dataDonaPago = { labels: metodoLabels, datasets: [{ data: metodoData, backgroundColor: colors.slice().reverse(), borderWidth: 0 }] };
  const dataBarraCiudad = { labels: ciudadLabels, datasets: [{ label: 'Ventas', data: ciudadData, backgroundColor: '#0ea5e9', borderRadius: 4 }] };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. BARRAS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase">Top 10 Ciudades</h3>
        {/* LA JAULA: Height fijo + Relative */}
        <div style={{ height: '300px', position: 'relative', width: '100%' }}>
           {ciudadData.length > 0 ? <Bar data={dataBarraCiudad} options={barOptions} /> : <p>Sin datos</p>}
        </div>
      </div>

      {/* 2. DONAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase text-center">Canales</h3>
          {/* LA JAULA: Height fijo + Relative */}
          <div style={{ height: '250px', position: 'relative', width: '100%' }}>
            {canalData.length > 0 ? <Doughnut data={dataDonaCanal} options={commonOptions} /> : <p>Sin datos</p>}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase text-center">Pagos</h3>
          {/* LA JAULA: Height fijo + Relative */}
          <div style={{ height: '250px', position: 'relative', width: '100%' }}>
             {metodoData.length > 0 ? <Doughnut data={dataDonaPago} options={commonOptions} /> : <p>Sin datos</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentasChartsGrid;