import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { User, Mail, Phone, MapPin, Globe, Save, CheckCircle2, AlertCircle, ShoppingBag, Heart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuyerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { t, setLang } = useTranslation();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        preferredLanguage
      });
      // Synchronize language context
      setLang(preferredLanguage);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-white rounded-3xl p-8 mb-8 shadow-warm-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Verified Buyer Account
          </div>
          <h1 className="text-3xl font-serif font-bold text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-amber-200/90 text-sm mt-1 max-w-xl">
            Explore authentic homemade bakery treats, handcrafted custom cakes, and traditional sweets from talented local home bakers.
          </p>
        </div>

        <Link
          to="/items"
          className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Fresh Treats</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Settings */}
        <div className="lg:col-span-2">
          <div className="card-bakery">
            <div className="flex items-center gap-3 pb-6 border-b border-bakery-200/80 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-chocolate">Profile & Preferences</h2>
                <p className="text-xs text-bakery-600">Manage your contact details and bilingual language preference</p>
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
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
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
                    Email Address (Verified)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-bakery pl-10 bg-bakery-100/70 text-bakery-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                    Phone Number
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
                    Preferred Language (FYP Bilingual)
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
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Street / City address for bakery deliveries"
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
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Activity & Future Modules Quick Cards */}
        <div className="space-y-6">
          <div className="card-bakery">
            <h3 className="font-serif font-bold text-chocolate text-lg mb-3">Order Activity</h3>
            <div className="p-4 rounded-xl bg-bakery-100/70 border border-bakery-200 text-center py-8">
              <Clock className="w-8 h-8 text-amber-600/70 mx-auto mb-2" />
              <p className="text-sm font-semibold text-bakery-800">No active orders yet</p>
              <p className="text-xs text-bakery-500 mt-1">Orders and cart module will be linked in upcoming FYP module.</p>
              <Link to="/items" className="btn-outline text-xs mt-4 py-2 px-4 inline-flex">
                Explore Bakery Items
              </Link>
            </div>
          </div>

          <div className="card-bakery bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
              <Heart className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>Homemade Quality Promise</span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Every item on MeethaCart is prepared fresh by registered home bakers with strict hygiene standards and genuine artisan ingredients.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BuyerDashboard;
