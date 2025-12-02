// src/components/KpiGauge.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './KpiGauge.css';

interface Props {
  label: string;
  value: number;
  currency?: boolean;
  unit?: string;
  color?: string;
  max?: number;
}

const KpiGauge: React.FC<Props> = ({
  label,
  value,
  currency,
  unit,
  color,
  max,
}) => {
  // 1. Calcular porcentaje visual
  const getVisualPercentage = () => {
    if (max) return (value / max) * 100;
    if (value <= 100 && (!unit || unit === '%')) return value;

    const c = color?.toLowerCase() || '';
    if (c.includes('red') || c === '#ef4444') return 25;
    if (c.includes('orange') || c === '#f97316') return 50;
    if (c.includes('yellow') || c === '#eab308') return 75;
    if (c.includes('green') || c === '#22c55e') return 90;

    return 75;
  };

  const percent = Math.min(Math.max(getVisualPercentage(), 0), 100);

  // 2. Formatear valor
  let formattedValue: string;
  if (currency || (value > 1000 && !unit)) {
    formattedValue = value.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  } else if (unit === '%') {
    formattedValue = `${value.toFixed(1)}%`;
  } else {
    formattedValue = value.toLocaleString('es-CO');
  }

  // 3. Configuración del gráfico
  const data = [
    { name: 'Value', value: percent },
    { name: 'Remaining', value: 100 - percent },
  ];

  const activeColor =
    color ||
    (percent > 80 ? '#22c55e' : percent > 50 ? '#eab308' : '#ef4444');
  const emptyColor = '#f3f4f6';

  const accentColor = activeColor;

  return (
    <div
      className="kpi-card"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <h3 className="kpi-title">{label}</h3>

      <div className="kpi-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Fondo */}
            <Pie
              data={[{ value: 100 }]}
              dataKey="value"
              cx="50%"
              cy="75%"
              startAngle={180}
              endAngle={0}
              innerRadius="58%"
              outerRadius="88%"
              fill={emptyColor}
              stroke="none"
              isAnimationActive={false}
            />
            {/* Arco activo */}
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="75%"
              startAngle={180}
              endAngle={0}
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={0}
              stroke="none"
              animationDuration={900}
              cornerRadius={10}
            >
              <Cell fill={activeColor} />
              <Cell fill="transparent" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="kpi-value-container">
          <span className="kpi-value">{formattedValue}</span>
          {unit && unit !== '%' && (
            <span className="kpi-unit">{unit}</span>
          )}
        </div>
      </div>

      <div className="kpi-legend">
        <span>POOR</span>
        <span>EXCELLENT</span>
      </div>
    </div>
  );
};

export default KpiGauge;
