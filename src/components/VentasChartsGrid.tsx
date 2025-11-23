// src/components/VentasChartsGrid.tsx
import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export interface VentaRow {
  Fecha?: string;
  ID_Venta?: string;
  Producto?: string;
  Cantidad?: number | string;
  Valor_Venta?: number | string;
  Metodo_Pago?: string;
  Ciudad?: string;
}

// Helper para asegurar número
const toNumber = (v: any): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string')
    return Number(v.replace(/\./g, '').replace(/,/g, '.')) || 0;
  return 0;
};

interface Props {
  ventas: VentaRow[];
}

const VentasChartsGrid: React.FC<Props> = ({ ventas }) => {
  // ================================
  // DONA - Métodos de pago
  // ================================
  const metodoCount: Record<string, number> = {};

  ventas.forEach(v => {
    const mp = v.Metodo_Pago || 'Sin dato';
    metodoCount[mp] = (metodoCount[mp] || 0) + 1;
  });

  const metodosLabels = Object.keys(metodoCount);
  const metodosData = Object.values(metodoCount);

  // ================================
  // DONA - Ciudades top
  // ================================
  const cityCount: Record<string, number> = {};

  ventas.forEach(v => {
    const c = v.Ciudad || 'Sin dato';
    cityCount[c] = (cityCount[c] || 0) + 1;
  });

  const cityLabels = Object.keys(cityCount);
  const cityData = Object.values(cityCount);

  // ================================
  // BARRAS - Productos más vendidos
  // ================================
  const prodCount: Record<string, number> = {};

  ventas.forEach(v => {
    const p = v.Producto || 'Sin nombre';
    prodCount[p] = (prodCount[p] || 0) + toNumber(v.Cantidad || 1);
  });

  const productLabels = Object.keys(prodCount);
  const productData = Object.values(prodCount);

  return (
    <div className="ventas-layout">
      {/* IZQUIERDA: Donas */}
      <div className="ventas-left">
        
        {/* Métodos de pago */}
        <div className="chart-card">
          <h3 className="chart-title">Métodos de pago</h3>
          <Doughnut
            data={{
              labels: metodosLabels,
              datasets: [
                {
                  data: metodosData,
                  backgroundColor: [
                    '#22c55e',
                    '#0ea5e9',
                    '#6366f1',
                    '#db2777',
                    '#f59e0b',
                  ],
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  labels: { color: '#e5e7eb' },
                },
              },
            }}
          />
        </div>

        {/* Ciudades */}
        <div className="chart-card">
          <h3 className="chart-title">Ciudades (Top ventas)</h3>
          <Doughnut
            data={{
              labels: cityLabels,
              datasets: [
                {
                  data: cityData,
                  backgroundColor: [
                    '#22c55e',
                    '#0ea5e9',
                    '#f43f5e',
                    '#6b7280',
                    '#a855f7',
                    '#14b8a6',
                  ],
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  labels: { color: '#e5e7eb' },
                },
              },
            }}
          />
        </div>
      </div>

      {/* DERECHA: Barras de productos */}
      <div className="ventas-right">
        <div className="chart-card">
          <h3 className="chart-title">Productos más vendidos</h3>
          <Bar
            data={{
              labels: productLabels,
              datasets: [
                {
                  label: 'Cantidad vendida',
                  data: productData,
                  backgroundColor: '#22c55e',
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              plugins: {
                legend: { labels: { color: '#e5e7eb' } },
              },
              scales: {
                x: {
                  ticks: { color: '#9ca3af' },
                },
                y: {
                  ticks: { color: '#9ca3af' },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VentasChartsGrid;
