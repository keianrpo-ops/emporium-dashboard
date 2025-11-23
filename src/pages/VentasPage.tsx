// src/pages/VentasPage.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
import { kpisMock } from '../mockData';
import VentasChartsGrid from '../components/VentasChartsGrid';
import type { VentaRow } from '../components/VentasChartsGrid';

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

const VentasPage: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSheet('Ventas');
        const rows = Array.isArray((data as any)?.rows)
          ? ((data as any).rows as VentaRow[])
          : [];
        setVentas(rows);
      } catch (e) {
        console.error(e);
        setError('No pudimos leer la hoja "Ventas" desde Google Sheets.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ===== KPIs de ventas =====
  const totalIngresos = ventas.reduce(
    (acc, v) => acc + toNumber(v.Valor_Venta),
    0,
  );
  const numVentas = ventas.length;

  const kpis = [
    {
      ...kpisMock[0],
      label: 'Ingreso total (rango)',
      value: totalIngresos,
      currency: true,
    },
    {
      ...kpisMock[1],
      label: 'Costo publicidad (CPA)',
      value: 88000, // de momento fijo, luego lo conectamos con tu lógica
      currency: true,
    },
    {
      ...kpisMock[2],
      label: 'N° de ventas',
      value: numVentas,
      currency: false,
    },
  ];

  return (
    <Layout>
      <h1 className="page-title">Ventas</h1>

      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Listado de ventas provenientes de la hoja <b>"Ventas"</b> de Google
        Sheets. Más adelante agregaremos filtros por fechas, producto, ciudad,
        etc.
      </p>

      {/* KPIs */}
      <KpiGrid kpis={kpis} />

      {/* Gráficas (donas + barras) */}
      {!loading && !error && ventas.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <VentasChartsGrid ventas={ventas} />
        </div>
      )}

      {/* Tabla de detalle */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">Detalle de ventas</div>

        {loading && <p>Cargando datos desde Google Sheets…</p>}

        {error && (
          <p style={{ color: '#f87171', fontSize: 13 }}>
            {error}
          </p>
        )}

        {!loading && !error && ventas.length === 0 && (
          <p>No hay ventas registradas aún.</p>
        )}

        {!loading && !error && ventas.length > 0 && (
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table className="data-table data-table--compact">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>ID Venta</th>
                  <th>Pedido Shopify</th>
                  <th>Canal</th>
                  <th>Plataforma Ads</th>
                  <th>ID Anuncio</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Valor venta</th>
                  <th>Método pago</th>
                  <th>Ciudad</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((row, i) => (
                  <tr key={i}>
                    <td>{row.Fecha}</td>
                    <td>{row.ID_Venta}</td>
                    <td>{(row as any).ID_Pedido_Shopify}</td>
                    <td>{(row as any).Canal_Venta}</td>
                    <td>{(row as any).Plataforma_Ads}</td>
                    <td>{(row as any).ID_Anuncio}</td>
                    <td>{row.Producto}</td>
                    <td>{row.Cantidad}</td>
                    <td>
                      $
                      {toNumber(row.Valor_Venta).toLocaleString('es-CO')}
                    </td>
                    <td>{row.Metodo_Pago}</td>
                    <td>{(row as any).Ciudad}</td>
                    <td>{(row as any).Cliente}</td>
                    <td>{(row as any).Telefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && ventas.length > 0 && (
          <p className="card-footnote">
            Fuente: {ventas.length} filas leídas desde la hoja{' '}
            <b>"Ventas"</b>.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default VentasPage;
