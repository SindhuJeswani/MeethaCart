import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import api from '../../services/api';
import ThemePicker from '../../components/common/ThemePicker';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Store,
  Sparkles,
  Heart
} from 'lucide-react';
import { fadeUp, buttonTap, TIMING, EASING } from '../../animations/motion';

const BuyerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { setLang } = useTranslation();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [preferredLanguage, setPreferredLanguage] = useState(
    user?.preferredLanguage || 'en'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    setError('');

    try {
      const res = await api.put('/users/profile', {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        preferredLanguage
      });

      if (res.data?.success) {
        updateUser(res.data.user);
        setLang(preferredLanguage);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container py-8 space-y-8">
      {/* Buyer Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="rounded-2xl bg-[#4A2C1A] text-white p-6 sm:p-8 shadow-warm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--nav-bg)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-caramel/20 text-caramel-light font-serif font-bold text-2xl flex items-center justify-center border border-caramel/40 shadow-xs uppercase">
            {user?.name?.charAt(0) || 'B'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-caramel-light font-bold">
                Customer Profile
              </span>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {user?.name}
            </h1>
            <p className="text-white/70 text-xs mt-0.5">
              Email: <strong className="text-white font-medium">{user?.email}</strong>
            </p>
          </div>
        </div>

        <Link
          to="/items"
          className="btn-primary text-xs py-2 px-4 shadow-xs self-start sm:self-auto inline-flex items-center gap-1.5"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Browse Fresh Bakes</span>
        </Link>
      </motion.div>

      {/* Main Grid: Profile Form + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Profile Edit Form */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 bg-white rounded-2xl border border-bakery-200 p-6 sm:p-8 shadow-warm space-y-6"
        >
          <div className="border-b border-bakery-200/80 pb-4">
            <h2 className="font-serif font-bold text-chocolate text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-caramel" />
              <span>Personal Details & Preferences</span>
            </h2>
            <p className="text-xs text-bakery-600 mt-1">
              Update your delivery address, contact details, and preferred display language.
            </p>
          </div>

          <AnimatePresence>
            {savedSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile changes have been updated successfully!</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-bakery pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  Verified Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-bakery pl-10 bg-bakery-100/70 text-bakery-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  Preferred Language
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="input-bakery pl-10 appearance-none bg-white font-medium"
                  >
                    <option value="en">English (Default)</option>
                    <option value="ur">اردو (Urdu)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                Saved Delivery Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, street, sector, city (e.g. PECHS Block 2, Karachi)"
                  className="input-bakery pl-10"
                />
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={buttonTap}
                type="submit"
                disabled={isSaving}
                className="btn-primary py-2.5 px-6 text-xs inline-flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Right: Theme Picker & Milestone 3 Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-bakery-200 p-5 shadow-xs">
            <ThemePicker variant="settings" />
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl border border-bakery-200 p-5 shadow-xs space-y-3"
          >
            <h3 className="font-serif font-bold text-chocolate text-sm">
              Marketplace Exploration
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                to="/items"
                className="flex items-center justify-between p-2.5 rounded-lg bg-bakery-50 hover:bg-bakery-100 transition-colors border border-bakery-200/60"
              >
                <div className="flex items-center gap-2 font-semibold text-chocolate">
                  <ShoppingBag className="w-4 h-4 text-caramel" />
                  <span>Browse Bakery Items</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">Catalog</span>
              </Link>

              <Link
                to="/register?role=seller"
                className="flex items-center justify-between p-2.5 rounded-lg bg-bakery-50 hover:bg-bakery-100 transition-colors border border-bakery-200/60"
              >
                <div className="flex items-center gap-2 font-semibold text-chocolate">
                  <Store className="w-4 h-4 text-caramel" />
                  <span>Become a Baker / Seller</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">Apply</span>
              </Link>
            </div>
          </motion.div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Heart className="w-4 h-4 text-caramel fill-caramel" />
              <span>Homemade Quality Promise</span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Every item on MeethaCart is prepared fresh by registered home bakers with strict hygiene standards and genuine artisan ingredients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
