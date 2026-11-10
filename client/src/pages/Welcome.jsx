import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import RoleChoiceModal from '../components/common/RoleChoiceModal';
import heroImg from '../assets/hero.jpg';
import { ShoppingBag, LogIn, UserPlus, Store } from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  buttonTap,
  TIMING,
  EASING
} from '../animations/motion';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
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
            Freshly handcrafted cakes, brownies, and traditional sweets made to order.
          </p>
        </div>
      </div>

      {/* LEFT HALF: MAIN CONTENT */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl lg:max-w-none">
        {/* Top: Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal }}
          className="flex items-center justify-between pb-4 border-b border-bakery-200/80"
        >
          <Logo variant="dark" size="md" />
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
              Fresh, Handcrafted Bakery Treats From Local Home Bakers
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
              <span>Browse Items</span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.015 }} whileTap={buttonTap}>
              <Link
                to="/login"
                className="w-full btn-secondary min-h-[46px] py-3 px-5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 bg-white hover:bg-bakery-100 border border-bakery-200 text-chocolate shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4 shrink-0 text-caramel" />
                <span>Sign In</span>
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
              <span>Create an Account</span>
            </motion.button>
          </motion.div>

          {/* Seller text link */}
          <motion.div variants={staggerItem} className="pt-2">
            <Link
              to="/register?role=seller"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel hover:text-caramel-dark underline underline-offset-4 rounded hover:translate-x-0.5 transition-transform"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Want to sell? Register your home bakery</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom footer */}
        <div className="pt-6 border-t border-bakery-200/80 flex items-center justify-between text-xs text-bakery-500">
          <p>© {new Date().getFullYear()} MeethaCart. All rights reserved.</p>
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
            Freshly handcrafted cakes, brownies, and traditional sweets made to order.
          </p>
        </div>
      </div>

      {/* ROLE SELECTION MODAL */}
      <RoleChoiceModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelectRole={handleSelectRole}
      />
    </div>
  );
};

export default Welcome;
