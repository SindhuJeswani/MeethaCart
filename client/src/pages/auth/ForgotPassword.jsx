import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please provide your registered email address.');
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
            cooldownSeconds: res.data?.cooldownSeconds || 60
          }
        });
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
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
      {error && (
        <div className="alert-error mb-4">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-success mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-bakery-700 mb-1.5">
            {t('auth.emailLabel') || 'Email address'}
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
              className="input-bakery pl-10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 text-sm font-medium mt-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{t('auth.sendCode') || 'Send verification code'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
