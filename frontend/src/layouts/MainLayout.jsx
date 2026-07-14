import React from 'react';
import Navbar from '../components/Common/Navbar';
import Footer from '../components/Common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="app-layout" style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className="main-content" style={{ flexGrow: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
