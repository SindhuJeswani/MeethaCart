import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Store, Phone, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import RoleChoiceModal from '../../components/common/RoleChoiceModal';
import {
  shakeVariant,
  fadeUp,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const Register = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();

  // Role determined strictly by query param (?role=buyer | ?role=seller) or router state
  const queryRole = searchParams.get('role') || location.state?.role;
  const initialRole = queryRole === 'seller' || queryRole === 'buyer' ? queryRole : '';

  const [role, setRole] = useState(initialRole);
  const [showRoleModal, setShowRoleModal] = useState(!initialRole);

  const [name, setName] = useState(location.state?.name || '');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [bakeryName, setBakeryName] = useState(location.state?.bakeryName || '');
  const [phone, setPhone] = useState(location.state?.phone || '');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Sync role if query parameters change
  useEffect(() => {
    const r = searchParams.get('role') || location.state?.role;
    if (r === 'seller' || r === 'buyer') {
      setRole(r);
      setShowRoleModal(false);
    } else {
      setRole('');
      setShowRoleModal(true);
    }
  }, [searchParams, location.state]);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setShowRoleModal(false);
    setSearchParams({ role: selectedRole });
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!role) {
      setShowRoleModal(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      triggerShake();
      return;
    }

    if (role === 'seller' && !bakeryName.trim()) {
      setError('Bakery name is required for sellers.');
      triggerShake();
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim(),
        bakeryName: role === 'seller' ? bakeryName.trim() : ''
      });

      if (res?.success) {
        navigate('/verify-otp', {
          state: {
            email: email.trim(),
            role,
            formData: {
              name: name.trim(),
              phone: phone.trim(),
              bakeryName: role === 'seller' ? bakeryName.trim() : ''
            },
            message: 'A 6-digit verification code has been sent to your email.'
          }
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      const field = err.response?.data?.field;
      if (
        field === 'email' ||
        msg.includes('email') ||
        msg.includes('domain') ||
        msg.includes('Temporary') ||
        msg.includes('verification code')
      ) {
        setEmailError(msg);
      } else {
        setError(msg);
      }
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellerBenefits = [
    'Create your bespoke online bakery storefront in minutes',
    'List custom cakes, artisan breads, and traditional desserts',
    'Receive orders directly from customers in your local area'
  ];

  const buyerBenefits = [
    'Freshly made bakes from verified local home bakers',
    'Request custom designs, weights, and delivery dates',
    'Order handcrafted cakes, mithai and treats'
  ];

  const isSeller = role === 'seller';

  return (
    <>
      <RoleChoiceModal
        isOpen={showRoleModal}
        onClose={() => {
          if (!role) {
            navigate('/', { replace: true });
          } else {
            setShowRoleModal(false);
          }
        }}
        onSelectRole={handleSelectRole}
      />

      <AuthLayout
        headline={
          isSeller
            ? 'Start selling your homemade treats today'
            : 'Join MeethaCart to discover local homemade bakes'
        }
        benefits={isSeller ? sellerBenefits : buyerBenefits}
        footerNote="Secure Email OTP Verification"
        formTitle={isSeller ? 'Create a seller account' : 'Create a buyer account'}
        formSubtitle={
          isSeller
            ? 'Register as a certified home baker seller'
            : 'Register to order fresh baked celebration cakes'
        }
        footerLinkText="Already have an account?"
        footerLinkAction="Sign in"
        footerLinkTo="/login"
      >
        {/* Role Heading Badge (Non-clickable label) */}
        <div className="mb-6 p-3 rounded-xl bg-amber-50/70 border border-amber-950/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isSeller ? (
              <Store className="w-4 h-4 text-caramel" />
            ) : (
              <User className="w-4 h-4 text-caramel" />
            )}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-bakery-500 block">
                Account Type
              </span>
              <span className="text-xs sm:text-sm font-bold text-chocolate">
                {isSeller ? 'Home Baker & Seller' : 'Buyer (Sweet Lover)'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-bakery-600 bg-white px-2 py-0.5 rounded-md border border-amber-950/[0.08]">
            Selected
          </span>
        </div>

        {/* Animated Error Alert */}
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

        <motion.form
          variants={shakeVariant}
          animate={isShaking ? 'shake' : 'idle'}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
              Full name <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <User className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ayesha Khan"
                required
                className="input-bakery pl-11"
              />
            </div>
          </div>

          {/* Bakery Name (Only for Sellers) */}
          {isSeller && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
                Bakery name <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Store className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
                <input
                  type="text"
                  value={bakeryName}
                  onChange={(e) => setBakeryName(e.target.value)}
                  placeholder="e.g. Sweet Delights Bakery"
                  required
                  className="input-bakery pl-11"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
              Email address <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                  if (error) setError('');
                }}
                placeholder="name@example.com"
                required
                autoComplete="email"
                className={`input-bakery pl-11 ${emailError ? 'border-rose-400 focus:border-rose-500' : ''}`}
              />
            </div>
            {emailError && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
              Phone number <span className="text-[10px] text-bakery-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative group">
              <Phone className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                className="input-bakery pl-11"
              />
            </div>
          </div>

          {/* Password & Confirm with Eye Show/Hide Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  autoComplete="new-password"
                  className="input-bakery pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bakery-400 hover:text-bakery-700 transition-colors p-1.5 rounded-lg hover:bg-bakery-100 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-bakery-700/90 mb-2">
                Confirm password <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-bakery-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-caramel transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  autoComplete="new-password"
                  className="input-bakery pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bakery-400 hover:text-bakery-700 transition-colors p-1.5 rounded-lg hover:bg-bakery-100 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit with scale & spinner */}
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
                <span>{isSeller ? 'Create seller account' : 'Create buyer account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.form>

        <div className="pt-4 border-t border-amber-950/[0.06] mt-6 flex items-center gap-2 text-xs text-bakery-600 bg-amber-50/40 p-3 rounded-xl border border-amber-950/[0.04]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">A 6-digit verification code will be sent to your email.</span>
        </div>
      </AuthLayout>
    </>
  );
};

export default Register;
