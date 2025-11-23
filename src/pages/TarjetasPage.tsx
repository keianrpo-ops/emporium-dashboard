import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
import { kpisMock } from '../mockData'; 
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ======================================================================
// === HELPERS NUMÉRICOS Y DE FILAS (IMPLEMENTACIÓN COMPLETA) ===
// ======================================================================

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Limpia el valor (elimina espacios, puntos como separador de miles, y $) antes de convertir
    const normalized = value
      .replace(/[\s$]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const n = Number(normalized);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);

const getRows = <T extends Record<string, any>>(data: any): T[] => {
  // Maneja la respuesta si viene en formato { rows: [...] } o directamente como array
  if (Array.isArray(data?.rows)) return data.rows as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
};

// ======================================================================
// === TIPOS DE DATOS Y LÓGICA DE GRÁFICAS ===
// ======================================================================

type TarjetaRow = {
  [key: string]: any;
  Banco?: string;
  Limite?: string | number;
  Saldo_Actual?: string | number;
  Cupo_Disponible?: string | number;
};
type MovimientoRow = {
  [key: string]: any;
  Tarjeta?: string;
  Monto?: string | number;
  Categoria?: string;
};

// Lógica de datos para la gráfica de Dona (Uso del cupo)
const getDoughnutData = (tarjetas: TarjetaRow[]) => {
  const totalLimite = sumByKey(tarjetas, 'Limite');
  const totalSaldo = sumByKey(tarjetas, 'Saldo_Actual');
  const totalCupoDisponible = totalLimite - totalSaldo;

  if (totalLimite === 0) return { labels: [], datasets: [] };

  return {
    labels: ['Saldo Utilizado', 'Cupo Disponible'],
    datasets: [
      {
        data: [totalSaldo, totalCupoDisponible],
        backgroundColor: ['#ef4444', '#10b981'], // Rojo para saldo, Verde para disponible
        hoverBackgroundColor: ['#f87171', '#34d399'],
        borderWidth: 2,
        borderColor: '#020617',
        hoverOffset: 4,
      },
    ],
  };
};

// Lógica de datos para la gráfica de Barras (Gastos por Categoría)
const getBarData = (movimientos: MovimientoRow[]) => {
  const categoryMap = new Map<string, number>();

  movimientos.forEach((mov) => {
    const categoria = mov.Categoria || 'Sin Categoría';
    const monto = toNumber(mov.Monto);
    categoryMap.set(categoria, (categoryMap.get(categoria) || 0) + monto);
  });

  // Ordenamos de mayor a menor gasto
  const sortedCategories = Array.from(categoryMap.entries()).sort(([, amountA], [, amountB]) => amountB - amountA);

  const labels = sortedCategories.map(([category]) => category);
  const data = sortedCategories.map(([, amount]) => amount);

  return {
    labels,
    datasets: [
      {
        label: 'Gasto Total por Categoría',
        data,
        backgroundColor: '#0ea5e9', // Azul
        borderColor: '#020617',
        borderWidth: 1,
      },
    ],
  };
};

const TarjetasPage: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<TarjetaRow[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoRow[]>([]);
  // NOTA: Se eliminan los estados 'loading' y 'error' no utilizados para resolver TS6133.

  useEffect(() => {
    const load = async () => {
      try {
        const [tarjetasData, movimientosData] = await Promise.all([
          fetchSheet('Tarjetas'), 
          fetchSheet('Movimientos_Tarjeta'),
        ]);

        setTarjetas(getRows<TarjetaRow>(tarjetasData));
        setMovimientos(getRows<MovimientoRow>(movimientosData));
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, []);

  // === CÁLCULOS DE KPI Y GRÁFICAS ===
  const totalLimite = sumByKey(tarjetas, 'Limite');
  const totalSaldo = sumByKey(tarjetas, 'Saldo_Actual');
  const totalCupoDisponible = totalLimite - totalSaldo;
  const totalGastosMes = sumByKey(movimientos, 'Monto');
  const porcentajeUtilizado = totalLimite > 0 ? (totalSaldo / totalLimite) * 100 : 0;
  
  const cardKpis = [
    { title: 'Límite Total', value: totalLimite, format: 'currency' },
    { title: 'Saldo Total', value: totalSaldo, format: 'currency' },
    { title: 'Cupo Disponible', value: totalCupoDisponible, format: 'currency' },
    { title: 'Gastos del Mes', value: totalGastosMes, format: 'currency' },
    { title: '% Utilizado', value: porcentajeUtilizado, format: 'percent' },
  ];
  
  const doughnutData = useMemo(() => getDoughnutData(tarjetas), [tarjetas]);
  const barData = useMemo(() => getBarData(movimientos), [movimientos]);

  return (
    <Layout>
      <div className="title-and-actions">
        <h1>Dashboard Tarjetas</h1>
      </div>
      
      {/* 1. KPIs de Resumen */}
      <KpiGrid kpis={cardKpis} />

      {/* 2. Gráficas de Uso de Cupo y Gastos por Categoría */}
      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card" style={{ height: 400, padding: 16 }}>
          <div className="card-title">Uso de Cupo Total</div>
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {tarjetas.length > 0 ? (
              <Doughnut data={doughnutData} />
            ) : (
              <p>No hay datos de tarjetas para graficar.</p>
            )}
          </div>
        </div>

        <div className="card" style={{ height: 400, padding: 16 }}>
          <div className="card-title">Gastos por Categoría (Movimientos)</div>
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {movimientos.length > 0 ? (
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            ) : (
              <p>No hay datos de movimientos para graficar.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TarjetasPage;