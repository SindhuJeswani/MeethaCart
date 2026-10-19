import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { User, Mail, Lock, Store, Phone, Globe, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';

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
  const { register } = useAuth();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  const [preferredLanguage, setPreferredLanguage] = useState(lang || 'en');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lang) {
      setPreferredLanguage(lang);
    }
  }, [lang]);

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
      setError('Bakery name is required for seller registration.');
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

  const sellerBenefits = [
    'Create your online storefront in minutes',
    'List custom cakes, cookies, traditional mithai, and more',
    'Receive orders directly from buyers in your local area'
  ];

  const buyerBenefits = [
    'Freshly made bakes from verified local home bakers',
    'Request custom designs, weights, and dates',
    'Bilingual interface supporting English and اردو'
  ];

  return (
    <AuthLayout
      headline={
        role === 'seller'
          ? 'Start selling your homemade treats today'
          : 'Join MeethaCart to discover local homemade bakes'
      }
      benefits={role === 'seller' ? sellerBenefits : buyerBenefits}
      footerNote="Secure Email OTP Verification"
      formTitle="Create an account"
      formSubtitle={
        role === 'seller'
          ? 'Register as a home baker seller'
          : 'Register to order fresh baked items'
      }
      footerLinkText="Already have an account?"
      footerLinkAction="Sign in"
      footerLinkTo="/login"
    >
      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-bakery-100 rounded-lg mb-5 border border-bakery-200">
        <button
          type="button"
          id="role-buyer"
          onClick={() => setRole('buyer')}
          className={`py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
            role === 'buyer'
              ? 'bg-white text-chocolate shadow-sm border border-bakery-200'
              : 'text-bakery-600 hover:text-chocolate'
          }`}
        >
          <User className="w-3.5 h-3.5 text-caramel" />
          <span>Buyer</span>
        </button>
        <button
          type="button"
          id="role-seller"
          onClick={() => setRole('seller')}
          className={`py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
            role === 'seller'
              ? 'bg-white text-chocolate shadow-sm border border-bakery-200'
              : 'text-bakery-600 hover:text-chocolate'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-caramel" />
          <span>Seller (Baker)</span>
        </button>
      </div>

      {error && (
        <div className="alert-error mb-4">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-bakery-700 mb-1">
            Full name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="input-bakery pl-10"
            />
          </div>
        </div>

        {/* Bakery Name (Only for Sellers) */}
        {role === 'seller' && (
          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1">
              Bakery or brand name
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={bakeryName}
                onChange={(e) => setBakeryName(e.target.value)}
                placeholder="e.g. Sara's Kitchen Bakes"
                required
                className="input-bakery pl-10"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-bakery-700 mb-1">
            Email address
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

        {/* Phone & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1">
              Phone number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                className="input-bakery pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1">
              Language
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="input-bakery pl-10"
              >
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                autoComplete="new-password"
                className="input-bakery pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                className="input-bakery pl-10"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 text-sm font-medium mt-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-3 border-t border-bakery-100 mt-4 flex items-center gap-1.5 text-xs text-bakery-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>We will send an OTP code to your email to verify your account.</span>
      </div>
    </AuthLayout>
  );
};

export default Register;
