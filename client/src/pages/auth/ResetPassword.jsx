import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import { shakeVariant, buttonTap } from '../../animations/motion';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const email = location.state?.email || '';
  const initialOtp = location.state?.otp || '';

  const [otp, setOtp] = useState(initialOtp);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('A valid 6-digit OTP code is required.');
      triggerShake();
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      triggerShake();
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/auth/reset-password', {
        email,
        otp: otp.trim(),
        newPassword
      });

      setSuccess('Password updated successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    'Create a strong password with at least 8 characters',
    'Protect your account orders, listings, and customer data',
    'Instant login access immediately after password update'
  ];

  return (
    <AuthLayout
      headline="Create your new password"
      benefits={benefits}
      footerNote="Password Security Protection"
      formTitle="Reset your password"
      formSubtitle={email ? `Enter new password for ${email}` : 'Enter your new account password'}
      footerLinkText="Return to"
      footerLinkAction="Sign in"
      footerLinkTo="/login"
    >
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

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="mb-5 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        variants={shakeVariant}
        animate={isShaking ? 'shake' : 'idle'}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* OTP Code Input */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
            6-Digit Verification Code <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <KeyRound className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              required
              className="input-bakery pl-11 text-center font-mono font-bold tracking-widest text-lg"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
            New password <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              autoComplete="new-password"
              className="input-bakery pl-11"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
            Confirm new password <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              autoComplete="new-password"
              className="input-bakery pl-11"
            />
          </div>
        </div>

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
              <span>Update password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.form>
    </AuthLayout>
  );
};

export default ResetPassword;
