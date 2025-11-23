// src/pages/VentasPage.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
import { kpisMock } from '../mockData';

type VentaRow = {
  [key: string]: any;
  Fecha?: string;
  ID_Venta?: string;
  ID_Pedido_Shopify?: string;
  Canal_Venta?: string;
  Plataforma_Ads?: string;
  ID_Anuncio?: string;
  ID_Campaña_Ads?: string;
  Nombre_Anuncio?: string;
  Nombre_Campaña?: string;
  ID_Producto?: string;
  Producto?: string;
  Cantidad?: number | string;
  Precio_Unitario?: number | string;
  Descuento?: number | string;
  Valor_Venta?: number | string;
  Costo_Proveedor?: number | string;
  Costo_Envio?: number | string;
  Costo_CPA?: number | string;
  Costo_de_Venta?: number | string;
  Costo_Producto?: number | string;
  Utilidad?: number | string;
  Metodo_Pago?: string;
  País?: string;
  Ciudad?: string;
  Nombre_Cliente?: string;
  Email_Cliente?: string;
  Teléfono?: string;
  Dirección?: string;
  Dirección_Envio?: string;
};

// === helpers numéricos ===
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value
      .replace(/[\s$]/g, '') // quita espacios y $
      .replace(/\./g, '') // puntos de miles
      .replace(',', '.'); // coma decimal -> punto

    const n = Number(normalized);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

const sumByKey = (rows: VentaRow[], key: keyof VentaRow): number =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);

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
          : Array.isArray(data)
          ? (data as VentaRow[])
          : [];

        setVentas(rows);
      } catch (e) {
        console.error(e);
        setError('No pudimos leer la hoja "Ventas".');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ===== KPIs de la página de Ventas =====
  const totalIngreso = sumByKey(ventas, 'Valor_Venta');
  const totalCostoCPA = sumByKey(ventas, 'Costo_CPA');
  const totalCostoProducto = sumByKey(ventas, 'Costo_Producto');
  const utilidadNeta = sumByKey(ventas, 'Utilidad');
  const numeroVentas = ventas.length;

  const kpis = [
    {
      ...kpisMock[0],
      label: 'Ingreso total (rango)',
      value: totalIngreso,
      currency: true,
    },
    {
      ...kpisMock[1],
      label: 'Costo publicidad (CPA)',
      value: totalCostoCPA,
      currency: true,
    },
    {
      ...kpisMock[2],
      label: 'Costo productos',
      value: totalCostoProducto,
      currency: true,
    },
    {
      ...kpisMock[3],
      label: 'Utilidad neta',
      value: utilidadNeta,
      currency: true,
    },
    {
      ...kpisMock[4],
      label: 'Nº de ventas',
      value: numeroVentas,
      currency: false,
    },
  ];

  return (
    <Layout>
      <h1 className="page-title">Ventas</h1>

      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Listado de ventas provenientes de la hoja <b>“Ventas”</b> de Google
        Sheets. Más adelante aquí mismo podremos filtrar por fechas, canal,
        ciudad, cliente, etc.
      </p>

      {/* KPIs arriba */}
      <KpiGrid kpis={kpis} />

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">Detalle de ventas</div>

        {loading && <p>Cargando datos desde Google Sheets…</p>}

        {error && (
          <p style={{ color: '#f87171' }}>
            {error}
          </p>
        )}

        {!loading && !error && ventas.length === 0 && (
          <p>No hay ventas registradas aún.</p>
        )}

        {!loading && !error && ventas.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>ID Venta</th>
                  <th>Pedido Shopify</th>
                  <th>Canal</th>
                  <th>Plataforma Ads</th>
                  <th>ID Anuncio</th>
                  <th>Nombre anuncio</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Valor venta</th>
                  <th>Costo CPA</th>
                  <th>Costo producto</th>
                  <th>Utilidad</th>
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
                    <td>{row.ID_Pedido_Shopify}</td>
                    <td>{row.Canal_Venta}</td>
                    <td>{row.Plataforma_Ads}</td>
                    <td>{row.ID_Anuncio}</td>
                    <td>{row.Nombre_Anuncio}</td>
                    <td>{row.Producto}</td>
                    <td>{row.Cantidad}</td>
                    <td>${toNumber(row.Valor_Venta).toLocaleString('es-CO')}</td>
                    <td>${toNumber(row.Costo_CPA).toLocaleString('es-CO')}</td>
                    <td>${toNumber(row.Costo_Producto).toLocaleString('es-CO')}</td>
                    <td>${toNumber(row.Utilidad).toLocaleString('es-CO')}</td>
                    <td>{row.Metodo_Pago}</td>
                    <td>{row.Ciudad}</td>
                    <td>{row.Nombre_Cliente}</td>
                    <td>{row.Teléfono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && ventas.length > 0 && (
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            Fuente: {ventas.length} filas leídas desde la hoja <b>“Ventas”</b>.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default VentasPage;
