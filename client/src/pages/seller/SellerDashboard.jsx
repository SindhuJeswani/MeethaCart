import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import api from '../../services/api';
import ThemePicker from '../../components/common/ThemePicker';
import {
  Store,
  Phone,
  MapPin,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  FileText,
  PlusCircle,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { fadeUp, buttonTap, TIMING, EASING } from '../../animations/motion';

const SellerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { setLang } = useTranslation();

  const [bakeryName, setBakeryName] = useState(user?.bakeryName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [preferredLanguage, setPreferredLanguage] = useState(
    user?.preferredLanguage || 'en'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const isApproved = user?.sellerStatus === 'approved';
  const isPending = user?.sellerStatus === 'pending';
  const isBlocked = user?.sellerStatus === 'blocked';

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    setError('');

    try {
      const res = await api.put('/users/profile', {
        bakeryName: bakeryName.trim(),
        bio: bio.trim(),
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
      setError(err.message || 'Failed to update bakery profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container py-8 space-y-8">
      {/* Seller Storefront Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="rounded-2xl bg-[#4A2C1A] text-white p-6 sm:p-8 shadow-warm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--nav-bg)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-caramel/20 text-caramel-light font-serif font-bold text-2xl flex items-center justify-center border border-caramel/40 shadow-xs uppercase">
            {user?.bakeryName?.charAt(0) || user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-caramel-light font-bold">
                Baker Studio
              </span>
              {isApproved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Storefront Approved
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Admin Approval
                </span>
              )}
              {isBlocked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-500/20 border border-rose-400/30 px-2 py-0.5 rounded-full">
                  <XCircle className="w-3.5 h-3.5" />
                  Account Suspended
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {user?.bakeryName || `${user?.name}'s Bakery`}
            </h1>
            <p className="text-white/70 text-xs mt-0.5">
              Owner: <strong className="text-white font-medium">{user?.name}</strong> ·{' '}
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isApproved && (
            <Link
              to={`/seller/${user?._id}`}
              className="btn-secondary text-xs py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-xs inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Storefront</span>
            </Link>
          )}
          {isApproved && (
            <Link
              to="/seller/items/new"
              className="btn-primary text-xs py-2 px-4 shadow-xs inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Bakery Item</span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Main Grid: Kitchen Settings Form + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Storefront Details Form */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 bg-white rounded-2xl border border-bakery-200 p-6 sm:p-8 shadow-warm space-y-6"
        >
          <div className="border-b border-bakery-200/80 pb-4">
            <h2 className="font-serif font-bold text-chocolate text-xl flex items-center gap-2">
              <Store className="w-5 h-5 text-caramel" />
              <span>Bakery Storefront & Kitchen Details</span>
            </h2>
            <p className="text-xs text-bakery-600 mt-1">
              Buyers in your city will see these details on your public bakery showcase.
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
                <span>Bakery details have been updated successfully!</span>
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
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                Bakery Brand Name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={bakeryName}
                  onChange={(e) => setBakeryName(e.target.value)}
                  className="input-bakery pl-10 font-bold"
                  placeholder="e.g. Fatima's Oven Art"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                Bakery Story & Specialties (Public)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-bakery pl-10"
                  placeholder="Describe your signature bakes (e.g. custom fondant cakes, Belgian brownies, pistachio nan khatai)..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  Baker Contact Phone
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
                Kitchen Address / Pickup Point (Karachi)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kitchen street address for customer pickup / dispatch (e.g. Clifton Block 4, Karachi)"
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
                <span>{isSaving ? 'Saving Changes...' : 'Save Bakery Details'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Right: Catalog Management & Storefront Links */}
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
            <h3 className="font-serif font-bold text-chocolate text-base">
              My Bakery Catalog
            </h3>
            <p className="text-xs text-bakery-600">
              {isApproved
                ? 'Manage your public menu listings, prices, images, and item availability.'
                : 'Item publishing unlocks as soon as Admin approves your baker profile.'}
            </p>

            <div className="pt-1 space-y-2">
              {isApproved ? (
                <>
                  <Link
                    to="/seller/items"
                    className="btn-secondary text-xs w-full py-2.5 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-caramel" />
                    <span>Manage Bakery Items</span>
                  </Link>
                  <Link
                    to="/seller/items/new"
                    className="btn-primary text-xs w-full py-2.5 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add New Bakery Item</span>
                  </Link>
                </>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center text-xs text-amber-900 font-medium">
                  Approval review in progress by MeethaCart Quality team.
                </div>
              )}
            </div>
          </motion.div>

          <div className="bg-white rounded-2xl border border-bakery-200 p-5 shadow-xs space-y-2.5">
            <h3 className="font-serif font-bold text-chocolate text-sm">
              Quick Shortcuts
            </h3>
            <div className="space-y-1.5 text-xs">
              {isApproved && (
                <Link
                  to={`/seller/${user?._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-bakery-100 transition-colors"
                >
                  <span className="font-medium text-bakery-800">Preview Public Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5 text-caramel" />
                </Link>
              )}
              <Link
                to="/items"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-bakery-100 transition-colors"
              >
                <span className="font-medium text-bakery-800">Browse Marketplace Catalog</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold">Catalog</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
