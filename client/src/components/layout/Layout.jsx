import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

const Layout = () => (
  <>
    <Navbar />
    <main style={{ padding: '1.5rem' }}>
      <Outlet />
    </main>
  </>
);

export default Layout;
