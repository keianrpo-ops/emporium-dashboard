import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { fetchSheet } from '../services/googleSheetsService';
import VentasChartsGrid from '../components/VentasChartsGrid';
import type { VentaRow } from '../components/VentasChartsGrid';
import DonutChart3D from '../components/charts/DonutChart3D';

// --- UTILIDADES ---
const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[\s$]/g, '').replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

// --- LÓGICA MEJORADA: TOP 5 + OTROS ---
const getTopProductsData = (ventas: VentaRow[]) => {
  const acc: Record<string, number> = {};
  let totalGeneral = 0;

  ventas.forEach((v) => {
    const producto = (v.Producto || 'Sin Producto') as string;
    const valor = toNumber(v.Valor_Venta);
    acc[producto] = (acc[producto] || 0) + valor;
    totalGeneral += valor;
  });

  const sorted = Object.entries(acc).sort((a, b) => b[1] - a[1]);
  const top5 = sorted.slice(0, 5).map(([name, value]) => ({ name, value }));

  const top5Total = top5.reduce((sum, item) => sum + item.value, 0);
  const otrosTotal = totalGeneral - top5Total;

  if (otrosTotal > 0) {
    top5.push({ name: 'Otros', value: otrosTotal });
  }

  return top5;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const VentasPage: React.FC = () => {
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredVentas = useMemo(() => {
    if (!startDate && !endDate) return ventas;
    return ventas.filter((v) => {
      const ventaDate = new Date(v.Fecha || '');
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-01-01');
      end.setHours(23, 59, 59, 999);
      return ventaDate >= start && ventaDate <= end;
    });
  }, [ventas, startDate, endDate]);

  const totalIngresos = filteredVentas.reduce((acc, v) => acc + toNumber(v.Valor_Venta), 0);
  const numVentas = filteredVentas.length;
  const ticketPromedio = numVentas > 0 ? totalIngresos / numVentas : 0;
  const topProductsData = getTopProductsData(filteredVentas);

  // ESTILOS EN LÍNEA
  const cardStyle = {
    borderRadius: '8px',
    padding: '16px',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '90px',
  } as const;

  return (
    <Layout>
      {/* CONTENEDOR PRINCIPAL: overflowX: hidden para evitar scroll horizontal en la página */}
      <div
        style={{
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          padding: '16px',
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* HEADER Y FILTROS */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
              Ventas Dashboard
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '12px' }}>Resumen de rendimiento</p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              background: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              alignItems: 'center',
            }}
          >
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: 'bold', fontSize: '12px' }}
            />
            <span style={{ color: '#94a3b8' }}>-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: 'bold', fontSize: '12px' }}
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                style={{
                  color: '#ef4444',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '10px',
                  marginLeft: '4px',
                }}
              >
                BORRAR
              </button>
            )}
          </div>
        </div>

        {/* 1. SECCIÓN DE KPIS (4 Columnas fijas) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            width: '100%',
          }}
        >
          <div style={{ ...cardStyle, backgroundColor: '#f97316' }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.9, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Ingreso Total
              </p>
              <p style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0 0 0', whiteSpace: 'nowrap' }}>
                {formatCurrency(totalIngresos)}
              </p>
            </div>
            <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
              💰
            </div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#3b82f6' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.9, margin: 0 }}>
                Transacciones
              </p>
              <p style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0 0 0' }}>
                {numVentas}
              </p>
            </div>
            <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
              🛒
            </div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#10b981' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.9, margin: 0 }}>
                Ticket Promedio
              </p>
              <p style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0 0 0' }}>
                {formatCurrency(ticketPromedio)}
              </p>
            </div>
            <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
              🧾
            </div>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#8b5cf6' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.9, margin: 0 }}>
                Meta Mensual
              </p>
              <p style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0 0 0' }}>
                85%
              </p>
            </div>
            <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
              🎯
            </div>
          </div>
        </div>

        {/* 2. GRÁFICOS (Lado a lado estrictamente) */}
        {!loading && filteredVentas.length > 0 && (
          <div
            style={{
              display: 'grid',
              // Aquí definimos proporciones: 3 partes para el principal, 1 para el top
              gridTemplateColumns: '3fr 1fr', 
              gap: '16px',
              width: '100%',
              alignItems: 'stretch',
            }}
          >
            {/* Gráficos Generales */}
            <div
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                minWidth: 0, // Crucial para que el contenido no desborde el grid
              }}
            >
              <VentasChartsGrid ventas={filteredVentas} />
            </div>

            {/* Top Productos */}
            <div
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                minWidth: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <DonutChart3D title="Top Productos" data={topProductsData} currency={true} />
            </div>
          </div>
        )}

        {/* 3. TABLA COMPLETA (Compacta y con scroll interno) */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            flex: 1, // Ocupa el espacio restante
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
              Detalle de Ventas ({filteredVentas.length})
            </h3>
          </div>

          {/* Contenedor con overflow-x auto para que SÓLO la tabla tenga scroll */}
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11px',
                textAlign: 'left',
                whiteSpace: 'nowrap', // Evita que el texto se rompa en varias líneas
              }}
            >
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '8px 12px' }}>Fecha</th>
                  <th style={{ padding: '8px 12px' }}>Producto</th>
                  <th style={{ padding: '8px 12px' }}>ID Anuncio</th>
                  <th style={{ padding: '8px 12px' }}>Campaña</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Cant.</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Envío</th>
                  <th style={{ padding: '8px 12px' }}>Cliente</th>
                  <th style={{ padding: '8px 12px' }}>Email</th>
                  <th style={{ padding: '8px 12px' }}>Teléfono</th>
                  <th style={{ padding: '8px 12px' }}>Ciudad</th>
                  <th style={{ padding: '8px 12px' }}>Dirección</th>
                  <th style={{ padding: '8px 12px' }}>Transp.</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVentas.slice(0, 100).map((row: any, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc',
                    }}
                  >
                    <td style={{ padding: '8px 12px', color: '#475569' }}>
                      {row.Fecha ? row.Fecha.toString().substring(0, 10) : '-'}
                    </td>
                    <td
                      style={{ padding: '8px 12px', fontWeight: 'bold', color: '#334155', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      title={row.Producto}
                    >
                      {row.Producto}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>{row.ID_Anuncio || '-'}</td>
                    <td style={{ padding: '8px 12px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.Nombre_Campaña || '-'}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{row.Cantidad}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>
                      {toNumber(row.Valor_Venta).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#ef4444' }}>
                      {toNumber(row.Costo_Envío).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: '8px 12px' }}>{row.Nombre_Cliente || row.Cliente}</td>
                    <td style={{ padding: '8px 12px', color: '#3b82f6', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.Email_Cliente}>
                      {row.Email_Cliente || '-'}
                    </td>
                    <td style={{ padding: '8px 12px' }}>{row.Telefono || '-'}</td>
                    <td style={{ padding: '8px 12px' }}>{row.Ciudad || '-'}</td>
                    <td style={{ padding: '8px 12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.Dirección_1}>
                      {row.Dirección_1 || '-'}
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                      {row.Transportadora_Dropi || '-'}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span
                        style={{
                          backgroundColor: row.EstadoLogistico_Dropi === 'ENTREGADO' ? '#dcfce7' : '#f1f5f9',
                          color: row.EstadoLogistico_Dropi === 'ENTREGADO' ? '#166534' : '#475569',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        {row.EstadoLogistico_Dropi || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VentasPage;