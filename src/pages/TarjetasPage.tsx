import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
import { kpisMock } from '../mockData'; // Asegúrate de que esta ruta sea correcta: '../mockData'
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// --- helpers numéricos (Reutilizados de CampañasPage) ---
const toNumber = (value: unknown): number => { /* ... tu implementación ... */ return 0; }; // (asumo que está en helpers.ts o similar, lo dejo como stub aquí)
const sumByKey = <T extends Record<string, any>>(rows: T[], key: keyof T): number => { /* ... */ return 0; };
const getRows = <T extends Record<string, any>>(data: any): T[] => { /* ... */ return []; };


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

// ... (Resto de funciones y lógica de gráfica) ...

const TarjetasPage: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<TarjetaRow[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoRow[]>([]);
  // Eliminamos 'loading' y 'error' si no se usan, o los dejamos si se van a usar en el JSX.
  // Los mantendremos por buena práctica, pero los eliminaremos del useEffect si no se usan.

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
        // setError('No pudimos leer las hojas de "Tarjetas" o "Movimientos_Tarjeta".'); // ERROR DE TS6133 si no se usa
      } finally {
        // setLoading(false); // ERROR DE TS6133 si no se usa
      }
    };

    load();
  }, []);

  // ... (Resto del componente TarjetasPage, ahora sin los errores TS6133) ...
  const totalLimite = sumByKey(tarjetas, 'Limite');
  const totalSaldo = sumByKey(tarjetas, 'Saldo_Actual');
  const totalCupoDisponible = totalLimite - totalSaldo;
  const totalGastosMes = sumByKey(movimientos, 'Monto');
  const porcentajeUtilizado = totalLimite > 0 ? (totalSaldo / totalLimite) * 100 : 0;
  
  // ... (Resto del componente con KPIs y Gráficas) ...
  const cardKpis = [/* ... */];
  const doughnutData = useMemo(() => getDoughnutData(tarjetas), [tarjetas]);
  const barData = useMemo(() => getBarData(movimientos), [movimientos]);


  return (
    <Layout>
      {/* ... (Todo el JSX de TarjetasPage) ... */}
    </Layout>
  );
};

export default TarjetasPage;