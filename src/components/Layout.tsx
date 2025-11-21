// src/components/Layout.tsx
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">FE</div>
          <div>
            <div className="logo-title">Fennix Emporium</div>
            <div className="logo-subtitle">Ads & Commerce Hub</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item nav-item--active">Dashboard</button>
          <button className="nav-item">Ventas</button>
          <button className="nav-item">Campañas</button>
          <button className="nav-item">Tarjetas</button>
          <button className="nav-item">Configuración</button>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1 className="topbar-title">Dashboard general</h1>
          <div className="topbar-right">
            <input
              className="topbar-search"
              placeholder="Buscar ventas, campañas, tarjetas..."
            />
            <div className="topbar-user">
              <span className="user-name">Emporium Fennix</span>
              <span className="user-badge">Control campañas y pagos</span>
            </div>
          </div>
        </header>

        <section className="main-content">{children}</section>
      </main>
    </div>
  );
};

export default Layout;
