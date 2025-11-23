import React from "react";
import "./KpiGauge.css";

interface KpiGaugeProps {
  label: string;
  value: number;
  currency?: boolean;
  unit?: string;
}

const KpiGauge: React.FC<KpiGaugeProps> = ({ label, value, currency, unit }) => {
  const max = unit === "%" ? 100 : unit === "x" ? 10 : value * 2;

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const needleDeg = -90 + (percentage * 180) / 100;

  return (
    <div className="gauge-card">
      <div className="gauge-label">{label}</div>

      <div className="gauge-container">
        <div className="gauge-arc"></div>

        <div
          className="gauge-needle"
          style={{ transform: `rotate(${needleDeg}deg)` }}
        ></div>

        <div className="gauge-center"></div>
      </div>

      <div className="gauge-value">
        {currency ? `$ ${value.toLocaleString("es-CO")}` : value.toLocaleString("es-CO")}
        {unit && <span className="gauge-unit">{unit}</span>}
      </div>
    </div>
  );
};

export default KpiGauge;
