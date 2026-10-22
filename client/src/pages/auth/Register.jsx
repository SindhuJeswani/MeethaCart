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
    'Create your online storefront in minutes',
    'List custom cakes, cookies, traditional mithai, and more',
    'Receive orders directly from buyers in your local area'
  ];

  const buyerBenefits = [
    'Freshly made bakes from verified local home bakers',
    'Request custom designs, weights, and dates',
    'Bilingual interface supporting English and ????'
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
          ? 'Register as a home baker seller'
          : 'Register to order fresh baked items'
      }
      footerLinkText="Already have an account?"
      footerLinkAction="Sign in"
      footerLinkTo="/login"
    >
      {/* Animated Role Selection Cards */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-bakery-100/80 rounded-xl mb-5 border border-bakery-200">
        <motion.button
          type="button"
          id="role-buyer"
          onClick={() => setRole('buyer')}
          whileHover={{ scale: 1.02 }}
          whileTap={buttonTap}
          className={`relative py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            role === 'buyer'
              ? 'bg-white text-chocolate shadow-warm border border-caramel/40'
              : 'text-bakery-600 hover:text-chocolate'
          }`}
        >
          {role === 'buyer' && (
            <motion.div
              layoutId="role-highlight"
              className="absolute inset-0 border-2 border-caramel rounded-lg pointer-events-none"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <User className={`w-4 h-4 ${role === 'buyer' ? 'text-caramel' : 'text-bakery-400'}`} />
          <span>Buyer</span>
          {role === 'buyer' && <CheckCircle className="w-3.5 h-3.5 text-caramel ml-auto" />}
        </motion.button>

        <motion.button
          type="button"
          id="role-seller"
          onClick={() => setRole('seller')}
          whileHover={{ scale: 1.02 }}
          whileTap={buttonTap}
          className={`relative py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            role === 'seller'
              ? 'bg-white text-chocolate shadow-warm border border-caramel/40'
              : 'text-bakery-600 hover:text-chocolate'
          }`}
        >
          {role === 'seller' && (
            <motion.div
              layoutId="role-highlight"
              className="absolute inset-0 border-2 border-caramel rounded-lg pointer-events-none"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <Store className={`w-4 h-4 ${role === 'seller' ? 'text-caramel' : 'text-bakery-400'}`} />
          <span>Seller (Baker)</span>
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
            className="alert-error mb-4"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        variants={shakeVariant}
        animate={isShaking ? 'shake' : 'idle'}
        onSubmit={handleSubmit}
        className="space-y-3.5"
      >
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-bakery-700 mb-1">
            Full name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="input-bakery pl-10 transition-all duration-150 focus:ring-2 focus:ring-caramel/20"
            />
          </div>
        </div>

        {/* Bakery Name (Only for Sellers) with smooth AnimatePresence */}
        <AnimatePresence>
          {role === 'seller' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
              className="overflow-hidden"
            >
              <label className="block text-xs font-semibold text-bakery-700 mb-1">
                Bakery or brand name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={bakeryName}
                  onChange={(e) => setBakeryName(e.target.value)}
                  placeholder="e.g. Sara's Kitchen Bakes"
                  required={role === 'seller'}
                  className="input-bakery pl-10 transition-all duration-150 focus:ring-2 focus:ring-caramel/20"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-bakery-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
              className="input-bakery pl-10 transition-all duration-150 focus:ring-2 focus:ring-caramel/20"
            />
          </div>
        </div>

        {/* Phone & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1">
              Phone number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                className="input-bakery pl-10 transition-all duration-150 focus:ring-2 focus:ring-caramel/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1">
              Language
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="input-bakery pl-10 transition-all duration-150 focus:ring-2 focus:ring-caramel/20"
              >
                <option value="en">English</option>
                <option value="ur">???? (Urdu)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                autoComplete="new-password"
                className="input-bakery pl-10 transition-all duration-150 focus:ring-2 focus:ring-caramel/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                className="input-bakery pl-10 transition-all duration-150 focus:ring-2 focus:ring-caramel/20"
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
          className="btn-primary w-full py-2.5 text-sm font-semibold shadow-md transition-all duration-200 mt-2 flex items-center justify-center gap-2"
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

      <div className="pt-3 border-t border-bakery-100 mt-4 flex items-center gap-1.5 text-xs text-bakery-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>We will send an OTP code to your email to verify your account.</span>
      </div>
    </AuthLayout>
  );
};

export default Register;
