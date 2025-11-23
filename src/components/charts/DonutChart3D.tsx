// src/components/charts/DonutChart3D.tsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type DonutChart3DProps = {
  title?: string;
  data: { name: string; value: number }[];
  dataKey?: string;
  nameKey?: string;
  currency?: boolean;
  percentage?: boolean;
};

const COLORS = [
  '#22d3ee', // cian
  '#4ade80', // verde
  '#a855f7', // morado
  '#f97316', // naranja
  '#fde047', // amarillo
  '#38bdf8', // azul claro
];

const formatValue = (value: number, currency?: boolean, percentage?: boolean) => {
  if (percentage) return `${value.toFixed(1)} %`;
  if (currency) return `$ ${value.toLocaleString('es-CO')}`;
  return value.toLocaleString('es-CO');
};

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  currency?: boolean;
  percentage?: boolean;
}> = ({ active, payload, currency, percentage }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div
      style={{
        background: '#020617',
        border: '1px solid rgba(148,163,184,0.5)',
        padding: '8px 10px',
        borderRadius: 8,
        boxShadow: '0 8px 18px rgba(0,0,0,0.6)',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
      <div style={{ opacity: 0.9 }}>
        {formatValue(item.value, currency, percentage)}
      </div>
    </div>
  );
};

const DonutChart3D: React.FC<DonutChart3DProps> = ({
  title,
  data,
  dataKey = 'value',
  nameKey = 'name',
  currency,
  percentage,
}) => {
  const gradientId = `donut-grad-${title || 'chart'}`.replace(/\s+/g, '');

  const total = data.reduce((acc, d) => acc + (d.value || 0), 0);
  if (!total) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 8px' }}>
        <p style={{ fontSize: 13, opacity: 0.7 }}>
          Aún no hay datos para este gráfico.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        background:
          'radial-gradient(circle at top, rgba(148,163,184,0.18), transparent 55%) #020617',
        borderRadius: 18,
        boxShadow: '0 18px 35px rgba(15,23,42,0.9)',
      }}
    >
      {title && (
        <h3
          style={{
            margin: 0,
            marginBottom: 12,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 0.3,
          }}
        >
          {title}
        </h3>
      )}

      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <PieChart
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            style={{
              filter:
                'drop-shadow(0 10px 20px rgba(15,23,42,1)) drop-shadow(0 -4px 6px rgba(148,163,184,0.25))',
            }}
          >
            <defs>
              <radialGradient id={gradientId} cx="50%" cy="30%" r="65%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="45%" stopColor="rgba(248,250,252,0.05)" />
                <stop offset="100%" stopColor="rgba(15,23,42,1)" />
              </radialGradient>
            </defs>

            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius="55%"
              outerRadius="80%"
              stroke={`url(#${gradientId})`}
              strokeWidth={2}
              paddingAngle={2}
              startAngle={90}
              endAngle={450}
              isAnimationActive
              animationDuration={900}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    filter:
                      'drop-shadow(0 4px 8px rgba(15,23,42,0.9)) drop-shadow(0 -2px 4px rgba(148,163,184,0.25))',
                  }}
                />
              ))}
            </Pie>

            <Tooltip
              content={
                <CustomTooltip currency={currency} percentage={percentage} />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          opacity: 0.6,
          textAlign: 'center',
        }}
      >
        Total: {formatValue(total, currency, percentage)}
      </div>
    </div>
  );
};

export default DonutChart3D;
