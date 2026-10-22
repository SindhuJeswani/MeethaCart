import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import Container from './Container';
import Logo from './Logo';
import ThemePicker from './ThemePicker';
import {
  Search,
  LogOut,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { buttonTap, TIMING, EASING } from '../../animations/motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { lang, toggleLanguage, t } = useTranslation();
  const { isAjrak, isStreet } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'seller') return '/seller/dashboard';
    return '/buyer/dashboard';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Milestone 3 Scope Navigation Links
  const navLinks = [
    { to: '/items', label: t('nav.browseItems') || 'Browse Items' }
  ];

  const roleLabel = (() => {
    if (!user?.role) return '';
    if (lang === 'ur') {
      if (user.role === 'admin') return 'ایڈمن';
      if (user.role === 'seller') return 'بیکر';
      return 'خریدار';
    }
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'seller') return 'Baker';
    return 'Buyer';
  })();

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="sticky top-0 z-40 bg-[#4A2C1A] text-white shadow-md border-b border-white/10"
        style={{ backgroundColor: 'var(--nav-bg)' }}
      >
        <Container className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo with SL monogram */}
          <div className="flex items-center shrink-0">
            <Logo variant="light" size={36} />
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-2 bg-white/10 hover:bg-white/15 focus-within:bg-white/20 border border-white/15 focus-within:border-caramel-light rounded-md px-3 py-1.5 transition-all"
          >
            <Search className="w-4 h-4 text-white/60 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.searchPlaceholder') || 'Search handcrafted cakes, bakes...'}
              className="w-full bg-transparent border-none text-white placeholder-white/50 text-xs px-2.5 focus:outline-none"
            />
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
                    active
                      ? 'text-white font-bold'
                      : 'text-amber-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-caramel rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Theme Picker Component */}
            <ThemePicker />

            {/* Language toggle: Displays clean 'اردو' or 'English' */}
            <motion.button
              whileTap={buttonTap}
              whileHover={{ scale: 1.05 }}
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/20 text-xs font-semibold text-amber-100 hover:text-white hover:bg-white/10 transition-all shrink-0"
              title={lang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-caramel-light shrink-0" />
              <span style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', sans-serif" }}>
                {lang === 'en' ? 'اردو' : 'English'}
              </span>
            </motion.button>

            {/* Authentication state */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/10 border border-white/15 hover:bg-white/15 transition-all text-xs font-medium text-white shrink-0"
                >
                  <div className="w-5 h-5 rounded-full bg-caramel text-white flex items-center justify-center font-bold text-[11px] uppercase shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden xl:inline-block max-w-[120px] truncate text-white/90">{user?.name}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-caramel/30 text-amber-200 border border-caramel/40 whitespace-nowrap">
                    {roleLabel}
                  </span>
                </Link>
                <motion.button
                  whileTap={buttonTap}
                  whileHover={{ scale: 1.1 }}
                  onClick={handleLogout}
                  className="p-1.5 text-white/60 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all shrink-0"
                  title={t('nav.logout') || 'Sign out'}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 text-xs font-medium text-amber-100 hover:text-white rounded-md hover:bg-white/10 transition-all whitespace-nowrap"
                >
                  {t('nav.login') || 'Sign in'}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs py-1.5 px-3 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shadow-xs"
                >
                  {t('nav.register') || 'Register'}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <motion.button
              whileTap={buttonTap}
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>

        </Container>

        {/* Sindhi Ajrak Geometric Block-Print Band */}
        <div className="ajrak-pattern-band" />
      </motion.header>

      {/* Bold Street Market Marquee Strip */}
      <div className="street-marquee-strip">
        <div className="animate-marquee inline-block whitespace-nowrap font-bold text-xs">
          FRESH HOMEMADE BAKES • KARACHI ARTISAN CHEFS • CUSTOM CAKES • LOCAL HOME BAKERS • 100% PURE DESI GHEE MITHAI •&nbsp;
          FRESH HOMEMADE BAKES • KARACHI ARTISAN CHEFS • CUSTOM CAKES • LOCAL HOME BAKERS • 100% PURE DESI GHEE MITHAI •&nbsp;
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: TIMING.micro }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
              className="absolute top-16 left-0 right-0 bg-[#4A2C1A] border-b border-white/10 shadow-2xl"
              style={{ backgroundColor: 'var(--nav-bg)' }}
            >
              <form onSubmit={handleSearch} className="flex items-center mx-4 my-3 bg-white/10 border border-white/20 rounded-md overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder') || 'Search items...'}
                  className="flex-1 px-3 py-2.5 bg-transparent text-white text-sm placeholder-white/50 focus:outline-none"
                />
                <button type="submit" className="px-3.5 py-2.5 text-white/70">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <div className="px-4 pb-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-amber-100/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}

                <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-2">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-white/20 text-xs font-semibold text-amber-100 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-caramel-light" />
                    <span style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', sans-serif" }}>
                      {lang === 'en' ? 'اردو' : 'English'}
                    </span>
                  </button>

                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-1.5 text-sm font-medium text-amber-100 hover:text-white rounded-md hover:bg-white/10 transition-all"
                      >
                        {user?.name} ({roleLabel})
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('nav.logout') || 'Sign out'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-1.5 text-sm font-medium text-amber-100 hover:text-white rounded-md hover:bg-white/10 transition-all"
                      >
                        {t('nav.login') || 'Sign in'}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="btn-primary text-sm py-1.5 px-3"
                      >
                        {t('nav.register') || 'Register'}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
