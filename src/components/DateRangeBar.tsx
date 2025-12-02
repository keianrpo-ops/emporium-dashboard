import React, { useState } from 'react';
import './DateRangeBar.css';

interface DateRangeBarProps {
  margenHoy: number;
  roasHoy: number;
  ventasHoy: number;
  totalOrdenes: number;
}

const DateRangeBar: React.FC<DateRangeBarProps> = ({
  margenHoy,
  roasHoy,
  ventasHoy,
  totalOrdenes,
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleApply = () => {
    console.log('Aplicar rango:', startDate, endDate);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="date-range-bar">
      {/* Bloque IZQUIERDO: Rango de fechas */}
      <div className="date-range-left">
        <div className="date-range-header">
          <span className="date-range-title">Rango de fechas</span>
        </div>

        <div className="date-range-input-row">
          <input
            type="date"
            className="date-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="date-separator">—</span>
          <input
            type="date"
            className="date-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button className="btn-primary" onClick={handleApply}>
            APLICAR
          </button>
          <button className="btn-ghost" onClick={handleClear}>
            LIMPIAR
          </button>
        </div>

        <p className="date-range-help">
          Todos los indicadores y gráficos responden al rango seleccionado.
        </p>
      </div>

      {/* Bloque DERECHO: KPIs de hoy / rango */}
      <div className="date-range-kpis">
        <div className="kpi-pill kpi-pill--green">
          <div className="kpi-pill-header">
            <span className="kpi-pill-label">Margen bruto hoy</span>
            <span className="kpi-pill-tag">HOY</span>
          </div>
          <div className="kpi-pill-value">
            {margenHoy.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%
          </div>
        </div>

        <div className="kpi-pill kpi-pill--orange">
          <div className="kpi-pill-header">
            <span className="kpi-pill-label">ROAS hoy</span>
            <span className="kpi-pill-tag">HOY</span>
          </div>
          <div className="kpi-pill-value">
            {roasHoy.toLocaleString('es-CO', { maximumFractionDigits: 2 })}x
          </div>
        </div>

        <div className="kpi-pill kpi-pill--blue">
          <div className="kpi-pill-header">
            <span className="kpi-pill-label">Ventas hoy</span>
            <span className="kpi-pill-tag">HOY</span>
          </div>
          <div className="kpi-pill-value">
            {ventasHoy.toLocaleString('es-CO')}
          </div>
        </div>

        <div className="kpi-pill kpi-pill--slate">
          <div className="kpi-pill-header">
            <span className="kpi-pill-label">Órdenes totales</span>
            <span className="kpi-pill-tag">RANGO</span>
          </div>
          <div className="kpi-pill-value">
            {totalOrdenes.toLocaleString('es-CO')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeBar;
