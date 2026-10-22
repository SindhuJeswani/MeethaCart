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
    'Browse hundreds of homemade cakes, mithai, and savory treats',
    'Order directly from verified home bakers in your city',
    'Custom requests for birthdays, events, and special celebrations'
  ];

  return (
    <AuthLayout
      headline="Fresh homemade bakes from local bakers"
      benefits={benefits}
      footerNote="2-Step Email Verification"
      formTitle="Sign in to your account"
      formSubtitle="Enter your email and password to continue"
      footerLinkText="Don't have an account?"
      footerLinkAction="Create one"
      footerLinkTo="/register"
    >
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
        className="space-y-4"
      >
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-bakery-700 mb-1.5">
            {t('auth.emailLabel') || 'Email address'}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-email"
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-bakery-700">
              {t('auth.passwordLabel') || 'Password'}
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-caramel hover:text-caramel-dark transition-colors inline-block hover:scale-[1.02]"
            >
              {t('auth.forgotPassword') || 'Forgot password?'}
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="input-bakery pl-10 pr-10 transition-all duration-150 focus:ring-2 focus:ring-caramel/20"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bakery-400 hover:text-bakery-600 transition-colors p-0.5"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Submit with hover lift & press shrink */}
        <motion.button
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={buttonTap}
          type="submit"
          id="login-submit-btn"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 text-sm font-semibold shadow-md transition-all duration-200 mt-2 flex items-center justify-center gap-2"
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

      <div className="pt-3 border-t border-bakery-100 mt-4 flex items-center gap-1.5 text-xs text-bakery-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Secured with two-step email verification.</span>
      </div>
    </AuthLayout>
  );
};

export default Login;
