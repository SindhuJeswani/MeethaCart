import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Cake, ShoppingBag, User, LogOut, LayoutDashboard, Globe, Store, Shield, Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, lang, toggleLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/items', label: t('nav.browse'), icon: <ShoppingBag className="w-4 h-4" /> },
    ...(isAuthenticated && user?.role === 'seller'
      ? [{ to: '/seller/dashboard', label: t('nav.bakerStudio'), icon: <Store className="w-4 h-4" /> }]
      : []),
    ...(isAuthenticated && user?.role === 'admin'
      ? [{ to: '/admin/dashboard', label: t('nav.adminPanel'), icon: <Shield className="w-4 h-4" /> }]
      : []),
    ...(isAuthenticated && user?.role === 'buyer'
      ? [{ to: '/buyer/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> }]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-chocolate/95 backdrop-blur-md shadow-warm-lg'
            : 'bg-chocolate'
        }`}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-[70px]">

            {/* ── Logo ── */}
            <Link to="/" className="shrink-0">
              <BrandLogo size="md" />
            </Link>

            {/* ── Desktop Nav Links ── */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive(link.to)
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.icon && <span className="opacity-80">{link.icon}</span>}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Right Cluster ── */}
            <div className="flex items-center gap-2">

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 hover:border-white/40 transition-all duration-150"
                title="Toggle English / اردو"
                aria-label="Toggle language"
              >
                <Globe className="w-3.5 h-3.5 text-caramel" />
                <span>{lang === 'en' ? 'اردو' : 'EN'}</span>
              </button>

              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to={
                      user?.role === 'seller'
                        ? '/seller/dashboard'
                        : user?.role === 'admin'
                        ? '/admin/dashboard'
                        : '/buyer/dashboard'
                    }
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm font-medium text-white"
                  >
                    <div className="w-7 h-7 rounded-full bg-caramel text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden lg:block max-w-[100px] truncate text-white/90">{user?.name}</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-caramel/30 text-caramel-light border border-caramel/40">
                      {user?.role}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    title={t('nav.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-all">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile Menu Drawer ── */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-all duration-300 ${
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-chocolate/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute top-[70px] left-0 right-0 bg-chocolate border-b border-white/10 shadow-warm-xl transition-all duration-300 ${
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.icon && <span className="opacity-80">{link.icon}</span>}
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-caramel" />
                <span>{lang === 'en' ? 'اردو' : 'English'}</span>
              </button>

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-all">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
