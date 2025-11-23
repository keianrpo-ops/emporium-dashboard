// src/pages/VentasPage.tsx (VERSIÓN CON GRÁFICAS)
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import KpiGrid from '../components/KpiGrid';
import { kpisMock } from '../mockData';
import VentasChartsGrid from '../components/VentasChartsGrid';
import type { VentaRow } from '../components/VentasChartsGrid';
import DonutChart3D from '../components/charts/DonutChart3D';

// Helper para convertir valores de la hoja a números
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

// Extracción de datos para una gráfica específica (Ejemplo: Top 5 Productos)
const getTopProductsData = (ventas: VentaRow[]) => {
  const acc: Record<string, number> = {};
  ventas.forEach((v) => {
    const producto = (v.Producto || 'Sin Producto') as string;
    acc[producto] = (acc[producto] || 0) + toNumber(v.Valor_Venta);
  });

  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Top 5
    .map(([name, value]) => ({ name, value }));
};


const VentasPage: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSheet('Ventas');
        // Tu backend devuelve { rows: [...] } - nos aseguramos de manejar la respuesta
        const rows = Array.isArray((data as any)?.rows)
          ? ((data as any).rows as VentaRow[])
          : Array.isArray(data) ? (data as VentaRow[]) : []; 

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
  
  // Gráfica de Top Productos
  const topProductsData = getTopProductsData(ventas);

  const kpis = [
    {
      ...kpisMock[0],
      label: 'Ingreso total',
      value: totalIngresos,
      currency: true,
    },
    // ... (Mantener o agregar otros KPIs si es necesario)
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

      <KpiGrid kpis={kpis} />

      {/* Gráficas */}
      {!loading && !error && ventas.length > 0 && (
        <div 
          // Creamos una grilla de 4 columnas para el layout profesional
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 24, 
            marginTop: 24 
          }}
        >
          {/* Gráfica 1: Top Productos (Donut 3D) - Usa Recharts */}
          <DonutChart3D 
            title="Top 5 Productos por Ingreso"
            data={topProductsData}
            currency={true}
          />
          
          {/* Gráfica 2, 3 y 4: Las donas y barras existentes de VentasChartsGrid */}
          <div style={{ gridColumn: 'span 3' }}>
            <VentasChartsGrid ventas={ventas} />
          </div>
          
        </div>
      )}

      {/* Tabla de detalle */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">Detalle de ventas</div>

        {/* ... (Tu lógica de carga y tabla) ... */}
        
        {loading && <p>Cargando datos desde Google Sheets…</p>}

        {/* ... (Resto de la tabla y footer) ... */}
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
                  {/* Asegúrate de que los encabezados de la tabla coincidan con las columnas de tu hoja */}
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
                      ${toNumber(row.Valor_Venta).toLocaleString('es-CO')}
                    </td>
                    <td>{row.Metodo_Pago}</td>
                    <td>{(row as any).Ciudad}</td>
                    <td>{(row as any).Nombre_Cliente}</td> {/* Usamos Nombre_Cliente */}
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