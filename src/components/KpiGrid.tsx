// src/components/KpiGrid.tsx
import React from 'react';

interface KpiCard {
  id: string;
  label: string;
  value: number;
  currency?: boolean;
  unit?: string;      // %, x, etc.
  color?: string;     // color principal del valor
}

interface KpiGridProps {
  kpis: KpiCard[];
}

const formatValue = (kpi: KpiCard) => {
  const v = Number(kpi.value) || 0;

  if (kpi.currency) {
    return `$ ${v.toLocaleString('es-CO')}`;
  }

  if (kpi.unit === '%') {
    return `${v.toFixed(1)} %`;
  }

  if (kpi.unit === 'x') {
    return `${v.toFixed(2)}x`;
  }

  return v.toLocaleString('es-CO');
};

const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  return (
    <div className="kpi-grid">
      {kpis.map((kpi) => {
        const valueNumber = Number(kpi.value) || 0;

        // “relleno” del gauge: si no tienes porcentaje, simplemente 100%
        const gaugeFill =
          kpi.unit === '%' ? Math.max(0, Math.min(100, valueNumber)) : 100;

        return (
          <div key={kpi.id} className="kpi-card">
            <p className="kpi-card-label">{kpi.label}</p>

            <h2
              className="kpi-card-value"
              style={{ color: kpi.color || '#0f172a' }}
            >
              {formatValue(kpi)}
            </h2>

            <div className="kpi-gauge">
              <div
                className="kpi-gauge-fill"
                style={{ width: `${gaugeFill}%` }}
              />
            </div>

            {kpi.unit && !kpi.currency && (
              <span className="kpi-card-unit">{kpi.unit}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KpiGrid;
