import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { User, Mail, Lock, Store, Phone, Globe, ArrowRight, AlertCircle, Cake, Sparkles } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bakeryName, setBakeryName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('role') === 'seller') {
      setRole('seller');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'seller' && !bakeryName.trim()) {
      setError('Bakery Brand Name is required for home baker sellers.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        preferredLanguage,
        phone: phone.trim(),
        bakeryName: role === 'seller' ? bakeryName.trim() : ''
      });

      // Navigate to OTP verification
      navigate('/verify-otp', {
        state: {
          email: res.email,
          purpose: 'signup_verification',
          cooldownSeconds: res.cooldownSeconds || 60
        }
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-14 bg-bakery-50">
      <div className="w-full max-w-lg animate-slide-up">

        {/* Decorative blobs */}
        <div className="fixed top-1/3 -right-20 w-64 h-64 rounded-full bg-caramel/8 blur-3xl pointer-events-none" />
        <div className="fixed bottom-1/3 -left-20 w-52 h-52 rounded-full bg-strawberry/8 blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-caramel to-amber-600 text-white shadow-warm-lg mb-1">
            <Cake className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-chocolate">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-sm text-bakery-600">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {/* Form Container */}
        <div className="card-bakery p-8">
          
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-bakery-200/60 rounded-xl mb-6 border border-bakery-200">
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`py-2.5 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                role === 'buyer'
                  ? 'bg-white text-chocolate shadow-sm border border-bakery-200'
                  : 'text-bakery-600 hover:text-chocolate'
              }`}
            >
              <User className="w-4 h-4 text-caramel" />
              <span>Buyer (Foodie)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`py-2.5 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                role === 'seller'
                  ? 'bg-white text-chocolate shadow-sm border border-bakery-200'
                  : 'text-bakery-600 hover:text-chocolate'
              }`}
            >
              <Store className="w-4 h-4 text-caramel" />
              <span>Seller (Home Baker)</span>
            </button>
          </div>

          {error && (
            <div className="alert-error mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                {t('auth.fullNameLabel')}
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-bakery-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder')}
                  required
                  className="input-bakery pl-11"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
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

            {/* Bakery Brand Name (Conditional if Seller) */}
            {role === 'seller' && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('auth.bakeryNameLabel')}</span>
                </div>
                <div className="relative">
                  <Store className="w-5 h-5 text-amber-600 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={bakeryName}
                    onChange={(e) => setBakeryName(e.target.value)}
                    placeholder={t('auth.bakeryNamePlaceholder')}
                    required={role === 'seller'}
                    className="input-bakery pl-11 bg-white"
                  />
                </div>
                <p className="text-[11px] text-amber-800">
                  Note: Sellers start in 'Pending' status and require Admin approval before publishing items.
                </p>
              </div>
            )}

            {/* Phone & Language Preference in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  {t('auth.phoneLabel')}
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-bakery-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('auth.phonePlaceholder')}
                    className="input-bakery pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  {t('auth.prefLangLabel')}
                </label>
                <div className="relative">
                  <Globe className="w-5 h-5 text-bakery-400 absolute left-3.5 top-3" />
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="input-bakery pl-11 appearance-none bg-white"
                  >
                    <option value="en">English</option>
                    <option value="ur">اردو (Urdu)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  {t('auth.passwordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-bakery-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    required
                    className="input-bakery pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  {t('auth.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-bakery-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="input-bakery pl-11"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-base shadow-warm mt-4"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.signUpBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Bottom CTA */}
        <p className="text-center mt-6 text-sm text-bakery-600">
          {t('auth.haveAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold text-caramel hover:text-caramel-dark underline underline-offset-4 transition-colors"
          >
            {t('auth.signInBtn')}
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
