// src/pages/dashboard/DashboardHome.tsx
import React, { useEffect, useState } from 'react';

import Layout from '../../components/Layout';
import DateRangeBar from '../../components/DateRangeBar';
import KpiGrid from '../../components/KpiGrid';
import TopAdsTable from '../../components/TopAdsTable';
import { fetchSheet } from '../../services/googleSheetsService';

// Aún usamos algunos mocks (por ejemplo para la tabla de anuncios)
import { kpisMock, topAdsBySalesMock } from '../../mockData';

// ========= TIPOS DE DATOS =========

// Fila de la hoja "Ventas"
type VentaRow = {
  [key: string]: any;
  Valor_Venta?: string | number;       // P
  Costo_Proveedor?: string | number;   // Q
  Costo_Envio?: string | number;       // R
  Costo_CPA?: string | number;         // S
  Costo_de_Venta?: string | number;    // T
  Costo_Producto?: string | number;    // U (si algún día lo guardas)
  Utilidad?: string | number;          // V
};

// Fila de la hoja "Costos_Fijos"
type CostosFijosRow = {
  [key: string]: any;
  Monto_Mensual?: string | number;     // D
};

// ========= HELPERS =========

// Convierte "220.000", "$450.000", etc. a number
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value
      .replace(/[\s$]/g, '') // quita espacios y símbolo $
      .replace(/\./g, '')    // quita separador de miles
      .replace(',', '.');    // cambia coma por punto

    const n = Number(normalized);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

// Suma genérica para cualquier tipo de fila
const sumByKey = <T extends Record<string, any>>(
  rows: T[],
  key: keyof T
): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);

// Normaliza el formato que devuelve Apps Script
const getRows = <T extends Record<string, any>>(data: any): T[] => {
  if (Array.isArray(data?.rows)) return data.rows as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
};

// ========= COMPONENTE =========

const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostosFijosRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Leemos Ventas y Costos_Fijos al tiempo
        const [ventasData, costosFijosData] = await Promise.all([
          fetchSheet('Ventas'),
          fetchSheet('Costos_Fijos'),
        ]);

        const ventasRows = getRows<VentaRow>(ventasData);
        const costosFijosRows = getRows<CostosFijosRow>(costosFijosData);

        setVentas(ventasRows);
        setCostosFijos(costosFijosRows);
      } catch (e) {
        console.error(e);
        setError('No pudimos leer los datos de Google Sheets.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // === SUMAS REALES (VENTAS) ===
  const ingresoTotal = sumByKey<VentaRow>(ventas, 'Valor_Venta');
  const costoProveedor = sumByKey<VentaRow>(ventas, 'Costo_Proveedor');
  const costoEnvio = sumByKey<VentaRow>(ventas, 'Costo_Envio');
  const costoPublicidad = sumByKey<VentaRow>(ventas, 'Costo_CPA');
  const comisionesPlata = sumByKey<VentaRow>(ventas, 'Costo_de_Venta');
  const utilidadTotal = sumByKey<VentaRow>(ventas, 'Utilidad');

  // === SUMA COSTOS FIJOS ===
  const totalCostosFijos = sumByKey<CostosFijosRow>(
    costosFijos,
    'Monto_Mensual'
  );

  // Utilidad neta = utilidad bruta - costos fijos
  const utilidadNeta = utilidadTotal - totalCostosFijos;

  // === KPIs DEL DASHBOARD ===
  const kpis = [
    {
      ...kpisMock[0],
      label: 'Ingreso total (rango)',
      value: ingresoTotal,
      currency: true,
    },
    {
      ...kpisMock[1],
      label: 'Costo producto (proveedor)',
      value: costoProveedor,
      currency: true,
    },
    {
      ...kpisMock[2],
      label: 'Costo envío',
      value: costoEnvio,
      currency: true,
    },
    {
      ...kpisMock[3],
      label: 'Comisiones plataforma',
      value: comisionesPlata,
      currency: true,
    },
    {
      ...kpisMock[4],
      label: 'Costo publicidad (CPA)',
      value: costoPublicidad,
      currency: true,
    },
    {
      ...kpisMock[5],
      label: 'Utilidad bruta total',
      value: utilidadTotal,
      currency: true,
    },
    {
      ...kpisMock[6],
      label: 'Utilidad neta final',
      value: utilidadNeta,
      currency: true,
    },
    {
      ...kpisMock[7],
      label: 'Costos fijos mensuales',
      value: totalCostosFijos,
      currency: true,
    },
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
            Margen bruto, margen neto, peso de la publicidad sobre el ingreso y
            carga de costos fijos.
          </p>
        </div>
      </div>

      <TopAdsTable
        title="Top 10 anuncios por ventas"
        rows={topAdsBySalesMock} // después podemos conectarlo también a Sheets
      />

      <div style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        {loading && <span>Actualizando datos desde Google Sheets...</span>}
        {error && <span style={{ color: '#f87171' }}>{error}</span>}
        {!loading && !error && (
          <span>
            Fuente: {ventas.length} filas en <b>"Ventas"</b> y{' '}
            {costosFijos.length} filas en <b>"Costos_Fijos"</b>.
          </span>
        )}
      </div>
    </Layout>
  );
};

export default DashboardHome;
