import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Info, Terminal } from 'lucide-react';

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
        // Direct to reset password form with the verified code
        navigate('/reset-password', {
          state: { email, otp: cleanOtp }
        });
        return;
      }

      setSuccessMsg('Verification successful! Redirecting...');
      
      // Determine redirection based on verified user's role
      const userRole = res.user?.role;
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
      setSuccessMsg(res.message || 'A fresh security code has been sent!');
      setCooldown(res.cooldownSeconds || 60);
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-14 bg-bakery-50">
      <div className="w-full max-w-md animate-slide-up">

        {/* Decorative blobs */}
        <div className="fixed top-1/4 -left-20 w-64 h-64 rounded-full bg-strawberry/8 blur-3xl pointer-events-none" />
        <div className="fixed bottom-1/4 -right-20 w-52 h-52 rounded-full bg-caramel/8 blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-caramel to-amber-600 text-white shadow-warm-lg mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-chocolate">
            {t('auth.verifyOtpTitle')}
          </h1>
          <p className="text-sm text-bakery-600">
            {t('auth.verifyOtpSubtitle')}{' '}
            <strong className="text-chocolate font-semibold">{email}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="card-bakery p-8">
          
          {error && (
            <div className="alert-error mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-success mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 6-Digit OTP Box */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-2 text-center">
                6-Digit Security Code
              </label>
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                autoFocus
                className="w-full text-center tracking-[12px] text-2xl font-mono font-bold py-3.5 px-4 rounded-xl border border-bakery-300 bg-white text-chocolate focus:ring-4 focus:ring-caramel/20 focus:border-caramel outline-none transition-all"
              />
              <p className="text-xs text-bakery-500 text-center mt-2">
                Code expires in 5 minutes • Single use only
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="btn-primary w-full py-3.5 text-base shadow-warm"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.verifyBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Cooldown Section */}
          <div className="mt-6 pt-5 border-t border-bakery-200/60 flex items-center justify-between text-sm">
            <span className="text-bakery-600">Didn't receive the code?</span>
            {cooldown > 0 ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-bakery-100 text-bakery-700">
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-xs font-bold text-caramel hover:text-caramel-dark flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{t('auth.resendOtp')}</span>
              </button>
            )}
          </div>

          {/* Dev Mode Reminder */}
          <div className="mt-5 alert-info text-xs">
            <Terminal className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900">Dev Testing Tip:</strong>{' '}
              <span className="text-amber-800/90">Check your backend terminal — OTP is printed as{' '}</span>
              <code className="bg-amber-200/70 px-1 py-0.5 rounded text-amber-950 font-mono font-bold">&gt;&gt;&gt; [OTP] &lt;&lt;&lt;</code>
            </div>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-xs font-medium text-bakery-600 hover:text-bakery-900 transition-colors"
          >
            ← {t('auth.backToLogin')}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;
