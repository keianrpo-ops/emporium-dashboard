import React from 'react';

interface TopStatsProps {
  sales: number;
  roas: number;
  margin: number;
}

const TopStats: React.FC<TopStatsProps> = ({ sales, roas, margin }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Card 1: Margen Bruto */}
      <StatCard 
        title="MARGEN BRUTO HOY"
        value={`${(margin * 100).toFixed(1)}%`}
        gradient="from-emerald-50 to-emerald-100"
        textColor="text-emerald-800"
        valueColor="text-emerald-900"
        warning={sales > 0 && margin === 0 ? "Falta costo de producto" : undefined}
      />

      {/* Card 2: ROAS */}
      <StatCard 
        title="ROAS HOY"
        value={`${roas.toFixed(2)}x`}
        gradient="from-orange-50 to-orange-100"
        textColor="text-orange-800"
        valueColor="text-orange-900"
        warning={sales > 0 && roas === 0 ? "Falta inversión (Ad Spend)" : undefined}
      />

      {/* Card 3: Ventas */}
      <StatCard 
        title="VENTAS HOY"
        value={sales.toString()}
        gradient="from-blue-50 to-blue-100"
        textColor="text-blue-800"
        valueColor="text-blue-700"
      />
    </div>
  );
};

interface CardProps {
  title: string;
  value: string;
  gradient: string;
  textColor: string;
  valueColor: string;
  warning?: string;
}

const StatCard: React.FC<CardProps> = ({ title, value, gradient, textColor, valueColor, warning }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} p-6 shadow-sm border border-white/50 transition-all hover:shadow-md`}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${textColor} mb-2 opacity-80`}>
          {title}
        </h3>
        
        <div className="flex items-end gap-3">
          <span className={`text-4xl font-extrabold ${valueColor} tracking-tight`}>
            {value}
          </span>
          
          {/* Alerta inteligente si el valor es 0 inesperadamente */}
          {warning && (
            <div className="mb-1.5 flex items-center gap-1.5 px-2 py-1 bg-white/60 rounded-md border border-white/40 backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-bold text-red-600 leading-none">
                {warning}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative blurred circle in background */}
      <div className="absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-white opacity-20 blur-2xl pointer-events-none"></div>
    </div>
  );
};

export default TopStats;