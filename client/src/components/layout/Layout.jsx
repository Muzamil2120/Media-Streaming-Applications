import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

const Layout = ({ onToggleTheme, themeMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <>
      <Navbar onToggleTheme={onToggleTheme} themeMode={themeMode} onToggleSidebar={toggleSidebar} />
      <div style={{ display: 'flex' }}>
        <Sidebar open={sidebarOpen} />
        <main style={{ flexGrow: 1, padding: '1.5rem', maxWidth: '100%', overflowX: 'hidden' }}>
          <Outlet context={{ sidebarOpen, toggleSidebar }} />
        </main>
      </div>
    </>
  );
};

export default Layout;
