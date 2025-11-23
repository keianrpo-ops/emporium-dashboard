import React, { useState } from 'react';
import Layout from '../components/Layout';

// Mock Componente Slider
const SliderControl: React.FC<{ label: string, value: number, min: number, max: number, unit: string }> = ({ label, value, min, max, unit }) => {
  const [currentValue, setCurrentValue] = useState(value);
  // Eliminamos 'percent' que causaba el error TS6133

  return (
    <div style={{ marginBottom: 20, padding: 12, border: '1px solid #334155', borderRadius: 8, background: '#0f172a' }}>
      <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8, opacity: 0.9 }}>
        {label}: <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{currentValue}{unit}</span>
      </label>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={currentValue} 
        onChange={(e) => setCurrentValue(Number(e.target.value))} 
        style={{ width: '100%', height: 6, borderRadius: 3, appearance: 'none', background: '#334155', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.6, marginTop: 4 }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

// Mock Componente Switch
const SwitchControl: React.FC<{ label: string, initial: boolean }> = ({ label, initial }) => {
  const [isEnabled, setIsEnabled] = useState(initial);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, padding: 12, borderBottom: '1px solid #1e293b' }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <button 
        onClick={() => setIsEnabled(!isEnabled)} 
        style={{ 
          width: 40, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
          backgroundColor: isEnabled ? '#22c55e' : '#64748b', transition: 'background-color 0.3s',
          position: 'relative', outline: 'none'
        }}
      >
        <span 
          style={{ 
            display: 'block', width: 14, height: 14, borderRadius: 7, background: 'white',
            position: 'absolute', top: 3, left: isEnabled ? 23 : 3, transition: 'left 0.3s'
          }} 
        />
      </button>
    </div>
  );
};


const ConfiguracionPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="page-title">Configuración del Sistema</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        
        {/* Panel de Configuración de Alertas y Switches */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ borderBottom: '1px solid #1e293b', paddingBottom: 10, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>Alertas y Switches</h3>
          
          <SwitchControl label="Notificaciones de error de Webhook" initial={true} />
          <SwitchControl label="Activar modo de depuración (RAW Log)" initial={true} />
          <SwitchControl label="Alerta: CPA supera el 35% del ingreso" initial={false} />
          <SwitchControl label="Usar utilidad neta en cálculos principales" initial={false} />
        </div>

        {/* Panel de Sliders y Valores Numéricos */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ borderBottom: '1px solid #1e293b', paddingBottom: 10, marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Umbrales y Variables</h3>

          <SliderControl 
            label="Margen Bruto Mínimo Deseado" 
            value={35} 
            min={10} 
            max={60} 
            unit="%"
          />
          <SliderControl 
            label="Comisión por Venta (Plataforma)" 
            value={5} 
            min={1} 
            max={15} 
            unit="%"
          />
          <SliderControl 
            label="Umbral de Alerta de ROAS" 
            value={3.0} 
            min={1.0} 
            max={6.0} 
            unit="x"
          />
        </div>
      </div>
    </Layout>
  );
};

export default ConfiguracionPage;