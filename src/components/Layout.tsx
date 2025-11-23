// src/components/Layout.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

import fennixLogo from '../assets/fennix-logo.png';


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
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="app-shell__sidebar">
        <div className="sidebar-header">

         <div className="sidebar-logo">
  <img src={fennixLogo} alt="Fennix Emporium Logo" />
</div>

<div className="sidebar-title">
  FENNIX EMPORIUM
  <div className="sidebar-subtitle">ADS & COMMERCE HUB</div>
</div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                'sidebar-item' + (isActive ? ' sidebar-item--active' : '')
              }
            >
              <span className="sidebar-item-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="app-shell__main">
        <header className="main-header">
          <div className="main-header-title">Dashboard general</div>
        </header>

        <section className="main-body">{children}</section>
      </main>
    </div>
  );
};

export default Layout;
