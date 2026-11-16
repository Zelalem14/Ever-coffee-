import React, { useState, useEffect } from 'react';
import { Coffee, Menu as MenuIcon, X, Shield, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, setShowLoginModal, isAdminOpen, setIsAdminOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Digital Menu', href: '#menu' },
    { name: 'Featured & Popular', href: '#featured' },
    { name: 'Special Offers', href: '#offers' },
    { name: 'Our Heritage', href: '#about' },
    { name: 'Hours & Location', href: '#hours' },
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    if (isAdminOpen) {
      setIsAdminOpen(false);
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-200/80 py-3'
          : 'bg-white/80 backdrop-blur-md border-b border-zinc-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 group-hover:text-amber-700 transition-colors">
                  Keffa & Bunna
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                  Ethiopia
                </span>
              </div>
              <p className="text-[11px] tracking-wider uppercase text-zinc-500 font-medium">
                Premium Coffee House & Digital Lounge
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-sm font-medium text-zinc-700 hover:text-amber-700 transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-600 hover:after:w-full after:transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions: Admin Portal & Quick Status */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm ${
                  isAdminOpen
                    ? 'bg-amber-600 text-white shadow-amber-600/20'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                {isAdminOpen ? 'View Public Menu' : 'Admin Dashboard'}
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200 transition-all duration-200"
                title="Admin Login for Menu Management"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Admin
              </button>
            )}

            <a
              href="#menu"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#menu');
              }}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 shadow-sm hover:shadow transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Browse Menu
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && (
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="p-2 rounded-xl bg-zinc-100 text-amber-700 border border-zinc-200 text-xs"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 border-b border-zinc-200 px-4 pt-3 pb-6 animate-fade-in backdrop-blur-xl shadow-lg">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-800 hover:bg-zinc-100 hover:text-amber-700 transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="pt-3 border-t border-zinc-200 flex flex-col gap-2">
              <a
                href="#menu"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#menu');
                }}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 shadow-sm"
              >
                Explore Digital Menu
              </a>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsAdminOpen(!isAdminOpen);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200"
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  {isAdminOpen ? 'Switch to Customer View' : 'Open Admin Dashboard'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 border border-zinc-200"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Admin Portal Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
