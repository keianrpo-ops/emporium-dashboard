// src/pages/VentasPage.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';

type VentaRow = {
  [key: string]: any;
  Fecha?: string;
  ID_Venta?: string;
  Producto?: string;
  Cantidad?: number | string;
  Valor_Venta?: number | string;
  Metodo_Pago?: string;
};

const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string')
    return Number(value.replace(/\./g, '').replace(/,/g, '.')) || 0;
  return 0;
};

const VentasPage: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSheet('Ventas');
        const rows = Array.isArray((data as any)?.rows)
          ? (data as any).rows
          : [];
        setVentas(rows);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Layout>
      <h1 className="page-title">Ventas</h1>

      {loading && <p>Cargando datos desde Google Sheets...</p>}

      {!loading && ventas.length === 0 && (
        <p>No hay ventas registradas aún.</p>
      )}

      {!loading && ventas.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>ID Venta</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Valor Venta</th>
              <th>Método de Pago</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((row, i) => (
              <tr key={i}>
                <td>{row.Fecha}</td>
                <td>{row.ID_Venta}</td>
                <td>{row.Producto}</td>
                <td>{row.Cantidad}</td>
                <td>${toNumber(row.Valor_Venta).toLocaleString()}</td>
                <td>{row.Metodo_Pago}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default VentasPage;
