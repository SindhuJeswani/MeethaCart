import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  Store,
  Phone,
  MapPin,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ShoppingBag,
  Info,
  Clock,
  Sparkles,
  Globe
} from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const SellerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { t, isUrdu } = useTranslation();
  const toast = useToast();

  const [bakeryName, setBakeryName] = useState(user?.bakeryName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setBakeryName(user.bakeryName || '');
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setPreferredLanguage(user.preferredLanguage || 'en');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSavedSuccess(false);
    setIsSaving(true);

    try {
      const res = await api.put('/users/profile', {
        bakeryName,
        bio,
        phone,
        address,
        preferredLanguage
      });

      if (res.data?.success && res.data?.user) {
        if (updateUser) {
          updateUser(res.data.user);
        }
        setSavedSuccess(true);
        toast.success(isUrdu ? 'بیکری کی تفصیلات کامیابی سے محفوظ ہوگئیں!' : 'Bakery profile updated successfully!');
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const isApproved = user?.status === 'approved';

  return (
    <div className="page-container py-8 space-y-8 max-w-5xl mx-auto">
      {/* Hero Seller Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="rounded-2xl bg-chocolate text-white p-6 sm:p-8 shadow-warm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
      >
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-caramel/20 text-caramel-light font-serif font-bold text-2xl flex items-center justify-center border border-caramel/40 shadow-xs"
          >
            {user?.bakeryName?.charAt(0) || user?.name?.charAt(0) || 'B'}
          </motion.div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-caramel font-semibold">
                Home Baker Portal
              </span>
              {isApproved ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved Baker</span>
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Pending Approval</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {user?.bakeryName || (user?.name ? user.name + "'s Bakery" : 'Artisan Bakery')}
            </h1>
            <p className="text-white/70 text-xs mt-0.5">
              Owner: <strong className="text-white font-medium">{user?.name}</strong> · {user?.email}
            </p>
          </div>
        </div>

        {isApproved && (
          <Link
            to={`/seller/${user._id}`}
            className="btn-secondary text-xs py-2 px-4 bg-white/10 hover:bg-white/20 text-white border-white/20 self-start sm:self-auto shadow-xs"
          >
            <span>View Public Storefront →</span>
          </Link>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Edit Bakery Info */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 bg-white rounded-2xl border border-bakery-200 p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="border-b border-bakery-100 pb-3">
            <h2 className="font-serif font-bold text-chocolate text-xl">
              Storefront Profile & Kitchen Info
            </h2>
            <p className="text-xs text-bakery-600 mt-0.5">
              This information is displayed publicly to buyers browsing your bakery.
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
                  placeholder="e.g. Grandma's Oven Delight"
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
                  placeholder="Describe your signature bakes (e.g. custom fondant cakes, lotus brownies, pistachio nan khatai)..."
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
                    className="input-bakery pl-10 appearance-none bg-white"
                  >
                    <option value="en">English (Default)</option>
                    <option value="ur">اردو (Urdu)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                Kitchen Address / Pickup Point
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kitchen street address for customer pickup / dispatch"
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

        {/* Right: Catalog Shortcut & Upcoming Services */}
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
              My Bakery Treats
            </h3>
            <p className="text-xs text-bakery-600">
              {isApproved
                ? 'Manage your public menu listings and pricing.'
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
                    <span>View Catalog & Recipes</span>
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
              Baker Shortcuts
            </h3>
            <div className="space-y-1 text-xs">
              <Link to="/custom-requests" className="flex items-center justify-between p-2 rounded-lg hover:bg-bakery-100 transition-colors">
                <span className="font-medium text-bakery-800">Bid on Custom Cakes</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold">New Bids</span>
              </Link>
              <Link to="/wallet" className="flex items-center justify-between p-2 rounded-lg hover:bg-bakery-100 transition-colors">
                <span className="font-medium text-bakery-800">Baker Wallet & Payouts</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">Instant</span>
              </Link>
              <Link to="/notifications" className="flex items-center justify-between p-2 rounded-lg hover:bg-bakery-100 transition-colors">
                <span className="font-medium text-bakery-800">Baker Notifications</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold">Alerts</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
