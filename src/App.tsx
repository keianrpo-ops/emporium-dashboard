// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';  // ⬅️ IMPORTANTE: aquí cargamos tus estilos de layout

import DashboardHome from './pages/dashboard/DashboardHome';
import VentasPage from './pages/VentasPage';
import CampanasPage from './pages/CampanasPage';
import TarjetasPage from './pages/TarjetasPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import TestSheets from './pages/TestSheets';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard principal */}
        <Route path="/" element={<DashboardHome />} />
        <Route path="/dashboard" element={<DashboardHome />} />

        {/* Secciones del panel */}
        <Route path="/ventas" element={<VentasPage />} />
        <Route path="/campanas" element={<CampanasPage />} />
        <Route path="/tarjetas" element={<TarjetasPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />

        {/* Pruebas con Google Sheets */}
        <Route path="/test-sheets" element={<TestSheets />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
