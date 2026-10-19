import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Mail, Lock, ArrowRight, AlertCircle, Info, Cake, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(email, password);
      navigate('/verify-otp', {
        state: {
          email: res.email,
          purpose: 'login_2fa',
          cooldownSeconds: res.cooldownSeconds || 60,
          from: location.state?.from
        }
      });
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-14 bg-bakery-50">

      {/* Decorative blobs */}
      <div className="fixed top-1/4 -left-20 w-72 h-72 rounded-full bg-caramel/8 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-60 h-60 rounded-full bg-strawberry/8 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-slide-up">

        {/* Top Icon & Heading */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-caramel to-amber-600 text-white shadow-warm-lg mb-1">
            <Cake className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-chocolate">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-sm text-bakery-600">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="card-bakery p-8 space-y-6">

          {error && (
            <div className="alert-error">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="label-bakery">{t('auth.emailLabel')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  autoComplete="email"
                  className="input-bakery pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-bakery mb-0">{t('auth.passwordLabel')}</label>
                <Link to="/forgot-password" className="text-xs font-medium text-caramel hover:text-caramel-dark transition-colors">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  autoComplete="current-password"
                  className="input-bakery pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bakery-400 hover:text-bakery-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-base"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.signInBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dev mode notice */}
          <div className="alert-info text-xs">
            <Info className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
            <span>
              <strong>Dev OTP:</strong> In development mode, the 6-digit OTP is printed in the server terminal after submitting.
            </span>
          </div>
        </div>

        {/* Bottom CTA */}
        <p className="text-center mt-6 text-sm text-bakery-600">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-caramel hover:text-caramel-dark underline underline-offset-4 transition-colors">
            {t('auth.signUpBtn')}
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
