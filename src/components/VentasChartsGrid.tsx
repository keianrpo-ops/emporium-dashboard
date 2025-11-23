// src/components/VentasChartsGrid.tsx
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
} from 'chart.js';

// 🔹 Registro obligatorio de los elementos de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export interface VentaRow {
  [key: string]: any;
  Fecha?: string;
  ID_Venta?: string;
  Producto?: string;
  Cantidad?: number | string;
  Valor_Venta?: number | string;
  Metodo_Pago?: string;
  Canal_Venta?: string;
  Ciudad?: string;
  Cliente?: string;
  Telefono?: string;
  Plataforma_Ads?: string;
}

const toNumber = (value: any): number => {
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

interface Props {
  ventas: VentaRow[];
}

const VentasChartsGrid: React.FC<Props> = ({ ventas }) => {
  // ========= Agregados para las gráficas =========

  // Ventas por canal (Shopify, WhatsApp, etc) – por ingreso
  const ventasPorCanal = useMemo(() => {
    const acc: Record<string, number> = {};
    ventas.forEach((v) => {
      const canal = (v.Canal_Venta || 'Sin canal') as string;
      acc[canal] = (acc[canal] || 0) + toNumber(v.Valor_Venta);
    });
    return acc;
  }, [ventas]);

  // Ventas por método de pago
  const ventasPorMetodoPago = useMemo(() => {
    const acc: Record<string, number> = {};
    ventas.forEach((v) => {
      const metodo = (v.Metodo_Pago || 'Sin método') as string;
      acc[metodo] = (acc[metodo] || 0) + toNumber(v.Valor_Venta);
    });
    return acc;
  }, [ventas]);

  // Top 10 ciudades por ingreso
  const ventasPorCiudad = useMemo(() => {
    const acc: Record<string, number> = {};
    ventas.forEach((v) => {
      const ciudad = (v.Ciudad || 'Sin ciudad') as string;
      acc[ciudad] = (acc[ciudad] || 0) + toNumber(v.Valor_Venta);
    });

    return Object.entries(acc)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [ventas]);

  // ========= Configuración de datasets =========

  const canalLabels = Object.keys(ventasPorCanal);
  const canalData = Object.values(ventasPorCanal);

  const metodoLabels = Object.keys(ventasPorMetodoPago);
  const metodoData = Object.values(ventasPorMetodoPago);

  const ciudadLabels = ventasPorCiudad.map(([ciudad]) => ciudad);
  const ciudadData = ventasPorCiudad.map(([, total]) => total);

  const donutColors = [
    '#22c55e',
    '#0ea5e9',
    '#a855f7',
    '#f97316',
    '#eab308',
    '#ec4899',
    '#38bdf8',
    '#4ade80',
  ];

  const donutHoverColors = [
    '#4ade80',
    '#38bdf8',
    '#c084fc',
    '#fb923c',
    '#facc15',
    '#f472b6',
    '#7dd3fc',
    '#86efac',
  ];

  const donutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%', // efecto dona
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e5e7eb',
          boxWidth: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: $${value.toLocaleString('es-CO')}`;
          },
        },
      },
    },
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `$${(context.raw || 0).toLocaleString('es-CO')}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af',
          maxRotation: 45,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: '#9ca3af',
          callback: (value: any) =>
            `$${Number(value).toLocaleString('es-CO')}`,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.15)',
        },
      },
    },
  };

  const donutCanalData = {
    labels: canalLabels,
    datasets: [
      {
        data: canalData,
        backgroundColor: canalLabels.map(
          (_, i) => donutColors[i % donutColors.length],
        ),
        hoverBackgroundColor: canalLabels.map(
          (_, i) => donutHoverColors[i % donutHoverColors.length],
        ),
        borderWidth: 2,
        borderColor: '#020617',
        hoverOffset: 6,
      },
    ],
  };

  const donutMetodoData = {
    labels: metodoLabels,
    datasets: [
      {
        data: metodoData,
        backgroundColor: metodoLabels.map(
          (_, i) => donutColors[i % donutColors.length],
        ),
        hoverBackgroundColor: metodoLabels.map(
          (_, i) => donutHoverColors[i % donutHoverColors.length],
        ),
        borderWidth: 2,
        borderColor: '#020617',
        hoverOffset: 6,
      },
    ],
  };

  const barCiudadData = {
    labels: ciudadLabels,
    datasets: [
      {
        data: ciudadData,
        backgroundColor: 'rgba(56, 189, 248, 0.9)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="charts-grid">
      {/* Dona 1: Ingresos por canal de venta */}
      <div className="chart-card">
        <div className="chart-card-title">Ingresos por canal de venta</div>
        <div className="donut-wrapper">
          {canalData.length > 0 ? (
            <Doughnut data={donutCanalData} options={donutOptions} />
          ) : (
            <p className="chart-empty">Aún no hay datos de canales.</p>
          )}
        </div>
      </div>

      {/* Dona 2: Ingresos por método de pago */}
      <div className="chart-card">
        <div className="chart-card-title">Ingresos por método de pago</div>
        <div className="donut-wrapper">
          {metodoData.length > 0 ? (
            <Doughnut data={donutMetodoData} options={donutOptions} />
          ) : (
            <p className="chart-empty">Aún no hay datos de métodos de pago.</p>
          )}
        </div>
      </div>

      {/* Barras: Top 10 ciudades por ingreso */}
      <div className="chart-card chart-card--tall">
        <div className="chart-card-title">Top 10 ciudades por ingreso</div>
        <div className="bar-wrapper">
          {ciudadData.length > 0 ? (
            <Bar data={barCiudadData} options={barOptions} />
          ) : (
            <p className="chart-empty">Aún no hay datos de ciudades.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VentasChartsGrid;
