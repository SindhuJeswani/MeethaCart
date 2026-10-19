import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifySignupOtp, verifyLoginOtp, resendOtp, pendingAuth } = useAuth();
  const { t } = useTranslation();

  // Retrieve auth state from route transition or AuthContext pending state
  const email = location.state?.email || pendingAuth?.email || '';
  const purpose = location.state?.purpose || pendingAuth?.purpose || 'signup_verification';
  const initialCooldown = location.state?.cooldownSeconds || pendingAuth?.cooldownSeconds || 60;

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 60-second countdown interval
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
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
      }, 800);

    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setError('');
    setSuccessMsg('');

    try {
      setIsResending(true);
      const res = await resendOtp(email, purpose);
      setSuccessMsg(res.message || 'A fresh verification code has been sent.');
      setCooldown(res.cooldownSeconds || 60);
      setOtp('');
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
      {/* Delivery & Spam Disclaimer */}
      <div className="mb-4 p-3 rounded-lg bg-bakery-100 border border-bakery-200 text-xs text-bakery-800 flex items-start gap-2">
        <Info className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('auth.spamDisclaimer') || 'If you do not see the email in your inbox within a minute, please check your spam or junk folder.'}
        </p>
      </div>

      {error && (
        <div className="alert-error mb-4">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert-success mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* OTP Input */}
        <div>
          <label className="block text-xs font-semibold text-bakery-700 mb-1.5 text-center">
            {t('auth.enterOtp') || 'Enter 6-Digit Code'}
          </label>
          <input
            id="otp-input"
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-lg border border-bakery-300 focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition-all bg-bakery-50 text-chocolate font-bold"
            autoFocus
            autoComplete="one-time-code"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="verify-otp-btn"
          disabled={isSubmitting || otp.length !== 6}
          className="btn-primary w-full py-2.5 text-sm font-medium"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{t('auth.verifyButton') || 'Verify & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Resend OTP */}
        <div className="pt-2 text-center text-xs text-bakery-600">
          {cooldown > 0 ? (
            <p className="text-bakery-500">
              Resend code in <strong className="text-chocolate font-mono">{cooldown}s</strong>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-1 font-semibold text-caramel hover:text-caramel-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>Resend verification code</span>
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtp;
