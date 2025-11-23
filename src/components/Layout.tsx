// src/components/Layout.tsx (Corregido para Tema Claro/Cían)

import React from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Ventas', path: '/ventas' },
    { label: 'Campañas', path: '/campanas' },
    { label: 'Tarjetas', path: '/tarjetas' },
    { label: 'Configuración', path: '/configuracion' },
    { label: 'Test Sheets', path: '/test-sheets' },
  ];

  return (
    <div className="app-root">
      {/* Sidebar (Usa el fondo Cían definido en index.css) */}
      <aside className="sidebar"> 
        <div className="sidebar-header">
          <div className="sidebar-logo">
            FE
          </div>
          <div className="sidebar-title">
            Fennix Emporium
            <div className="sidebar-subtitle">Ads & Commerce Hub</div>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              // La clase activa (sidebar-item--active) ahora usa fondo BLANCO
              className={({ isActive }) =>
                'sidebar-item' + (isActive ? ' sidebar-item--active' : '')
              }
            >
              <span className="sidebar-item-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenido principal (fondo claro/blanco del body) */}
      <main className="main-content">
        <header className="main-header">
          <div className className="main-header-title">Dashboard general</div>
        </header>

        <section className="main-body">{children}</section>
      </main>
    </div>
  );
};

export default Layout;