import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Info, Check } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  shakeVariant,
  staggerContainer,
  staggerItem,
  fadeIn,
  popIn,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifySignupOtp, verifyLoginOtp, resendOtp, pendingAuth } = useAuth();
  const { t } = useTranslation();

  const email = location.state?.email || pendingAuth?.email || '';
  const purpose = location.state?.purpose || pendingAuth?.purpose || 'signup_verification';
  const initialCooldown = location.state?.cooldownSeconds || pendingAuth?.cooldownSeconds || 60;
  const initialDevOtp = location.state?.devOtp || pendingAuth?.devOtp || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [activeIdx, setActiveIdx] = useState(0);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [devOtp, setDevOtp] = useState(initialDevOtp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Circular timer calculations (r = 26, circumference = ~163.36)
  const RADIUS = 26;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const timerProgress = Math.max(0, Math.min(1, cooldown / 60));
  const strokeDashoffset = CIRCUMFERENCE * (1 - timerProgress);

  // 60-second countdown interval with leak-free cleanup
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // If no email is provided, redirect to login
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Auto focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError('');

    if (char && index < 5) {
      setActiveIdx(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        setActiveIdx(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIdx(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      setActiveIdx(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    const nextIdx = Math.min(pasted.length, 5);
    setActiveIdx(nextIdx);
    inputRefs.current[nextIdx]?.focus();
  };

  const fillDevOtp = (code) => {
    if (!code) return;
    const split = code.split('').slice(0, 6);
    const newDigits = ['', '', '', '', '', ''];
    split.forEach((c, i) => {
      newDigits[i] = c;
    });
    setDigits(newDigits);
    setActiveIdx(5);
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanOtp = digits.join('').trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      triggerShake();
      return;
    }

    try {
      setIsSubmitting(true);
      let res;

      if (purpose === 'signup_verification') {
        res = await verifySignupOtp(email, cleanOtp);
      } else if (purpose === 'login_2fa') {
        res = await verifyLoginOtp(email, cleanOtp);
      } else if (purpose === 'password_reset') {
        navigate('/reset-password', {
          state: { email, otp: cleanOtp }
        });
        return;
      }

      setIsSuccess(true);
      setSuccessMsg('Verification successful! Redirecting...');

      const userRole = res?.user?.role;
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'seller') {
          navigate('/seller/dashboard', { replace: true });
        } else {
          navigate('/buyer/dashboard', { replace: true });
        }
      }, 950);
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setError('');
    setSuccessMsg('');

    try {
      setIsResending(true);
      const res = await resendOtp(email, purpose);
      setSuccessMsg(res.message || 'A fresh verification code has been sent.');
      if (res.devOtp) setDevOtp(res.devOtp);
      setCooldown(res.cooldownSeconds || 60);
      setDigits(['', '', '', '', '', '']);
      setActiveIdx(0);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const benefits = [
    'Protecting your account and transactions with two-factor security',
    'Instant verification code sent directly to your registered email',
    'No complicated passwords needed for quick access recovery'
  ];

  const fullCodeLength = digits.join('').length;

  return (
    <AuthLayout
      headline="Secure Email OTP Verification"
      benefits={benefits}
      footerNote="2-Step Security Check"
      formTitle="Verify your email"
      formSubtitle={email ? `We sent a 6-digit verification code to ${email}` : 'Enter your 6-digit verification code'}
      footerLinkText="Need to start over?"
      footerLinkAction="Back to sign in"
      footerLinkTo="/login"
    >
      {/* Dev Mode Banner (Quick fill for developer convenience) */}
      <AnimatePresence>
        {devOtp && (
          <motion.div
            key="dev-otp-card"
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4 p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <span>???</span> Dev Mode Helper
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => fillDevOtp(devOtp)}
                className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors shadow-xs"
              >
                Auto-fill Code
              </motion.button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black tracking-widest text-amber-900">
                {devOtp}
              </span>
              <span className="text-xs text-amber-700">
                (Logged for development testing)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delivery & Spam Disclaimer */}
      <div className="mb-4 p-3 rounded-lg bg-bakery-100 border border-bakery-200 text-xs text-bakery-800 flex items-start gap-2">
        <Info className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('auth.spamDisclaimer') || 'If you do not see the email in your inbox within a minute, please check your spam or junk folder.'}
        </p>
      </div>

      {/* Error alert with slide-in */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="alert-error mb-4"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success alert with slide-in */}
      <AnimatePresence>
        {successMsg && !isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="alert-success mb-4"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Celebration Screen */}
      <AnimatePresence>
        {isSuccess ? (
          <motion.div
            key="success-celebration"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 flex flex-col items-center justify-center text-center space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-400 relative">
              <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 52 52">
                <circle
                  className="stroke-emerald-200"
                  cx="26"
                  cy="26"
                  r="24"
                  fill="none"
                  strokeWidth="3"
                />
                <path
                  className="animate-check-draw stroke-emerald-600"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l7 7 16-16"
                />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-emerald-800">
              Verified Successfully!
            </h3>
            <p className="text-xs text-bakery-600">
              Taking you to your dashboard now...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 Individual Staggered OTP Input Boxes */}
            <div>
              <label className="block text-xs font-semibold text-bakery-700 mb-2 text-center">
                {t('auth.enterOtp') || 'Enter 6-Digit Verification Code'}
              </label>

              <motion.div
                variants={shakeVariant}
                animate={isShaking ? 'shake' : 'idle'}
                className="flex items-center justify-center gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                <motion.div
                  variants={staggerContainer(0.05)}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2 sm:gap-3"
                >
                  {digits.map((digit, index) => {
                    const isActive = activeIdx === index;
                    const hasValue = digit !== '';
                    return (
                      <motion.div
                        key={index}
                        variants={staggerItem}
                        whileHover={{ y: -2 }}
                        animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                        transition={{ duration: 0.18 }}
                      >
                        <input
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onFocus={() => setActiveIdx(index)}
                          onChange={(e) => handleDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className={`w-11 h-14 sm:w-12 sm:h-16 text-center font-mono text-2xl font-bold rounded-xl border transition-all duration-200 outline-none select-none
                            ${
                              isShaking
                                ? 'border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                                : isActive
                                ? 'border-caramel bg-white text-chocolate ring-4 ring-caramel/20 shadow-md scale-105'
                                : hasValue
                                ? 'border-caramel/50 bg-amber-50/40 text-chocolate'
                                : 'border-bakery-300 bg-bakery-50/70 text-bakery-800 hover:border-bakery-400'
                            }`}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </div>

            {/* Circular Progress Timer & Resend Section */}
            <div className="pt-2 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-20 h-20 mb-1">
                {/* SVG Progress Ring */}
                <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 64 64">
                  {/* Track Circle */}
                  <circle
                    cx="32"
                    cy="32"
                    r={RADIUS}
                    className="stroke-bakery-200"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  {/* Animated Countdown Progress Ring */}
                  <circle
                    cx="32"
                    cy="32"
                    r={RADIUS}
                    className={`transition-all duration-1000 ease-linear ${
                      cooldown > 0 ? 'stroke-caramel' : 'stroke-emerald-500'
                    }`}
                    strokeWidth="3.5"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Number or Complete Badge in Middle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {cooldown > 0 ? (
                      <motion.div
                        key="seconds-count"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center"
                      >
                        <span className="font-mono text-base font-bold text-chocolate leading-none">
                          {cooldown}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-bakery-500 mt-0.5">
                          sec
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="timer-done"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.25, 1] }}
                        transition={{ duration: 0.3 }}
                        className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs"
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Resend OTP button */}
              <div className="h-9 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {cooldown <= 0 ? (
                    <motion.button
                      key="active-resend"
                      initial={{ opacity: 0, scale: 0.9, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={buttonTap}
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs text-caramel bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                      <span>{t('auth.resendOtp') || 'Resend verification code'}</span>
                    </motion.button>
                  ) : (
                    <motion.p
                      key="waiting-text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-bakery-500"
                    >
                      Resend available in <strong className="text-chocolate font-mono">{cooldown}s</strong>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={fullCodeLength === 6 ? { scale: 1.015, y: -1 } : {}}
              whileTap={fullCodeLength === 6 ? buttonTap : {}}
              type="submit"
              id="verify-otp-btn"
              disabled={isSubmitting || fullCodeLength !== 6}
              className="btn-primary w-full py-2.5 text-sm font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.verifyButton') || 'Verify & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default VerifyOtp;
