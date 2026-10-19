import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

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
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/auth/reset-password', {
        email,
        otp: otp.trim(),
        newPassword
      });

      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-bakery-50">
      {/* Decorative Warm Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-caramel/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-strawberry/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-caramel to-amber-600 text-white shadow-warm flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-chocolate">
            Set New Password
          </h1>
          <p className="text-sm text-bakery-600 mt-2">
            Enter the 6-digit OTP and choose a strong password for{' '}
            <strong className="text-bakery-900">{email}</strong>
          </p>
        </div>

        <div className="card-bakery p-8 relative overflow-hidden">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-2">
                6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                required
                className="input-bakery text-center tracking-[8px] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-2">
                {t('auth.newPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-bakery-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="input-bakery pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-2">
                {t('auth.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-bakery-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="input-bakery pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base shadow-warm"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.resetPasswordBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

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

export default ResetPassword;
