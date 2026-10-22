import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import { shakeVariant, buttonTap } from '../../animations/motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please provide your registered email address.');
      triggerShake();
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });

      setSuccess('Reset code sent! Redirecting to verification...');
      setTimeout(() => {
        navigate('/verify-otp', {
          state: {
            email: email.trim().toLowerCase(),
            purpose: 'password_reset',
            cooldownSeconds: res.data?.cooldownSeconds || 60,
            devOtp: res.data?.devOtp
          }
        });
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    'Quick recovery via your verified email address',
    'Secure 6-digit one-time authorization code',
    'Set a new strong password and regain access instantly'
  ];

  return (
    <AuthLayout
      headline="Reset your account password"
      benefits={benefits}
      footerNote="Account Security & Recovery"
      formTitle={t('auth.forgotTitle') || 'Forgot password?'}
      formSubtitle={t('auth.forgotSubtitle') || 'Enter your email address and we will send you a verification code.'}
      footerLinkText="Remembered your password?"
      footerLinkAction="Back to sign in"
      footerLinkTo="/login"
    >
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

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="alert-success mb-4"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        variants={shakeVariant}
        animate={isShaking ? 'shake' : 'idle'}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-bakery-700 mb-1.5">
            {t('auth.emailLabel') || 'Email address'} <span className="text-red-500">*</span>
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
              <span>{t('auth.sendCode') || 'Send verification code'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.form>
    </AuthLayout>
  );
};

export default ForgotPassword;
