import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Globe,
  Clock,
  Package,
  XCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { fadeUp, buttonTap, TIMING, EASING } from '../../animations/motion';

const BuyerDashboard = () => {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile'
  const [orderFilter, setOrderFilter] = useState('active'); // 'active' | 'completed' | 'rejected'

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Orders State (M6 Order History)
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      setOrdersError('');
      const res = await api.get('/orders/my-orders');
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      setOrdersError('Unable to load orders. Please try again.');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavedSuccess(false);
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Name cannot be empty');
      return;
    }

    if (phone.trim()) {
      const cleanDigits = phone.trim().replace(/[\s-]/g, '');
      if (!/^(03\d{9}|\+923\d{9}|\d{10,13})$/.test(cleanDigits)) {
        setProfileError('Invalid phone number');
        return;
      }
    }

    try {
      setIsSaving(true);
      const res = await api.put('/users/profile', {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        preferredLanguage
      });

      if (res.data?.success) {
        updateUser(res.data.user);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Server error. Profile was not updated.');
    } finally {
      setIsSaving(false);
    }
  };

  // Group orders into Active, Completed, and Rejected
  const activeOrders = orders.filter((o) =>
    ['placed', 'accepted', 'preparing', 'ready'].includes((o.status || '').toLowerCase())
  );
  const completedOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'completed');
  const rejectedOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'rejected');

  const displayedOrders =
    orderFilter === 'active'
      ? activeOrders
      : orderFilter === 'completed'
      ? completedOrders
      : rejectedOrders;

  return (
    <div className="page-container py-8 space-y-8">
      {/* Buyer Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="rounded-2xl text-white p-6 sm:p-8 shadow-warm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--nav-bg)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 text-white font-serif font-bold text-2xl flex items-center justify-center border border-white/20 shadow-xs uppercase">
            {user?.name?.charAt(0) || 'B'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-200 font-bold">
                Customer Account
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
              Email: <strong className="text-white font-medium">{user?.email}</strong> | Language: <strong className="text-white font-medium">{user?.preferredLanguage || 'English'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/items"
            className="btn-primary text-xs py-2 px-4 shadow-xs self-start sm:self-auto inline-flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Browse Bakery</span>
          </Link>
        </div>
      </motion.div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-bakery-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'orders'
              ? 'bg-[#1C2B5E] text-white shadow-xs'
              : 'text-bakery-600 hover:text-bakery-900 bg-white border border-bakery-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders</span>
          {orders.length > 0 && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
              {orders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'profile'
              ? 'bg-[#1C2B5E] text-white shadow-xs'
              : 'text-bakery-600 hover:text-bakery-900 bg-white border border-bakery-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Preferences</span>
        </button>
      </div>

      {/* Orders Tab Content (M6 Order History) */}
      {activeTab === 'orders' && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
          {/* Sub-filter tabs for Orders */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-bakery-100 rounded-xl border border-bakery-200">
              <button
                onClick={() => setOrderFilter('active')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderFilter === 'active'
                    ? 'bg-white text-chocolate shadow-xs'
                    : 'text-bakery-600 hover:text-chocolate'
                }`}
              >
                Active ({activeOrders.length})
              </button>
              <button
                onClick={() => setOrderFilter('completed')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderFilter === 'completed'
                    ? 'bg-white text-chocolate shadow-xs'
                    : 'text-bakery-600 hover:text-chocolate'
                }`}
              >
                Completed ({completedOrders.length})
              </button>
              <button
                onClick={() => setOrderFilter('rejected')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderFilter === 'rejected'
                    ? 'bg-white text-chocolate shadow-xs'
                    : 'text-bakery-600 hover:text-chocolate'
                }`}
              >
                Rejected ({rejectedOrders.length})
              </button>
            </div>

            <button
              onClick={fetchOrders}
              className="text-xs text-bakery-600 hover:text-chocolate flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Orders Error State */}
          {ordersError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{ordersError}</span>
              </div>
              <button onClick={fetchOrders} className="underline font-bold text-xs">
                Retry
              </button>
            </div>
          )}

          {/* Orders Loading State */}
          {isLoadingOrders ? (
            <div className="card-bakery p-12 text-center text-bakery-600 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
              <span className="text-sm">Loading your orders...</span>
            </div>
          ) : orders.length === 0 ? (
            /* Global Empty State */
            <div className="card-bakery p-12 text-center text-bakery-600 space-y-3">
              <Package className="w-12 h-12 text-bakery-300 mx-auto" />
              <h3 className="font-serif font-bold text-chocolate text-lg">
                You have not placed any orders yet
              </h3>
              <p className="text-xs text-bakery-600 max-w-sm mx-auto">
                Discover delicious homemade treats from local home bakers in your city.
              </p>
              <Link to="/items" className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4 mt-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Browse Bakery Catalog</span>
              </Link>
            </div>
          ) : displayedOrders.length === 0 ? (
            /* Category Filter Empty State */
            <div className="card-bakery p-10 text-center text-bakery-600 space-y-2">
              <p className="text-sm font-semibold">
                No {orderFilter} orders found.
              </p>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {displayedOrders.map((order) => {
                const statusLower = (order.status || '').toLowerCase();
                const isRejected = statusLower === 'rejected';
                const isCompleted = statusLower === 'completed';

                return (
                  <motion.div
                    key={order._id}
                    layout
                    className="card-bakery p-5 sm:p-6 transition-all hover:border-caramel/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bakery-200/70 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-chocolate">
                            #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isRejected
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-xs text-bakery-500">
                            • COD (Cash on Delivery)
                          </span>
                        </div>
                        <p className="text-xs text-bakery-600 mt-1">
                          Bakery: <strong className="text-chocolate font-medium">{order.seller?.bakeryName || order.seller?.name || 'Local Baker'}</strong> | Placed on: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-xs text-bakery-500 block">Total</span>
                          <strong className="text-base text-chocolate font-bold">
                            Rs. {order.totalAmount?.toLocaleString()}
                          </strong>
                        </div>
                        <Link
                          to={`/orders/${order._id}`}
                          className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1 hover:bg-bakery-100"
                        >
                          <span>Track Order</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Order items snapshot */}
                    <div className="pt-3">
                      <div className="text-xs text-bakery-700 font-medium space-y-1">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-bakery-800">
                              {it.quantity}x {it.name || it.item?.title || 'Bakery Item'}
                              {it.selectedSize && ` (${it.selectedSize})`}
                              {it.selectedFlavor && ` - ${it.selectedFlavor}`}
                            </span>
                            <span className="text-bakery-600">
                              Rs. {(it.price * it.quantity)?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {isRejected && order.rejectionReason && (
                        <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                          <strong>Rejection reason:</strong> {order.rejectionReason}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Profile & Preferences Tab Content */}
      {activeTab === 'profile' && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-3xl bg-white rounded-2xl border border-bakery-200 p-6 sm:p-8 shadow-warm space-y-6"
        >
          <div className="border-b border-bakery-200/80 pb-4">
            <h2 className="font-serif font-bold text-chocolate text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-caramel" />
              <span>Personal Details & Preferences</span>
            </h2>
            <p className="text-xs text-bakery-600 mt-1">
              Update your delivery address, preferred language, and contact details.
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

            {profileError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{profileError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
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
                    className="input-bakery pl-10"
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
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
      )}
    </div>
  );
};

export default BuyerDashboard;