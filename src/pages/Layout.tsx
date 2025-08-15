import React from 'react';
import Navbar from '../addons/Navbar';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
  <div style={{ minHeight: '100vh', minWidth: '100vw', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
