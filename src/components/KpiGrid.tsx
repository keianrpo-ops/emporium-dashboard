// src/components/KpiGrid.tsx
import React from 'react';
import KpiGauge from './KpiGauge';

interface KpiCard {
  id: string;
  label: string;
  value: number;
  color?: string;
  currency?: boolean;
  unit?: string;
  max?: number;
}

interface KpiGridProps {
  kpis: KpiCard[];
}

const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  return (
    <div
      className="kpi-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '20px',
        marginTop: '24px',
      }}
    >
      {kpis.map((kpi) => (
        <div key={kpi.id}>
          <KpiGauge
            label={kpi.label}
            value={kpi.value}
            color={kpi.color}
            currency={kpi.currency}
            unit={kpi.unit}
            max={kpi.max}
          />
        </div>
      ))}
    </div>
  );
};

export default KpiGrid;
