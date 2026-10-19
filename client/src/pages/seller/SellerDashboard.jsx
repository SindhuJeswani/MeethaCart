import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import {
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Save,
  Phone,
  MapPin,
  Globe,
  FileText,
  PlusCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { t, setLang } = useTranslation();

  const [bakeryName, setBakeryName] = useState(user?.bakeryName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const publicLink = `${window.location.origin}/seller/${user?.id || user?._id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');

    try {
      await updateProfile({
        bakeryName: bakeryName.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        address: address.trim(),
        preferredLanguage
      });
      setLang(preferredLanguage);
      setSuccess('Bakery storefront updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update bakery profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const isApproved = user?.sellerStatus === 'approved';
  const isPending = user?.sellerStatus === 'pending';
  const isBlocked = user?.sellerStatus === 'blocked';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 text-white rounded-3xl p-8 shadow-warm-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/30 flex items-center justify-center text-amber-200">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-300 font-bold block">
                Baker Studio
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {user?.bakeryName || `${user?.name}'s Bakery`}
              </h1>
            </div>
          </div>
          <p className="text-amber-200/90 text-sm max-w-xl">
            Welcome to your baker command center. Manage your public bakery storefront, monitor customer orders, and publish artisanal sweets.
          </p>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {isApproved && (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t('seller.approvedBadge')}</span>
            </div>
          )}
          {isPending && (
            <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 font-bold text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{t('seller.pendingBadge')}</span>
            </div>
          )}
          {isBlocked && (
            <div className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 font-bold text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{t('seller.blockedBadge')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pending Approval Warning Banner */}
      {isPending && (
        <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300/80 text-amber-950 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-amber-950">
              {t('seller.pendingBannerTitle')}
            </h3>
            <p className="text-sm text-amber-900/90 leading-relaxed">
              {t('seller.pendingBannerDesc')}
            </p>
            <p className="text-xs text-amber-800/80 font-medium pt-1">
              • You can still edit your bakery bio, contact details, and test your public storefront link below.
            </p>
          </div>
        </div>
      )}

      {/* Storefront Shareable Link Card */}
      <div className="card-bakery bg-white border-bakery-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Shareable Storefront Link</span>
            </div>
            <p className="text-xs text-bakery-600">
              Share this dedicated URL with your customers on WhatsApp, Instagram, or Facebook.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="btn-secondary text-xs py-2 px-3.5 flex-1 sm:flex-initial"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? t('seller.linkCopied') : t('seller.copyLink')}</span>
            </button>
            <Link
              to={`/seller/${user?.id || user?._id}`}
              target="_blank"
              className="btn-primary text-xs py-2 px-3.5 flex-1 sm:flex-initial"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t('seller.publicLink')}</span>
            </Link>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-bakery-50 border border-bakery-200 font-mono text-xs text-bakery-800 break-all select-all">
          {publicLink}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Storefront Profile Form */}
        <div className="lg:col-span-2">
          <div className="card-bakery">
            <div className="flex items-center gap-3 pb-6 border-b border-bakery-200/80 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-chocolate">Bakery Brand Details</h2>
                <p className="text-xs text-bakery-600">Update how customers perceive your bakery storefront</p>
              </div>
            </div>

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              
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
                    required
                    className="input-bakery pl-10 font-medium"
                    placeholder="e.g. Grandma's Oven Delight"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  Bakery Story & Bio (Public)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input-bakery pl-10"
                    placeholder="Tell buyers about your specialty (e.g. customized fondant cakes, fresh almond nan khatai, Belgian brownies)..."
                  />
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
                    Preferred Dashboard Language
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="input-bakery pl-10 appearance-none bg-white"
                    >
                      <option value="en">English</option>
                      <option value="ur">اردو (Urdu)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  Bakery Kitchen Address / Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Kitchen address for customer pickup / dispatch"
                    className="input-bakery pl-10"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary py-2.5 px-6"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Bakery Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Bakery Catalog Shortcut */}
        <div className="space-y-6">
          <div className="card-bakery">
            <h3 className="font-serif font-bold text-chocolate text-lg mb-2">
              {t('seller.myBakeryItems')}
            </h3>
            <p className="text-xs text-bakery-600 mb-4">
              {isApproved
                ? 'Your active bakery listings and recipes.'
                : 'Item publishing unlocks as soon as Admin approves your baker profile.'}
            </p>

            <div className="p-5 rounded-xl bg-bakery-50 border border-bakery-200 text-center space-y-3">
              <Store className="w-8 h-8 text-amber-600/70 mx-auto" />
              <div className="text-xs font-semibold text-bakery-800">
                {isApproved ? 'Manage Bakery Treats' : 'Awaiting Approval'}
              </div>
              <p className="text-[11px] text-bakery-500">
                {isApproved
                  ? 'Add photos, custom prices, ingredients, and preparation times.'
                  : 'Item publishing unlocks as soon as Admin approves your baker profile.'}
              </p>
              {isApproved && (
                <div className="space-y-2 pt-1">
                  <Link
                    to="/seller/items"
                    className="btn-secondary text-xs w-full py-2 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                    <span>View My Catalog</span>
                  </Link>
                  <Link
                    to="/seller/items/new"
                    className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('seller.addNewItem')}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Seller Tools & Upcoming Modules */}
          <div className="card-bakery space-y-3 bg-white border border-bakery-200">
            <h3 className="font-serif font-bold text-chocolate text-base">
              Storefront Tools
            </h3>
            <div className="space-y-1.5 text-xs">
              <Link to="/seller/analytics" className="flex items-center justify-between p-2 rounded-md hover:bg-bakery-100 transition-colors">
                <span className="font-medium text-bakery-800">Sales Analytics</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">Soon</span>
              </Link>
              <Link to="/seller/demand-forecasting" className="flex items-center justify-between p-2 rounded-md hover:bg-bakery-100 transition-colors">
                <span className="font-medium text-bakery-800">AI Demand Forecast</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">Soon</span>
              </Link>
              <Link to="/messages" className="flex items-center justify-between p-2 rounded-md hover:bg-bakery-100 transition-colors">
                <span className="font-medium text-bakery-800">Customer Chat</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">Soon</span>
              </Link>
              <Link to="/wallet" className="flex items-center justify-between p-2 rounded-md hover:bg-bakery-100 transition-colors">
                <span className="font-medium text-bakery-800">Payouts & Wallet</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">Soon</span>
              </Link>
            </div>
          </div>

          <div className="card-bakery bg-bakery-100 border-bakery-200">
            <div className="flex items-center gap-2 text-chocolate font-bold text-xs mb-2">
              <Info className="w-4 h-4 text-caramel" />
              <span>Baker Quality & Hygiene Guidelines</span>
            </div>
            <p className="text-xs text-bakery-700 leading-relaxed">
              To preserve authentic taste and food safety, all listed treats must be prepared fresh with premium ingredients and safely packaged.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SellerDashboard;
