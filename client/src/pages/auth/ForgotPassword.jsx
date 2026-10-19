import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';
import { Mail, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';

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

      setSuccess('Reset code dispatched! Check your email or terminal.');
      setTimeout(() => {
        navigate('/verify-otp', {
          state: {
            email: email.trim().toLowerCase(),
            purpose: 'password_reset',
            cooldownSeconds: res.data?.cooldownSeconds || 60
          }
        });
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-14 bg-bakery-50">
      <div className="w-full max-w-md animate-slide-up">
        
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-caramel to-amber-600 text-white shadow-warm-lg mb-1">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-chocolate">
            {t('auth.forgotTitle')}
          </h1>
          <p className="text-sm text-bakery-600">
            {t('auth.forgotSubtitle')}
          </p>
        </div>

        <div className="card-bakery p-8">
          
          {error && (
            <div className="alert-error mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-success mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-2">
                {t('auth.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-bakery-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
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
                  <span>{t('auth.sendResetOtp')}</span>
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

export default ForgotPassword;
