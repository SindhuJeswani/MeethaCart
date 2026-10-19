import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import Logo from '../components/common/Logo';
import heroImg from '../assets/hero.jpg';
import { ShoppingBag, LogIn, UserPlus, Store, X, ArrowRight, User } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { lang, setLang, t, isUrdu } = useTranslation();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const primaryBtnRef = useRef(null);

  // If user is already logged in, redirect them immediately to their role destination
  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [token, user, navigate]);

  // Focus primary action on mount for accessibility
  useEffect(() => {
    if (primaryBtnRef.current) {
      primaryBtnRef.current.focus();
    }
  }, []);

  // Handle guest browse action
  const handleBrowseGuest = () => {
    localStorage.setItem('meethacart_guest_visited', 'true');
    navigate('/');
  };

  // Handle language switch
  const handleSelectLanguage = (selected) => {
    setLang(selected);
    localStorage.setItem('meethacart_lang_selected', 'true');
  };

  // Handle navigation to register with role
  const handleSelectRole = (role) => {
    setShowRoleModal(false);
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bakery-50 text-chocolate">

      {/* ── MOBILE PHOTO (35vh) ──────────────────────────────── */}
      <div className="lg:hidden relative h-[32vh] sm:h-[36vh] w-full overflow-hidden bg-bakery-200">
        <img
          src={heroImg}
          alt="Freshly baked homemade cakes and pastries"
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-chocolate/70 via-transparent to-transparent flex items-end p-4">
          <p className="text-white text-xs font-medium drop-shadow-sm">
            {t('welcome.photoCaption')}
          </p>
        </div>
      </div>

      {/* ── LEFT HALF: MAIN CONTENT ───────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl lg:max-w-none">
        
        {/* Top: Logo & Language Switcher */}
        <div className="flex items-center justify-between gap-4">
          <Logo variant="dark" size="md" />

          {/* Language choice buttons */}
          <div
            role="group"
            aria-label={t('welcome.chooseLanguage')}
            className="flex items-center p-1 bg-bakery-100 rounded-lg border border-bakery-200"
          >
            <button
              type="button"
              onClick={() => handleSelectLanguage('en')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel ${
                lang === 'en'
                  ? 'bg-white text-chocolate shadow-sm border border-bakery-200'
                  : 'text-bakery-600 hover:text-chocolate'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage('ur')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel ${
                lang === 'ur'
                  ? 'bg-white text-chocolate shadow-sm border border-bakery-200'
                  : 'text-bakery-600 hover:text-chocolate'
              }`}
            >
              اردو
            </button>
          </div>
        </div>

        {/* Center: Headline & Actions */}
        <div className="my-8 lg:my-auto space-y-6 max-w-md">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-chocolate leading-tight">
              {t('welcome.headline')}
            </h1>
          </div>

          {/* Action buttons (min 44px height for touch/a11y) */}
          <div className="space-y-3">
            {/* 1. Primary: Browse items */}
            <button
              ref={primaryBtnRef}
              type="button"
              onClick={handleBrowseGuest}
              className="w-full btn-primary min-h-[46px] py-3 px-5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-caramel"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{t('welcome.browseItems')}</span>
            </button>

            {/* 2. Secondary: Log in */}
            <Link
              to="/login"
              className="w-full btn-secondary min-h-[46px] py-3 px-5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 bg-white hover:bg-bakery-100 border border-bakery-200 text-chocolate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel transition-colors"
            >
              <LogIn className="w-4 h-4 shrink-0 text-caramel" />
              <span>{t('welcome.login')}</span>
            </Link>

            {/* 3. Secondary: Create account */}
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="w-full btn-secondary min-h-[46px] py-3 px-5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 bg-white hover:bg-bakery-100 border border-bakery-200 text-chocolate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel transition-colors"
            >
              <UserPlus className="w-4 h-4 shrink-0 text-caramel" />
              <span>{t('welcome.createAccount')}</span>
            </button>
          </div>

          {/* Seller text link */}
          <div className="pt-2">
            <Link
              to="/register?role=seller"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel hover:text-caramel-dark underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel rounded"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t('welcome.sellOnMeethaCart')}</span>
            </Link>
          </div>
        </div>

        {/* Bottom: Small clean footer */}
        <div className="pt-6 border-t border-bakery-200/80 flex items-center justify-between text-xs text-bakery-500">
          <p>{t('welcome.copyright')}</p>
          <div className="flex items-center gap-3">
            <Link to="/items" className="hover:text-chocolate transition-colors">
              {t('nav.browse')}
            </Link>
          </div>
        </div>

      </div>

      {/* ── RIGHT HALF: REAL FOOD PHOTO (DESKTOP) ─────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-bakery-200 overflow-hidden">
        <img
          src={heroImg}
          alt="Freshly baked homemade cakes and pastries"
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {/* Subtle photo overlay with caption */}
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-chocolate/80 via-chocolate/40 to-transparent">
          <p className="text-white/95 text-sm font-medium">
            {t('welcome.photoCaption')}
          </p>
        </div>
      </div>

      {/* ── ROLE SELECTION MODAL (for Create Account) ─────────── */}
      {showRoleModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-fade-in"
        >
          <div className="bg-white rounded-xl border border-bakery-200 shadow-lg max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-bakery-200">
              <h3 id="role-modal-title" className="font-serif font-bold text-chocolate text-base">
                {t('welcome.chooseRoleTitle')}
              </h3>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="text-bakery-400 hover:text-chocolate p-1 rounded-md"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {/* Buyer Option */}
              <button
                type="button"
                onClick={() => handleSelectRole('buyer')}
                className="w-full p-3.5 rounded-lg border border-bakery-200 hover:border-caramel hover:bg-bakery-50 text-left flex items-start gap-3 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel"
              >
                <div className="w-9 h-9 rounded-md bg-bakery-100 flex items-center justify-center shrink-0 group-hover:bg-caramel/15 text-chocolate">
                  <User className="w-4 h-4 text-caramel" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-chocolate text-xs sm:text-sm flex items-center justify-between">
                    <span>{t('welcome.roleBuyer')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-bakery-400 group-hover:text-caramel group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-bakery-500 mt-0.5">
                    {t('welcome.roleBuyerDesc')}
                  </p>
                </div>
              </button>

              {/* Seller Option */}
              <button
                type="button"
                onClick={() => handleSelectRole('seller')}
                className="w-full p-3.5 rounded-lg border border-bakery-200 hover:border-caramel hover:bg-bakery-50 text-left flex items-start gap-3 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel"
              >
                <div className="w-9 h-9 rounded-md bg-bakery-100 flex items-center justify-center shrink-0 group-hover:bg-caramel/15 text-chocolate">
                  <Store className="w-4 h-4 text-caramel" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-chocolate text-xs sm:text-sm flex items-center justify-between">
                    <span>{t('welcome.roleSeller')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-bakery-400 group-hover:text-caramel group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-bakery-500 mt-0.5">
                    {t('welcome.roleSellerDesc')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Welcome;
