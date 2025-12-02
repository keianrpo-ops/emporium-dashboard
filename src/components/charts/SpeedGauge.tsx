// src/components/SpeedGauge.tsx
import React from 'react';
import './SpeedGauge.css';

interface SpeedGaugeProps {
  /** Porcentaje 0–100 */
  percent: number;
  /** Color principal de la aguja y borde */
  color?: string;
  /** Texto pequeño debajo (opcional) */
  labelMin?: string;
  labelMid?: string;
  labelMax?: string;
}

const clampPercent = (v: number) => Math.max(0, Math.min(100, v));

const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  percent,
  color = '#06b6d4',
  labelMin = '0%',
  labelMid = '50%',
  labelMax = '100%',
}) => {
  const p = clampPercent(percent);
  // -90° extremo izquierdo, +90° extremo derecho
  const angle = -90 + (p / 100) * 180;

  return (
    <div className="speed-gauge">
      <div className="speed-gauge__dial">
        {/* Semicírculo de fondo */}
        <div className="speed-gauge__arc" />

        {/* Aguja */}
        <div
          className="speed-gauge__needle"
          style={{ transform: `rotate(${angle}deg)`, backgroundColor: color }}
        />

        {/* Centro */}
        <div
          className="speed-gauge__center"
          style={{ borderColor: color }}
        />
      </div>

      {/* Escala de referencia */}
      <div className="speed-gauge__scale">
        <span>{labelMin}</span>
        <span>{labelMid}</span>
        <span>{labelMax}</span>
      </div>
    </div>
  );
};

export default SpeedGauge;
