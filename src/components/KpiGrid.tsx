// src/components/KpiGrid.tsx
import React from 'react';
import { Kpi } from '../types';

interface Props {
  kpis: Kpi[];
}

const formatCurrency = (value: number) =>
  '$ ' + value.toLocaleString('es-CO', { maximumFractionDigits: 0 });

const KpiGrid: React.FC<Props> = ({ kpis }) => {
  return (
    <div className="kpi-grid">
      {kpis.map((kpi) => (
        <div key={kpi.id} className="card card--kpi">
          <div className="card-label">{kpi.label}</div>
          <div className="card-value">
            {kpi.currency ? formatCurrency(kpi.value) : kpi.value}
          </div>
          <div className="kpi-progress">
            <div className="kpi-progress-bar" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiGrid;
