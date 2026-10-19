import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Search, ShoppingBag, User, LogOut, LayoutDashboard, Globe, Store, Shield, Menu, X, ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import Container from './Container';

const AUTH_ROUTES = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, lang, toggleLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'seller') return '/seller/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/buyer/dashboard';
  };

  const navLinks = [
    { to: '/', label: t('nav.home') || 'Home' },
    { to: '/items', label: t('nav.browse') || 'Browse Items' },
    { to: '/custom-requests', label: t('nav.customBakes') || 'Custom Bakes', soon: true },
    { to: '/cart', label: t('nav.cart') || 'Cart', soon: true },
    ...(isAuthenticated && user?.role === 'seller'
      ? [{ to: '/seller/dashboard', label: t('nav.bakerStudio') || 'My Store', icon: <Store className="w-4 h-4" /> }]
      : []),
    ...(isAuthenticated && user?.role === 'admin'
      ? [{ to: '/admin/dashboard', label: t('nav.adminPanel') || 'Admin', icon: <Shield className="w-4 h-4" /> }]
      : []),
    ...(isAuthenticated && user?.role === 'buyer'
      ? [{ to: '/buyer/dashboard', label: t('nav.dashboard') || 'My Orders', icon: <LayoutDashboard className="w-4 h-4" /> }]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  // ── SIMPLIFIED NAVBAR FOR AUTH PAGES ──────────────────────────────
  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 bg-[#4A2C1A] border-b border-[#3B2214] shadow-sm h-16 shrink-0">
        <Container className="h-full flex items-center justify-between">
          <Logo variant="light" size="sm" to="/" className="shrink-0" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-amber-100 hover:text-white transition-colors py-1.5 px-3 rounded-md hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('nav.backToHome') || 'Back to home'}</span>
          </Link>
        </Container>
      </header>
    );
  }

  // ── FULL STANDARD NAVBAR ──────────────────────────────────────────
  return (
    <>
      <header className="sticky top-0 z-50 bg-[#4A2C1A] border-b border-[#3B2214] shadow-sm h-16 shrink-0">
        <Container className="h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Logo variant="light" size="sm" to="/" className="shrink-0" />

          {/* Search Bar — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden hover:border-white/35 focus-within:border-amber-300 transition-all"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.searchPlaceholder') || 'Search cakes, mithai, cookies...'}
              className="flex-1 px-3.5 py-2 bg-transparent text-white text-sm placeholder-white/50 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3.5 py-2 text-white/70 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive(link.to)
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-amber-100/85 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.icon && <span className="opacity-80">{link.icon}</span>}
                <span>{link.label}</span>
                {link.soon && (
                  <span className="text-[10px] bg-amber-400/25 text-amber-200 border border-amber-400/30 px-1.5 py-0.5 rounded font-semibold ml-0.5">
                    {lang === 'ur' ? 'جلد' : 'Soon'}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions Cluster */}
          <div className="flex items-center gap-2">

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/20 text-xs font-semibold text-amber-100/90 hover:text-white hover:bg-white/10 transition-all"
              title={lang === 'en' ? 'اردو میں دیکھیں' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-caramel-light" />
              <span>{lang === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/10 border border-white/15 hover:bg-white/15 transition-all text-sm font-medium text-white"
                >
                  <div className="w-6 h-6 rounded-full bg-caramel text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden xl:block max-w-[100px] truncate text-white/90 text-xs">{user?.name}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-caramel/30 text-amber-200 border border-caramel/40">
                    {lang === 'ur'
                      ? (user?.role === 'admin' ? 'ایڈمن' : user?.role === 'seller' ? 'سیلر' : 'خریدار')
                      : user?.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/60 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all"
                  title={t('nav.logout') || 'Sign out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-amber-100 hover:text-white rounded-md hover:bg-white/10 transition-all"
                >
                  {t('nav.login') || 'Sign in'}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-1.5 px-3.5"
                >
                  {t('nav.register') || 'Register'}
                </Link>
              </div>
            )}

            {/* Mobile search icon */}
            <Link
              to="/items"
              className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </Container>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-200 ${
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`absolute top-16 left-0 right-0 bg-[#4A2C1A] border-b border-white/10 shadow-xl transition-all duration-200 ${
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          {/* Mobile search */}
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
                <div className="flex items-center gap-2.5">
                  {link.icon && <span className="opacity-80">{link.icon}</span>}
                  <span>{link.label}</span>
                </div>
                {link.soon && (
                  <span className="text-[10px] bg-amber-400/25 text-amber-200 border border-amber-400/30 px-1.5 py-0.5 rounded font-semibold">
                    {lang === 'ur' ? 'جلد' : 'Soon'}
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-white/20 text-xs font-semibold text-amber-100 hover:text-white hover:bg-white/10 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-caramel-light" />
                <span>{lang === 'en' ? 'اردو میں دیکھیں' : 'English'}</span>
              </button>

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout') || 'Sign out'}
                </button>
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
        </div>
      </div>
    </>
  );
};

export default Navbar;
