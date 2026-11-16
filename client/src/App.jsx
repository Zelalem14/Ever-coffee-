import React from 'react';
import Header from './components/Header';
import SimpleMenu from './components/SimpleMenu';
import SimpleFooter from './components/SimpleFooter';
import MobileBottomNav from './components/MobileBottomNav';
import ProductDetailModal from './components/ProductDetailModal';
import AdminLoginModal from './components/admin/AdminLoginModal';
import AdminPortal from './components/admin/AdminPortal';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAdminOpen } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#120804] text-zinc-900 dark:text-[#FAF4ED] font-sans selection:bg-[#EFEBE9] selection:text-[#2C1810] antialiased transition-colors duration-200">
      {/* If Admin Portal is active, show the Admin Dashboard */}
      {isAdminOpen ? (
        <AdminPortal />
      ) : (
        /* Customer View: Logo, Name, Welcome Note + Immediate DRINKS & FOODS Menu */
        <main className="flex-grow">
          {/* Header with Logo, Name & Welcome Note */}
          <Header />

          {/* Immediate Clean Digital Menu */}
          <SimpleMenu />

          {/* Simple Footer */}
          <SimpleFooter />

          {/* Modern Mobile Bottom Navigation */}
          <MobileBottomNav />
        </main>
      )}

      {/* Modals */}
      <ProductDetailModal />
      <AdminLoginModal />
    </div>
  );
}
