// src/components/DateRangeBar.tsx
import React from 'react';

const DateRangeBar: React.FC = () => {
  return (
    <div className="card card--range">
      <div className="card-title">Rango de fechas</div>
      <div className="range-row">
        <div className="range-group">
          <label>Desde</label>
          <input type="date" />
        </div>
        <div className="range-group">
          <label>Hasta</label>
          <input type="date" />
        </div>
        <button className="btn btn-primary">Aplicar</button>
        <button className="btn btn-secondary">Hoy</button>
        <button className="btn btn-ghost">Limpiar rango</button>
      </div>
      <p className="range-hint">
        Todos los indicadores y gráficos responden al rango seleccionado.
      </p>
    </div>
  );
};

export default DateRangeBar;
