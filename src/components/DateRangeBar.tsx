// src/components/DateRangeBar.tsx
import React from 'react';

interface DateRangeBarProps {
  margenHoy: number;
  roasHoy: number;
  ventasHoy: number;
}

const DateRangeBar: React.FC<DateRangeBarProps> = ({
  margenHoy,
  roasHoy,
  ventasHoy,
}) => {
  return (
    <section className="date-range-card">
      {/* HEADER: TÍTULO DE LA APLICACIÓN */}
      <div className="date-range-card__header">
        <div>
          <h1 className="app-title">
            FENNIX EMPORIUM · ADS & COMMERCE HUB
          </h1>
          <p className="app-subtitle">DASHBOARD GENERAL DE RENDIMIENTO</p>
        </div>
      </div>

      {/* FILTROS DE FECHA */}
      <div className="date-range-card__filters">
        <div className="date-range-card__field">
          <label htmlFor="desde" className="date-label">
            Desde
          </label>
          <input id="desde" type="date" className="date-input" />
        </div>

        <div className="date-range-card__field">
          <label htmlFor="hasta" className="date-label">
            Hasta
          </label>
          <input id="hasta" type="date" className="date-input" />
        </div>

        <div className="date-range-card__buttons">
          <button className="btn-primary">Aplicar</button>
          <button className="btn-secondary">Hoy</button>
          <button className="btn-ghost">Limpiar rango</button>
        </div>
      </div>

      {/* TEXTO EXPLICATIVO */}
      <p className="date-range-card__note">
        Todos los indicadores y gráficos responden al rango seleccionado.
      </p>

      {/* KPIS HOY EN TARJETAS DE COLOR */}
      <div className="date-range-card__kpis">
        <div className="kpi-tile kpi-tile--blue">
          <span className="kpi-tile__label">MARGEN BRUTO HOY</span>
          <span className="kpi-tile__value">
            {margenHoy.toFixed(1)}%
          </span>
        </div>

        <div className="kpi-tile kpi-tile--green">
          <span className="kpi-tile__label">ROAS HOY</span>
          <span className="kpi-tile__value">
            {roasHoy.toFixed(2)}x
          </span>
        </div>

        <div className="kpi-tile kpi-tile--orange">
          <span className="kpi-tile__label">VENTAS HOY</span>
          <span className="kpi-tile__value">
            {ventasHoy.toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </section>
  );
};

export default DateRangeBar;
