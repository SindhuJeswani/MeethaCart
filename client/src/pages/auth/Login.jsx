import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import { shakeVariant, buttonTap } from '../../animations/motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      triggerShake();
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(email, password);
      // If direct login (e.g. Admin without OTP)
      if (res.token && res.user) {
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (res.user.role === 'seller') {
          navigate('/seller/dashboard', { replace: true });
        } else {
          navigate(location.state?.from || '/', { replace: true });
        }
        return;
      }

      navigate('/verify-otp', {
        state: {
          email: res.email,
          purpose: 'login_2fa',
          cooldownSeconds: res.cooldownSeconds || 60,
          from: location.state?.from,
          devOtp: res.devOtp
        }
      });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    'Browse hundreds of handcrafted cakes, fresh mithai, and savory treats',
    'Order directly from verified artisanal home bakers in your city',
    'Custom requests for birthdays, anniversaries, and party celebrations'
  ];

  return (
    <AuthLayout
      headline="Handcrafted cakes and bakes from local artisans"
      benefits={benefits}
      footerNote="2-Step Email Verification"
      formTitle="Sign in to your account"
      formSubtitle="Enter your verified email and password to access your bakery orders"
      footerLinkText="Don't have an account yet?"
      footerLinkAction="Create one here"
      footerLinkTo="/register"
    >
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
        className="space-y-5"
      >
        {/* Email Address */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
            {t('auth.emailLabel') || 'Email address'} <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <Mail className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. fatima@example.com"
              required
              autoComplete="email"
              className="input-bakery pl-11"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90">
              {t('auth.passwordLabel') || 'Password'} <span className="text-rose-500">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-caramel hover:text-caramel-dark transition-colors inline-block hover:underline"
            >
              {t('auth.forgotPassword') || 'Forgot password?'}
            </Link>
          </div>
          <div className="relative group">
            <Lock className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="input-bakery pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-bakery-400 hover:text-bakery-700 transition-colors p-1.5 rounded-lg hover:bg-bakery-100"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit with hover lift & tactile press */}
        <motion.button
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={buttonTap}
          type="submit"
          id="login-submit-btn"
          disabled={isSubmitting}
          className="btn-primary w-full py-3.5 text-sm font-bold shadow-md transition-all duration-200 mt-2 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{t('auth.loginButton') || 'Sign in'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Security note */}
      <div className="pt-4 border-t border-amber-950/[0.06] mt-6 flex items-center gap-2 text-xs text-bakery-600 bg-amber-50/40 p-3 rounded-xl border border-amber-950/[0.04]">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-medium">Protected by secure two-step email verification.</span>
      </div>
    </AuthLayout>
  );
};

export default Login;
