// src/components/charts/DonutChart3D.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

type DonutChart3DProps = {
  title?: string;
  data: { name: string; value: number }[];
  dataKey?: string;
  nameKey?: string;
  currency?: boolean;
  percentage?: boolean;
};

const COLORS = ['#0ea5e9', '#22c55e', '#a855f7', '#f97316', '#eab308', '#6366f1'];

const formatValue = (value: number, currency?: boolean, percentage?: boolean) => {
  if (percentage) return `${value.toFixed(1)} %`;
  if (currency) {
    return value.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    });
  }
  return value.toLocaleString('es-CO');
};

const CustomTooltip: React.FC<any> = ({ active, payload, currency, percentage }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];
  const name = item.name ?? item.payload?.name;
  const value = item.value ?? item.payload?.value ?? 0;

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        padding: '8px',
        borderRadius: '6px',
        boxShadow: '0 4px 10px rgba(15,23,42,0.12)',
        fontSize: '11px',
      }}
    >
      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{name}</div>
      <div style={{ color: '#2563eb', fontWeight: 600 }}>
        {formatValue(value, currency, percentage)}
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
  const total = data.reduce((acc, d) => acc + (d.value || 0), 0);

  if (!total) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '13px' }}>
        Sin datos
      </div>
    );
  }

  // Usamos estos datos enriquecidos para la lista (color + porcentaje)
  const enhancedData = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
    percent: total ? (item.value / total) * 100 : 0,
  }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 380,
      }}
    >
      {title && (
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: 12,
          }}
        >
          {title}
        </h3>
      )}

      {/* 🔹 Dona más grande */}
      <div style={{ width: '100%', height: 280, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="45%"
              innerRadius={80}   // antes 70
              outerRadius={120}  // antes 100
              paddingAngle={5}
              isAnimationActive={false}
            >
              {enhancedData.map((item, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={item.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>

            <Tooltip
              content={<CustomTooltip currency={currency} percentage={percentage} />}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Texto en el centro de la dona */}
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>
            Total Ventas
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            {formatValue(total, currency, percentage)}
          </div>
        </div>
      </div>

      {/* 🔹 Lista de productos debajo, en el mismo orden (mayor a menor) */}
      <div style={{ marginTop: 12, width: '100%' }}>
        {enhancedData.map((item) => (
          <div
            key={item.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              padding: '4px 0',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: item.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 600, color: '#0f172a', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                {formatValue(item.value, currency, percentage)}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {item.percent.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart3D;
