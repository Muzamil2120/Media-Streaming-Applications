import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

const Layout = ({ onToggleTheme, themeMode }) => (
  <>
    <Navbar onToggleTheme={onToggleTheme} themeMode={themeMode} />
    <main style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <Outlet />
    </main>
  </>
);

export default Layout;
