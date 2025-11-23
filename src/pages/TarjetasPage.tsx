import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
// Eliminamos la importación de kpisMock ya que no se usa en este componente
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ======================================================================
// === HELPERS Y TIPOS DE DATOS (RESTAURADOS) ===
// ======================================================================

// Helper para convertir valores de la hoja a números
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


// ======================================================================
// === LÓGICA DE GRÁFICAS ===
// ======================================================================

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
        backgroundColor: ['#ef4444', '#10b981'], 
        hoverBackgroundColor: ['#f87171', '#34d399'],
        borderWidth: 2,
        borderColor: '#020617',
        hoverOffset: 4,
      },
    ],
  };
};

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

// Opciones de la gráfica de dona (solo para que TypeScript no dé error)
const doughnutOptions: any = { 
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', 
    plugins: {
        legend: { position: 'bottom' as const, labels: { color: '#e5e7eb', boxWidth: 14 } },
    }
};


// ======================================================================
// === COMPONENTE PRINCIPAL ===
// ======================================================================

const TarjetasPage: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<TarjetaRow[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoRow[]>([]);
  const [loading, setLoading] = useState(true); // Restauramos loading para el fetch
  const [error, setError] = useState<string | null>(null); // Restauramos error

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
  const porcentajeUtilizado = totalLimite > 0 ? (totalSaldo / totalLimite) * 100 : 0;
  
  const doughnutData = useMemo(() => getDoughnutData(tarjetas), [tarjetas]);
  const barData = useMemo(() => getBarData(movimientos), [movimientos]);

  // === KPIs (Corregido para coincidir con el tipo esperado por KpiGrid) ===
  const cardKpis = [
    {
      label: 'Límite de crédito total',
      value: totalLimite,
      currency: true,
      id: 'limite-total',
    },
    {
      label: 'Saldo total utilizado',
      value: totalSaldo,
      currency: true,
      id: 'saldo-utilizado',
    },
    {
      label: 'Cupo disponible total',
      value: totalCupoDisponible,
      currency: true,
      id: 'cupo-disp',
    },
    {
      label: 'Gastos del mes',
      value: totalGastosMes,
      currency: true,
      id: 'gastos-mes',
    },
    // Añadimos las propiedades mínimas requeridas: id, label, value, currency
  ];


  return (
    <Layout>
      <h1 className="page-title">Control de Tarjetas de Crédito</h1>

      {/* Grid de KPIs */}
      <KpiGrid kpis={cardKpis} /> 

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginTop: 24 }}>
        
        {/* Gráfica de Dona: Disponibilidad de Cupo */}
        <div className="card" style={{ height: 400, padding: 16 }}>
          <div className="card-title">Disponibilidad de Cupo Global</div>
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {loading ? <p>Cargando gráfica...</p> : (
              tarjetas.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <p>No hay datos de tarjetas para graficar.</p>
              )
            )}
          </div>
        </div>

        {/* Gráfica de Barra: Gastos por Categoría */}
        <div className="card" style={{ height: 400, padding: 16 }}>
          <div className="card-title">Distribución de Gastos por Categoría</div>
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {loading ? <p>Cargando gráfica...</p> : (
              movimientos.length > 0 ? (
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              ) : (
                <p>No hay datos de movimientos para graficar.</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* ... (Tu tabla de detalle y pie de página) ... */}
    </Layout>
  );
};

export default TarjetasPage;