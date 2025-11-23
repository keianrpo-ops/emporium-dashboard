// src/pages/TarjetasPage.tsx (VERSIÓN FINAL CON GRÁFICAS Y BARRA DE PROGRESO)

import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
import { kpisMock } from '../../mockData';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


// --- helpers numéricos (Reutilizados de CampañasPage) ---
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
const sumByKey = <T extends Record<string, any>>(
  rows: T[],
  key: keyof T
): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);
const getRows = <T extends Record<string, any>>(data: any): T[] => {
  if (Array.isArray(data?.rows)) return data.rows as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
};


// Tipos de datos para las hojas de Tarjetas
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

// --- LÓGICA DE GRÁFICAS ---

// Datos para la gráfica de dona (Disponibilidad de Cupo)
const getDoughnutData = (rows: TarjetaRow[]) => {
    const totalLimite = sumByKey(rows, 'Limite');
    const totalSaldo = sumByKey(rows, 'Saldo_Actual');
    const totalCupoDisponible = totalLimite - totalSaldo;

    if (totalLimite === 0) return { labels: [], datasets: [] };

    return {
        labels: ['Cupo Disponible', 'Saldo Utilizado'],
        datasets: [
            {
                data: [totalCupoDisponible, totalSaldo],
                backgroundColor: ['#22c55e', '#ef4444'], // Verde para disponible, Rojo para utilizado
                hoverBackgroundColor: ['#4ade80', '#f87171'],
                borderWidth: 2,
                borderColor: '#020617',
                hoverOffset: 8,
            },
        ],
    };
};

// Opciones de la gráfica de dona
const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
        legend: { position: 'bottom' as const, labels: { color: '#e5e7eb', boxWidth: 14 } },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${label}: $${value.toLocaleString('es-CO')} (${percentage}%)`;
                },
            },
        },
    },
};

// Lógica para agrupar gastos por categoría
const getBarData = (movimientos: MovimientoRow[]) => {
    const grouped: Record<string, number> = {};
    movimientos.forEach(mov => {
        const cat = mov.Categoria || 'Sin Categoría';
        grouped[cat] = (grouped[cat] || 0) + toNumber(mov.Monto);
    });

    const categories = Object.keys(grouped);
    const amounts = Object.values(grouped);

    // Mapeo de colores (podrías hacer esto dinámico si es necesario)
    const backgroundColors = categories.map((_, i) => ['#0ea5e9', '#f97316', '#a855f7', '#22c55e', '#eab308'][i % 5]);

    return {
        labels: categories,
        datasets: [
            {
                label: 'Monto Gastado',
                data: amounts,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('1', '9')), // Un tono más fuerte
                borderWidth: 1,
            },
        ],
    };
};

const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    return `Monto: $${context.parsed.y.toLocaleString('es-CO')}`;
                },
            },
        },
    },
    scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
        y: { ticks: { color: '#94a3b8', callback: (value: number) => `$${(value / 1000).toFixed(0)}k` }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
    }
}


const TarjetasPage: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<TarjetaRow[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [tarjetasData, movimientosData] = await Promise.all([
          fetchSheet('Tarjetas'), // Asumiendo que esta es la hoja con límites
          fetchSheet('Movimientos_Tarjeta'), // Asumiendo que esta es la hoja de gastos
        ]);

        setTarjetas(getRows<TarjetaRow>(tarjetasData));
        setMovimientos(getRows<MovimientoRow>(movimientosData));
      } catch (e) {
        console.error(e);
        setError('No pudimos leer las hojas de "Tarjetas" o "Movimientos_Tarjeta".');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ======== Cálculos Estadísticos ========
  const totalLimite = sumByKey(tarjetas, 'Limite');
  const totalSaldo = sumByKey(tarjetas, 'Saldo_Actual');
  const totalCupoDisponible = totalLimite - totalSaldo;
  const totalGastosMes = sumByKey(movimientos, 'Monto');
  const porcentajeUtilizado = totalLimite > 0 ? (totalSaldo / totalLimite) * 100 : 0;
  
  const doughnutData = useMemo(() => getDoughnutData(tarjetas), [tarjetas]);
  const barData = useMemo(() => getBarData(movimientos), [movimientos]);

  // === KPIs ===
  const cardKpis = [
    {
      ...kpisMock[0],
      label: 'Límite de crédito total',
      value: totalLimite,
      currency: true,
    },
    {
      ...kpisMock[1],
      label: 'Saldo total utilizado',
      value: totalSaldo,
      currency: true,
      color: '#ef4444',
    },
    {
      ...kpisMock[2],
      label: 'Cupo disponible total',
      value: totalCupoDisponible,
      currency: true,
      color: '#22c55e',
    },
    {
      ...kpisMock[3],
      label: 'Gastos del mes',
      value: totalGastosMes,
      currency: true,
      color: '#f97316',
    },
  ];

  return (
    <Layout>
      <h1 className="page-title">Control de Tarjetas de Crédito</h1>
      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Visualización de cupos y distribución de gastos de las hojas <b>“Tarjetas”</b> y <b>“Movimientos_Tarjeta”</b>.
      </p>

      {/* Grid de KPIs */}
      <KpiGrid kpis={cardKpis} /> 

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginTop: 24 }}>
        
        {/* Gráfica de Dona: Disponibilidad de Cupo */}
        <div className="card" style={{ height: 400, padding: 16 }}>
          <div className="card-title">Disponibilidad de Cupo Global</div>
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {tarjetas.length > 0 ? (
                <>
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div style={{ textAlign: 'center', marginTop: -15, fontSize: 32, fontWeight: 700, color: '#0ea5e9' }}>
                    {porcentajeUtilizado.toFixed(1)}%
                    <p style={{ fontSize: 14, opacity: 0.7, fontWeight: 500, marginTop: -5 }}>Utilizado</p>
                </div>
                </>
            ) : (
                <p className="loading-state">Cargando límites de tarjetas...</p>
            )}
          </div>
        </div>

        {/* Gráfica de Barra: Gastos por Categoría */}
        <div className="card" style={{ height: 400, padding: 16 }}>
          <div className="card-title">Distribución de Gastos por Categoría</div>
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {movimientos.length > 0 ? (
                <Bar data={barData} options={barOptions} />
            ) : (
                <p className="loading-state">Cargando movimientos de tarjetas...</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Detalle de Tarjetas (con Barras de Progreso) */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">Detalle por Tarjeta (Uso de Cupo)</div>
        
        {loading && <p>Cargando datos de tarjetas...</p>}
        {error && <p style={{ color: '#f87171' }}>{error}</p>}

        {!loading && !error && tarjetas.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Banco</th>
                  <th>Límite ($)</th>
                  <th>Saldo Utilizado ($)</th>
                  <th>Cupo Disponible ($)</th>
                  <th>Uso de Cupo (%)</th>
                </tr>
              </thead>
              <tbody>
                {tarjetas.map((card, idx) => {
                    const limite = toNumber(card.Limite);
                    const saldo = toNumber(card.Saldo_Actual);
                    const cupoDisp = toNumber(card.Cupo_Disponible);
                    const usoPct = limite > 0 ? (saldo / limite) * 100 : 0;
                    
                    return (
                        <tr key={idx}>
                            <td>{card.Banco ?? 'N/A'}</td>
                            <td>{limite.toLocaleString('es-CO')}</td>
                            <td>{saldo.toLocaleString('es-CO')}</td>
                            <td>{cupoDisp.toLocaleString('es-CO')}</td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 100, height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' }}>
                                        <div 
                                            style={{ 
                                                width: `${Math.min(100, usoPct)}%`, 
                                                height: '100%', 
                                                background: usoPct > 80 ? '#ef4444' : (usoPct > 50 ? '#f97316' : '#22c55e'), // Colores por umbral
                                                transition: 'width 0.5s'
                                            }} 
                                        />
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600 }}>{usoPct.toFixed(1)}%</span>
                                </div>
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TarjetasPage;