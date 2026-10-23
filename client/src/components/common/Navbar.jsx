import React, { useState, useRef, useEffect } from 'react';
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
  Globe,
  ChevronDown,
  LayoutDashboard,
  ShoppingBag,
  Package,
  ShieldCheck,
  Compass
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
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
    { to: '/items', label: t('nav.browseItems') || 'Browse Items', icon: Compass }
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
        className="w-full sticky top-0 left-0 right-0 z-40 bg-[#4A2C1A] text-white shadow-md border-b border-white/10 select-none"
        style={{ backgroundColor: 'var(--nav-bg)' }}
      >
        <Container className="flex items-center justify-between h-16 gap-3 lg:gap-5">
          
          {/* Logo with SL monogram */}
          <div className="flex items-center shrink-0">
            <Logo variant="light" size={34} />
          </div>

          {/* Centered Pill Search bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md xl:max-w-lg mx-2 lg:mx-4 relative group"
          >
            <div className="w-full flex items-center bg-white/[0.08] hover:bg-white/[0.12] focus-within:bg-white/[0.16] border border-white/20 focus-within:border-amber-300/50 rounded-full px-3.5 py-1.5 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
              <Search className="w-4 h-4 text-white/50 group-focus-within:text-amber-200 transition-colors shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder') || 'Search handcrafted cakes, mithai, bakes...'}
                className="w-full bg-transparent border-none text-white placeholder-white/45 text-xs px-2.5 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 text-white/40 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Desktop Right Action Controls */}
          <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
            
            {/* Desktop Browse Items Link */}
            <Link
              to="/items"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                isActive('/items')
                  ? 'bg-white/20 text-white font-semibold shadow-xs'
                  : 'text-amber-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-300/90 shrink-0" />
              <span>{t('nav.browseItems') || 'Browse Items'}</span>
            </Link>

            {/* Theme Picker Component */}
            <ThemePicker />

            {/* Language toggle: Rounded-full pill */}
            <motion.button
              whileTap={buttonTap}
              whileHover={{ scale: 1.03 }}
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/12 text-xs font-medium text-amber-100 hover:text-white transition-all shrink-0 cursor-pointer"
              title={lang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-300/90 shrink-0" />
              <span style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', sans-serif" }}>
                {lang === 'en' ? 'اردو' : 'English'}
              </span>
            </motion.button>

            {/* Authentication state */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <motion.button
                  whileTap={buttonTap}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 focus:outline-none transition-all cursor-pointer shadow-xs"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-xs ring-1 ring-white/20 shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden xl:inline-block max-w-[100px] truncate text-xs font-medium text-white/95">
                    {user?.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 whitespace-nowrap">
                    {roleLabel}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Luxury Floating Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: TIMING.normal, ease: EASING.out }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/15 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] p-2 z-50 text-white backdrop-blur-md"
                      style={{ backgroundColor: 'var(--nav-bg)' }}
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 mb-1 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-xs ring-1 ring-white/20">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                          <p className="text-[10px] text-white/60 truncate">{user?.email}</p>
                          <span className="inline-block mt-0.5 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                            {roleLabel}
                          </span>
                        </div>
                      </div>

                      {/* Navigation links */}
                      <div className="space-y-0.5">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-100 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-amber-300 shrink-0" />
                          <span>{user?.role === 'admin' ? 'Admin Portal' : user?.role === 'seller' ? 'Baker Dashboard' : 'My Dashboard'}</span>
                        </Link>

                        {user?.role === 'seller' && (
                          <Link
                            to="/seller/items"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-100 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Package className="w-4 h-4 text-amber-300 shrink-0" />
                            <span>Manage Bakery Items</span>
                          </Link>
                        )}

                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/sellers"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-100 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                            <span>Seller Approvals</span>
                          </Link>
                        )}

                        <Link
                          to="/items"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-100 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-amber-300 shrink-0" />
                          <span>Browse Bakes & Mithai</span>
                        </Link>
                      </div>

                      <div className="my-1.5 border-t border-white/10" />

                      {/* Sign Out */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:text-red-100 hover:bg-red-500/20 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{t('nav.logout') || 'Sign Out'}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-amber-100 hover:text-white rounded-full hover:bg-white/10 transition-all whitespace-nowrap"
                >
                  {t('nav.login') || 'Sign in'}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs py-1.5 px-4 rounded-full font-semibold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  {t('nav.register') || 'Register'}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <motion.button
              whileTap={buttonTap}
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
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
              className="absolute top-16 left-0 right-0 bg-[#4A2C1A] border-b border-white/10 shadow-2xl overflow-y-auto max-h-[85vh]"
              style={{ backgroundColor: 'var(--nav-bg)' }}
            >
              {/* User profile banner in mobile menu if authenticated */}
              {isAuthenticated && (
                <div className="mx-4 mt-3 p-3 rounded-xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-bold text-base uppercase shrink-0 ring-1 ring-white/20">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-white/60 truncate">{user?.email}</p>
                    <span className="inline-block mt-0.5 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      {roleLabel}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Search input */}
              <form onSubmit={handleSearch} className="flex items-center mx-4 my-3 bg-white/10 border border-white/20 rounded-full px-3 py-1 overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder') || 'Search items...'}
                  className="flex-1 px-2 py-1.5 bg-transparent text-white text-xs placeholder-white/50 focus:outline-none"
                />
                <button type="submit" className="p-1 text-white/70">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <div className="px-4 pb-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-amber-100/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}

                {isAuthenticated && (
                  <>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-100/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-300" />
                      <span>{user?.role === 'admin' ? 'Admin Portal' : user?.role === 'seller' ? 'Baker Dashboard' : 'My Dashboard'}</span>
                    </Link>

                    {user?.role === 'seller' && (
                      <Link
                        to="/seller/items"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-100/80 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Package className="w-4 h-4 text-amber-300" />
                        <span>Manage Items</span>
                      </Link>
                    )}

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/sellers"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-100/80 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        <span>Seller Approvals</span>
                      </Link>
                    )}
                  </>
                )}

                <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-3">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-amber-100 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-300" />
                    <span style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', sans-serif" }}>
                      {lang === 'en' ? 'اردو' : 'English'}
                    </span>
                  </button>

                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-red-300 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('nav.logout') || 'Sign out'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-100 hover:text-white rounded-full hover:bg-white/10 transition-all"
                      >
                        {t('nav.login') || 'Sign in'}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="btn-primary text-xs py-1.5 px-3 rounded-full"
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
