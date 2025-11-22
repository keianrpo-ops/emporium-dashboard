// src/components/Layout.tsx
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
    // opcional: acceso directo a test-sheets solo mientras desarrollamos
    { label: 'Test Sheets', path: '/test-sheets' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
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
      <main className="main-content">
        <header className="main-header">
          <div className="main-header-title">Dashboard general</div>
          {/* aquí puedes dejar tu buscador, usuario, etc */}
        </header>

        <section className="main-body">{children}</section>
      </main>
    </div>
  );
};

export default Layout;
