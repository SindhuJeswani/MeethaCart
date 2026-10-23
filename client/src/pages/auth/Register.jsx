import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Mail, Lock, User, Store, Phone, Globe, ArrowRight, AlertCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  shakeVariant,
  fadeUp,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const Register = () => {
  const [role, setRole] = useState('buyer'); // 'buyer' or 'seller'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bakeryName, setBakeryName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      triggerShake();
      return;
    }

    if (role === 'seller' && !bakeryName.trim()) {
      setError('Bakery name is required for sellers.');
      triggerShake();
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        preferredLanguage,
        phone: phone.trim(),
        bakeryName: role === 'seller' ? bakeryName.trim() : ''
      });

      navigate('/verify-otp', {
        state: {
          email: res.email,
          purpose: 'signup_verification',
          cooldownSeconds: res.cooldownSeconds || 60,
          devOtp: res.devOtp
        }
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellerBenefits = [
    'Create your bespoke online bakery storefront in minutes',
    'List custom cakes, artisan breads, and traditional desserts',
    'Receive orders directly from customers in your local area'
  ];

  const buyerBenefits = [
    'Freshly made bakes from verified local home bakers',
    'Request custom designs, weights, and delivery dates',
    'Bilingual interface supporting English and اردو'
  ];

  return (
    <AuthLayout
      headline={
        role === 'seller'
          ? 'Start selling your homemade treats today'
          : 'Join MeethaCart to discover local homemade bakes'
      }
      benefits={role === 'seller' ? sellerBenefits : buyerBenefits}
      footerNote="Secure Email OTP Verification"
      formTitle="Create an account"
      formSubtitle={
        role === 'seller'
          ? 'Register as a certified home baker seller'
          : 'Register to order fresh baked celebration cakes'
      }
      footerLinkText="Already have an account?"
      footerLinkAction="Sign in"
      footerLinkTo="/login"
    >
      {/* Tactile Role Selection Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-amber-950/[0.04] rounded-2xl mb-6 border border-amber-950/[0.06]">
        <motion.button
          type="button"
          id="role-buyer"
          onClick={() => setRole('buyer')}
          whileHover={{ scale: 1.01 }}
          whileTap={buttonTap}
          className={`relative py-3 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            role === 'buyer'
              ? 'bg-white text-chocolate shadow-[0_4px_16px_rgba(74,44,26,0.08)] border border-amber-950/[0.06]'
              : 'text-bakery-600 hover:text-chocolate'
          }`}
        >
          <User className={`w-4 h-4 ${role === 'buyer' ? 'text-caramel' : 'text-bakery-400'}`} />
          <span>Buyer (Sweet Lover)</span>
          {role === 'buyer' && <CheckCircle className="w-3.5 h-3.5 text-caramel ml-auto" />}
        </motion.button>

        <motion.button
          type="button"
          id="role-seller"
          onClick={() => setRole('seller')}
          whileHover={{ scale: 1.01 }}
          whileTap={buttonTap}
          className={`relative py-3 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            role === 'seller'
              ? 'bg-white text-chocolate shadow-[0_4px_16px_rgba(74,44,26,0.08)] border border-amber-950/[0.06]'
              : 'text-bakery-600 hover:text-chocolate'
          }`}
        >
          <Store className={`w-4 h-4 ${role === 'seller' ? 'text-caramel' : 'text-bakery-400'}`} />
          <span>Seller (Home Baker)</span>
          {role === 'seller' && <CheckCircle className="w-3.5 h-3.5 text-caramel ml-auto" />}
        </motion.button>
      </div>

      {/* Animated Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="mb-5 p-3.5 rounded-xl bg-rose-50/90 border border-rose-200/80 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        variants={shakeVariant}
        animate={isShaking ? 'shake' : 'idle'}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
            Full name <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <User className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ayesha Khan"
              required
              className="input-bakery pl-11"
            />
          </div>
        </div>

        {/* Bakery Name (Only for Sellers) */}
        <AnimatePresence>
          {role === 'seller' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
              className="overflow-hidden"
            >
              <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
                Bakery or Brand Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Store className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
                <input
                  type="text"
                  value={bakeryName}
                  onChange={(e) => setBakeryName(e.target.value)}
                  placeholder="e.g. Sara's Artisan Oven"
                  required={role === 'seller'}
                  className="input-bakery pl-11"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
            Email address <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <Mail className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
              className="input-bakery pl-11"
            />
          </div>
        </div>

        {/* Phone & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
              Phone number <span className="text-[10px] text-bakery-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative group">
              <Phone className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                className="input-bakery pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
              Language <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <Globe className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="input-bakery pl-11 appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <Lock className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                autoComplete="new-password"
                className="input-bakery pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
              Confirm password <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <Lock className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                className="input-bakery pl-11"
              />
            </div>
          </div>
        </div>

        {/* Submit with scale & spinner */}
        <motion.button
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={buttonTap}
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3.5 text-sm font-bold shadow-md transition-all duration-200 mt-3 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.form>

      <div className="pt-4 border-t border-amber-950/[0.06] mt-6 flex items-center gap-2 text-xs text-bakery-600 bg-amber-50/40 p-3 rounded-xl border border-amber-950/[0.04]">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-medium">A 6-digit verification code will be sent to your email.</span>
      </div>
    </AuthLayout>
  );
};

export default Register;
