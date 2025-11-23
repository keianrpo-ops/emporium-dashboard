import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { kpisMock } from '../mockData'; // Asegúrate que esta ruta sea correcta

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ======================================================================
// === HELPERS Y TIPOS DE DATOS (RESTAURADOS) ===
// ======================================================================
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
const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);
const getRows = <T extends Record<string, any>>(data: any): T[] => {
  if (Array.isArray(data?.rows)) return data.rows as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
};

// Tipos de datos para las hojas de Tarjetas
type TarjetaRow = { [key: string]: any; Limite?: string | number; Saldo_Actual?: string | number; };
type MovimientoRow = { [key: string]: any; Monto?: string | number; Categoria?: string; };

// Lógica de datos para la gráfica de Dona (Uso del cupo)
const getDoughnutData = (tarjetas: TarjetaRow[]) => {
  const totalLimite = sumByKey(tarjetas, 'Limite');
  const totalSaldo = sumByKey(tarjetas, 'Saldo_Actual');
  const totalCupoDisponible = totalLimite - totalSaldo;

  if (totalLimite === 0) return { labels: [], datasets: [] };

  return {
    labels: ['Saldo Utilizado', 'Cupo Disponible'],
    datasets: [{
        data: [totalSaldo, totalCupoDisponible],
        backgroundColor: ['#ef4444', '#10b981'], 
        hoverBackgroundColor: ['#f87171', '#34d399'],
        borderWidth: 2, borderColor: '#020617', hoverOffset: 4,
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
  const sortedCategories = Array.from(categoryMap.entries()).sort(([, amountA], [, amountB]) => amountB - amountA);
  const labels = sortedCategories.map(([category]) => category);
  const data = sortedCategories.map(([, amount]) => amount);

  return {
    labels,
    datasets: [
      {
        label: 'Gasto Total por Categoría',
        data,
        backgroundColor: '#0ea5e9',
        borderColor: '#020617',
        borderWidth: 1,
      },
    ],
  };
};

// ======================================================================
// === COMPONENTE PRINCIPAL ===
// ======================================================================

const TarjetasPage: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<TarjetaRow[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoRow[]>([]);
  const [loading, setLoading] = useState(true); // Usado en JSX
  const [error, setError] = useState<string | null>(null); // Usado en JSX

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
        setError('No pudimos leer las hojas de "Tarjetas" o "Movimientos_Tarjeta".');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // === CÁLCULOS DE KPI Y GRÁFICAS ===
  const totalLimite = sumByKey(tarjetas, 'Limite');
  const totalSaldo = sumByKey(tarjetas, 'Saldo_Actual');
  const totalCupoDisponible = totalLimite - totalSaldo;
  const totalGastosMes = sumByKey(movimientos, 'Monto');
  const porcentajeUtilizado = totalLimite > 0 ? (totalSaldo / totalLimite) * 100 : 0; // USADO en el JSX
  
  const doughnutData = useMemo(() => getDoughnutData(tarjetas), [tarjetas]);
  const barData = useMemo(() => getBarData(movimientos), [movimientos]);

  // === KPIs (Corregido el tipo TS2322) ===
  const cardKpis = [
    { label: 'Límite de crédito total', value: totalLimite, currency: true, id: 'limite-total' },
    { label: 'Saldo total utilizado', value: totalSaldo, currency: true, id: 'saldo-utilizado' },
    { label: 'Cupo disponible total', value: totalCupoDisponible, currency: true, id: 'cupo-disp' },
    { label: 'Gastos del mes', value: totalGastosMes, currency: true, id: 'gastos-mes' },
  ];


  return (
    <Layout>
      <h1 className="page-title">Control de Tarjetas de Crédito</h1>

      {loading && <p>Cargando datos de tarjetas...</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {/* Grid de KPIs */}
      {!loading && <KpiGrid kpis={cardKpis} />} 

      {/* 2. Gráficas de Uso de Cupo y Gastos por Categoría */}
      {!loading && (
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
              ) : (<p>No hay datos de tarjetas para graficar.</p>)}
            </div>
          </div>
          {/* Gráfica de Barra: Gastos por Categoría */}
          <div className="card" style={{ height: 400, padding: 16 }}>
            <div className="card-title">Distribución de Gastos por Categoría</div>
            <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
              {movimientos.length > 0 ? (
                  <Bar data={barData} options={{ maintainAspectRatio: false }} />
              ) : (<p>No hay datos de movimientos para graficar.</p>)}
            </div>
          </div>
        </div>
      )}
      {/* ... (Tu tabla de detalle y pie de página) ... */}
    </Layout>
  );
};

export default TarjetasPage;