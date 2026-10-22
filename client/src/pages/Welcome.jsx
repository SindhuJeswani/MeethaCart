import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import Logo from '../components/common/Logo';
import heroImg from '../assets/hero.jpg';
import { ShoppingBag, LogIn, UserPlus, Store, X, ArrowRight, User } from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  buttonTap,
  modalBackdrop,
  modalIn,
  TIMING,
  EASING
} from '../animations/motion';

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

  const handleBrowseGuest = () => {
    localStorage.setItem('meethacart_guest_visited', 'true');
    navigate('/');
  };

  const handleSelectLanguage = (selected) => {
    setLang(selected);
    localStorage.setItem('meethacart_lang_selected', 'true');
  };

  const handleSelectRole = (role) => {
    setShowRoleModal(false);
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* MOBILE PHOTO */}
      <div className="lg:hidden relative h-[32vh] sm:h-[36vh] w-full overflow-hidden bg-bakery-200">
        <motion.img
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
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

      {/* LEFT HALF: MAIN CONTENT */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl lg:max-w-none">
        {/* Top: Logo & Language Switcher */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal }}
          className="flex items-center justify-between pb-4 border-b border-bakery-200/80"
        >
          <Logo variant="dark" size="md" />

          {/* Bilingual Language Switcher with Animated Highlight */}
          <div className="flex items-center gap-1 p-1 bg-bakery-100 rounded-lg border border-bakery-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => handleSelectLanguage('en')}
              className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors min-h-[36px] ${
                lang === 'en' ? 'text-chocolate' : 'text-bakery-600 hover:text-chocolate'
              }`}
            >
              {lang === 'en' && (
                <motion.div
                  layoutId="welcome-lang-tab"
                  className="absolute inset-0 bg-white rounded-md shadow-xs border border-bakery-200"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10">English</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage('ur')}
              className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors min-h-[36px] ${
                lang === 'ur' ? 'text-chocolate' : 'text-bakery-600 hover:text-chocolate'
              }`}
            >
              {lang === 'ur' && (
                <motion.div
                  layoutId="welcome-lang-tab"
                  className="absolute inset-0 bg-white rounded-md shadow-xs border border-bakery-200"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 font-serif">اردو</span>
            </button>
          </div>
        </motion.div>

        {/* Center: Headline & Actions */}
        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          animate="visible"
          className="my-8 lg:my-auto space-y-6 max-w-md"
        >
          <motion.div variants={staggerItem} className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-chocolate leading-tight">
              {t('welcome.headline')}
            </h1>
          </motion.div>

          {/* Action buttons */}
          <motion.div variants={staggerItem} className="space-y-3">
            <motion.button
              ref={primaryBtnRef}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={buttonTap}
              type="button"
              onClick={handleBrowseGuest}
              className="w-full btn-primary min-h-[46px] py-3 px-5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{t('welcome.browseItems')}</span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.015 }} whileTap={buttonTap}>
              <Link
                to="/login"
                className="w-full btn-secondary min-h-[46px] py-3 px-5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 bg-white hover:bg-bakery-100 border border-bakery-200 text-chocolate shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4 shrink-0 text-caramel" />
                <span>{t('welcome.login')}</span>
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={buttonTap}
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="w-full btn-secondary min-h-[46px] py-3 px-5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 bg-white hover:bg-bakery-100 border border-bakery-200 text-chocolate shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4 shrink-0 text-caramel" />
              <span>{t('welcome.createAccount')}</span>
            </motion.button>
          </motion.div>

          {/* Seller text link */}
          <motion.div variants={staggerItem} className="pt-2">
            <Link
              to="/register?role=seller"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel hover:text-caramel-dark underline underline-offset-4 rounded hover:translate-x-0.5 transition-transform"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t('welcome.sellOnMeethaCart')}</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom footer */}
        <div className="pt-6 border-t border-bakery-200/80 flex items-center justify-between text-xs text-bakery-500">
          <p>{t('welcome.copyright')}</p>
          <div className="flex items-center gap-3">
            <Link to="/items" className="hover:text-chocolate transition-colors font-medium">
              {t('nav.browse')}
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT HALF: FOOD PHOTO */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-bakery-200 overflow-hidden">
        <motion.img
          initial={{ scale: 1.04, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: EASING.out }}
          src={heroImg}
          alt="Freshly baked homemade cakes and pastries"
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-chocolate/85 via-chocolate/40 to-transparent">
          <p className="text-white/95 text-sm font-medium drop-shadow-xs">
            {t('welcome.photoCaption')}
          </p>
        </div>
      </div>

      {/* ROLE SELECTION MODAL with Animated Backdrop & Dialog */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          >
            <motion.div
              variants={modalIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl border border-bakery-200 shadow-warm-xl max-w-sm w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-bakery-200">
                <h3 className="font-serif font-bold text-chocolate text-base">
                  {t('welcome.chooseRoleTitle')}
                </h3>
                <motion.button
                  whileTap={buttonTap}
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="text-bakery-400 hover:text-chocolate p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="space-y-3 pt-1">
                {/* Buyer Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={buttonTap}
                  type="button"
                  onClick={() => handleSelectRole('buyer')}
                  className="w-full p-3.5 rounded-xl border border-bakery-200 hover:border-caramel hover:bg-amber-50/50 text-left flex items-start gap-3 transition-colors group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-bakery-100 flex items-center justify-center shrink-0 group-hover:bg-caramel/20 text-chocolate">
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
                </motion.button>

                {/* Seller Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={buttonTap}
                  type="button"
                  onClick={() => handleSelectRole('seller')}
                  className="w-full p-3.5 rounded-xl border border-bakery-200 hover:border-caramel hover:bg-amber-50/50 text-left flex items-start gap-3 transition-colors group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-bakery-100 flex items-center justify-center shrink-0 group-hover:bg-caramel/20 text-chocolate">
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
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Welcome;
