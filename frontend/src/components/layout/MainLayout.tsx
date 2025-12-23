"use client";

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex flex-col">
      {/* Header */}
      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <Sidebar />

        {/* Mobile Menu - Mobile/Tablet Only */}
        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}