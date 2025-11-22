// src/pages/DashboardHome.tsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import DateRangeBar from "../components/DateRangeBar";
import KpiGrid from "../components/KpiGrid";
import TopAdsTable from "../components/TopAdsTable";

import { fetchSheet } from "../services/googleSheetsService";
import { formatCurrency } from "../utils/sheetsCalculations";

import { topAdsBySalesMock } from "../mockData"; // Temporal mientras creamos ranking real

const DashboardHome: React.FC = () => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState([
    { title: "Ingreso total (rango)", value: 0 },
    { title: "Costo producto", value: 0 },
    { title: "Costo empaque", value: 0 },
    { title: "Costo envío", value: 0 },
    { title: "Comisiones plataforma", value: 0 },
    { title: "Costo publicidad", value: 0 },
    { title: "Utilidad bruta total", value: 0 },
    { title: "Utilidad neta final", value: 0 },
  ]);

  // ---------------------------------------------------------
  // 🟦 1. Cargar datos reales desde Google Sheets
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSheet("Ventas");
        setVentas(data);

        // ---------------------------------------------------------
        // 🟩 2. Convertir valores numéricos
        // ---------------------------------------------------------
        const toNumber = (v: any) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;

        const ingresoTotal = data.reduce(
          (acc, row) => acc + toNumber(row.Valor_Venta),
          0
        );

        const costoProducto = data.reduce(
          (acc, row) => acc + toNumber(row.Costo_Producto),
          0
        );

        const costoEmpaque = data.reduce(
          (acc, row) => acc + toNumber(row.Costo_Empaque),
          0
        );

        const costoEnvio = data.reduce(
          (acc, row) => acc + toNumber(row.Costo_Envio),
          0
        );

        const costoPublicidad = data.reduce(
          (acc, row) => acc + toNumber(row.Costo_Publicidad),
          0
        );

        const comisiones = data.reduce(
          (acc, row) => acc + toNumber(row.Comisiones_Plataforma),
          0
        );

        const utilidadBruta = ingresoTotal - costoProducto - costoEmpaque;

        const utilidadNeta =
          ingresoTotal -
          (costoProducto +
            costoEmpaque +
            costoEnvio +
            costoPublicidad +
            comisiones);

        // ---------------------------------------------------------
        // 🟦 3. Actualizar KPIs reales
        // ---------------------------------------------------------
        setKpis([
          { title: "Ingreso total (rango)", value: ingresoTotal },
          { title: "Costo producto", value: costoProducto },
          { title: "Costo empaque", value: costoEmpaque },
          { title: "Costo envío", value: costoEnvio },
          { title: "Comisiones plataforma", value: comisiones },
          { title: "Costo publicidad", value: costoPublicidad },
          { title: "Utilidad bruta total", value: utilidadBruta },
          { title: "Utilidad neta final", value: utilidadNeta },
        ]);
      } catch (err) {
        console.error(err);
        setError("No fue posible leer la hoja 'Ventas'.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ---------------------------------------------------------
  // 🟦 4. Formatear KPIs para el componente (tu KpiGrid lo necesita así)
  // ---------------------------------------------------------
  const formattedKpis = kpis.map((k) => ({
    ...k,
    value: formatCurrency(k.value),
  }));

  return (
    <Layout>
      <DateRangeBar />

      {/* KPIs reales */}
      <KpiGrid kpis={formattedKpis} />

      {/* Indicadores extra */}
      <div className="grid-2">
        <div className="card card--placeholder">
          <div className="card-title">Estructura de costos vs utilidad</div>
          <p>Aún no hay datos para graficar (conectaremos después).</p>
        </div>

        <div className="card card--placeholder">
          <div className="card-title">Indicadores clave</div>
          <p>Margen bruto, margen neto y peso de la publicidad sobre el ingreso.</p>
        </div>
      </div>

      {/* Tabla mock mientras conecto los anuncios reales */}
      <TopAdsTable title="Top 10 anuncios por ventas" rows={topAdsBySalesMock} />

      {/* Estado del sistema */}
      <div style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        {loading && <span>Cargando datos en tiempo real...</span>}
        {error && <span style={{ color: "#ff6b6b" }}>{error}</span>}
        {!loading && !error && (
          <span>
            Fuente: {ventas.length} filas leídas desde la hoja <b>"Ventas"</b>.
          </span>
        )}
      </div>
    </Layout>
  );
};

export default DashboardHome;
