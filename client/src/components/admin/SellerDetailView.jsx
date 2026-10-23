import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  Package,
  Cake,
  Star,
  Search,
  Filter,
  Eye,
  Power,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Layers,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  cardHover,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const SellerDetailView = ({ sellerId, onStatusChange, isModal = false, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'orders', 'account'
  const [copiedField, setCopiedField] = useState(null);
  const [togglingItemId, setTogglingItemId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Filters for Cake Inventory
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in_stock', 'low_stock', 'out_of_stock'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'eggless', 'regular'

  const toast = useToast();

  const fetchSellerDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/sellers/${sellerId}`);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load seller details:', err);
      setError(err.message || 'Failed to retrieve seller profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchSellerDetails();
    }
  }, [sellerId]);

  const handleCopy = (text, fieldName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Toggle cake availability
  const handleToggleItemAvailability = async (itemId, currentAvailability) => {
    try {
      setTogglingItemId(itemId);
      const res = await api.patch(`/items/${itemId}/availability`);
      if (res.data?.success) {
        toast.success(
          res.data.isAvailable
            ? 'Listing is now active.'
            : 'Listing has been paused.'
        );
        setData((prev) => {
          if (!prev) return prev;
          const updatedItems = prev.items.map((item) =>
            item._id === itemId ? { ...item, isAvailable: res.data.isAvailable } : item
          );
          const activeCount = updatedItems.filter((i) => i.isAvailable).length;
          return {
            ...prev,
            items: updatedItems,
            metrics: {
              ...prev.metrics,
              inventory: {
                ...prev.metrics.inventory,
                active: activeCount,
                inactive: updatedItems.length - activeCount
              }
            }
          };
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update listing status.');
    } finally {
      setTogglingItemId(null);
    }
  };

  // Update seller account status (approve / suspend)
  const handleUpdateSellerStatus = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const res = await api.patch(`/admin/sellers/${sellerId}/status`, {
        status: newStatus
      });
      if (res.data?.success) {
        toast.success(
          newStatus === 'approved'
            ? 'Seller approved successfully.'
            : newStatus === 'blocked'
            ? 'Seller account suspended.'
            : 'Seller status reset to pending review.'
        );
        setData((prev) => (prev ? { ...prev, seller: { ...prev.seller, sellerStatus: newStatus } } : prev));
        if (onStatusChange) {
          onStatusChange(sellerId, newStatus);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update seller status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-caramel animate-spin" />
        <p className="text-sm font-medium text-bakery-600">Loading seller details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-bold text-chocolate text-xl">Seller Not Found</h3>
        <p className="text-xs text-bakery-600">{error || 'Seller profile could not be retrieved.'}</p>
        <button onClick={fetchSellerDetails} className="btn-secondary text-xs py-2 px-4">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const { seller, items, metrics, orders } = data;

  // Extract unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(items.map((i) => i.category?.name).filter(Boolean))
  );

  // Filter cakes
  const filteredItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    if (availabilityFilter === 'active' && !item.isAvailable) return false;
    if (availabilityFilter === 'inactive' && item.isAvailable) return false;

    if (stockFilter === 'in_stock' && item.stock <= 5) return false;
    if (stockFilter === 'low_stock' && (item.stock > 5 || item.stock === 0)) return false;
    if (stockFilter === 'out_of_stock' && item.stock > 0) return false;

    if (categoryFilter !== 'all' && item.category?.name !== categoryFilter) return false;

    if (dietaryFilter === 'eggless' && !item.isEggless) return false;
    if (dietaryFilter === 'regular' && item.isEggless) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── 1. Top Seller Profile Header ── */}
      <div className="card-bakery p-6 bg-gradient-to-br from-white via-white to-amber-50/30 border border-bakery-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-warm">
              {seller.avatar ? (
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                (seller.bakeryName || seller.name || 'B').slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-chocolate">
                  {seller.bakeryName || `${seller.name}'s Bakery`}
                </h1>

                {/* Status Badge */}
                {seller.sellerStatus === 'approved' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approved</span>
                  </span>
                )}
                {seller.sellerStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Review</span>
                  </span>
                )}
                {seller.sellerStatus === 'blocked' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Suspended</span>
                  </span>
                )}

                {/* Email verification badge */}
                {seller.isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Unverified</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bakery-600">
                <span className="font-semibold text-chocolate flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-bakery-400" />
                  <span>{seller.name}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-bakery-400" />
                  <span>Joined {new Date(seller.createdAt).toLocaleDateString()}</span>
                </span>
                <span>•</span>
                <span className="text-[11px] font-mono text-bakery-400">ID: {seller._id}</span>
              </div>
            </div>
          </div>

          {/* Admin Control Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {seller.sellerStatus !== 'approved' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={buttonTap}
                disabled={statusUpdating}
                onClick={() => handleUpdateSellerStatus('approved')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Seller</span>
              </motion.button>
            )}

            {seller.sellerStatus !== 'blocked' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={buttonTap}
                disabled={statusUpdating}
                onClick={() => handleUpdateSellerStatus('blocked')}
                className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Suspend Seller</span>
              </motion.button>
            )}

            {seller.sellerStatus === 'blocked' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={buttonTap}
                disabled={statusUpdating}
                onClick={() => handleUpdateSellerStatus('pending')}
                className="px-3.5 py-2 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Reset to Pending</span>
              </motion.button>
            )}

            <Link
              to={`/seller/${seller._id}`}
              target="_blank"
              className="px-3.5 py-2 rounded-xl border border-bakery-300 text-chocolate hover:bg-bakery-100 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <span>Public Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-bakery-400 hover:text-bakery-700 hover:bg-bakery-100 transition-colors"
                title="Close modal"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-bakery-200/80 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-bakery-50/70 border border-bakery-200/60">
            <div className="flex items-center gap-2 text-bakery-700 overflow-hidden">
              <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{seller.email}</span>
            </div>
            <button
              onClick={() => handleCopy(seller.email, 'Email')}
              className="text-bakery-400 hover:text-chocolate ml-2 shrink-0"
              title="Copy email"
            >
              {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-bakery-50/70 border border-bakery-200/60">
            <div className="flex items-center gap-2 text-bakery-700 overflow-hidden">
              <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{seller.phone || 'No phone provided'}</span>
            </div>
            {seller.phone && (
              <button
                onClick={() => handleCopy(seller.phone, 'Phone')}
                className="text-bakery-400 hover:text-chocolate ml-2 shrink-0"
                title="Copy phone"
              >
                {copiedField === 'Phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bakery-50/70 border border-bakery-200/60 col-span-1 sm:col-span-2">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-bakery-700 truncate">
              {seller.address || 'No business address provided'}
            </span>
          </div>
        </div>

        {/* Bio / About */}
        {seller.bio && (
          <div className="mt-3 text-xs bg-amber-50/50 p-3 rounded-lg border border-amber-200/60 text-chocolate">
            <span className="font-bold text-amber-900 block mb-0.5">About the Baker:</span>
            <p className="text-bakery-700 leading-relaxed">{seller.bio}</p>
          </div>
        )}
      </div>

      {/* ── 2. Performance & Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="card-bakery p-4 space-y-1 border-l-4 border-l-amber-600 shadow-warm">
          <div className="flex items-center justify-between text-bakery-500">
            <span className="text-xs font-semibold">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-chocolate">
            PKR {metrics.totalSales?.toLocaleString() || '0'}
          </div>
          <p className="text-[11px] text-bakery-500 font-medium">Completed orders</p>
        </div>

        {/* Total Orders */}
        <div className="card-bakery p-4 space-y-1 border-l-4 border-l-sky-600 shadow-warm">
          <div className="flex items-center justify-between text-bakery-500">
            <span className="text-xs font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-chocolate">
            {metrics.totalOrders || 0}
          </div>
          <p className="text-[11px] text-sky-700 font-medium">
            {metrics.completedOrders || 0} completed • {metrics.pendingOrders || 0} pending
          </p>
        </div>

        {/* Total Listings */}
        <div className="card-bakery p-4 space-y-1 border-l-4 border-l-emerald-600 shadow-warm">
          <div className="flex items-center justify-between text-bakery-500">
            <span className="text-xs font-semibold">Total Listings</span>
            <Cake className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-chocolate">
            {metrics.inventory?.total || 0}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            {metrics.inventory?.active || 0} active • {metrics.inventory?.inactive || 0} paused
          </p>
        </div>

        {/* Seller Rating */}
        <div className="card-bakery p-4 space-y-1 border-l-4 border-l-amber-500 shadow-warm">
          <div className="flex items-center justify-between text-bakery-500">
            <span className="text-xs font-semibold">Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-chocolate flex items-center gap-1.5">
            <span>{metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : 'N/A'}</span>
            {metrics.averageRating > 0 && <span className="text-amber-500 text-sm">★</span>}
          </div>
          <p className="text-[11px] text-bakery-500 font-medium">
            {metrics.totalReviews || 0} reviews
          </p>
        </div>
      </div>

      {/* ── 3. Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-bakery-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-amber-600 text-chocolate'
              : 'border-transparent text-bakery-500 hover:text-bakery-800'
          }`}
        >
          <Cake className="w-4 h-4" />
          <span>Cake Listings ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-amber-600 text-chocolate'
              : 'border-transparent text-bakery-500 hover:text-bakery-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order History ({orders?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'account'
              ? 'border-amber-600 text-chocolate'
              : 'border-transparent text-bakery-500 hover:text-bakery-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Account Details</span>
        </button>
      </div>

      {/* ── TAB 1: Cake Listings ── */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="card-bakery p-4 space-y-3 bg-white">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-bakery-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cakes by title or keyword..."
                  className="input-bakery pl-9 text-xs py-2 w-full"
                />
              </div>

              {/* Status & Availability Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Availability Filter */}
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="input-bakery text-xs py-2 px-3"
                >
                  <option value="all">Status: All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Paused</option>
                </select>

                {/* Stock Filter */}
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="input-bakery text-xs py-2 px-3"
                >
                  <option value="all">Stock: All</option>
                  <option value="in_stock">In Stock (&gt; 5)</option>
                  <option value="low_stock">Low Stock (1-5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>

                {/* Category Filter */}
                {uniqueCategories.length > 0 && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="input-bakery text-xs py-2 px-3"
                  >
                    <option value="all">Category: All</option>
                    {uniqueCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}

                {/* Dietary Filter */}
                <select
                  value={dietaryFilter}
                  onChange={(e) => setDietaryFilter(e.target.value)}
                  className="input-bakery text-xs py-2 px-3"
                >
                  <option value="all">Diet: All</option>
                  <option value="eggless">Eggless Only</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>

            {/* Quick summary line */}
            <div className="flex items-center justify-between text-xs text-bakery-500 pt-2 border-t border-bakery-100">
              <span>
                Showing <b>{filteredItems.length}</b> of <b>{items.length}</b> listings
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Paused
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Out of Stock
                </span>
              </div>
            </div>
          </div>

          {/* Cake Inventory Grid */}
          {filteredItems.length === 0 ? (
            <div className="card-bakery p-12 text-center text-bakery-500 space-y-2">
              <Cake className="w-10 h-10 text-bakery-300 mx-auto" />
              <h4 className="font-serif font-bold text-chocolate text-base">No Listings Found</h4>
              <p className="text-xs">No items matched the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const isToggling = togglingItemId === item._id;
                const isOutOfStock = item.stock === 0;
                const isLowStock = item.stock > 0 && item.stock <= 5;
                const coverImage = item.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop';

                return (
                  <motion.div
                    key={item._id}
                    variants={staggerItem}
                    initial="hidden"
                    animate="visible"
                    className={`card-bakery overflow-hidden flex flex-col justify-between border transition-all duration-200 ${
                      item.isAvailable ? 'border-bakery-200 shadow-warm' : 'border-dashed border-slate-300 opacity-90 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      {/* Image Preview Container */}
                      <div className="relative aspect-[4/3] bg-bakery-100 overflow-hidden group">
                        <img
                          src={coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          {/* Availability status badge */}
                          {item.isAvailable ? (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600/90 backdrop-blur-xs text-white shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800/85 backdrop-blur-xs text-white shadow-xs flex items-center gap-1">
                              <Power className="w-3 h-3 text-slate-300" />
                              <span>Paused</span>
                            </span>
                          )}

                          {/* Stock status badge */}
                          {isOutOfStock ? (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-600/90 backdrop-blur-xs text-white shadow-xs">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/95 backdrop-blur-xs text-white shadow-xs">
                              Only {item.stock} left
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 backdrop-blur-xs text-bakery-800 shadow-2xs">
                              {item.stock} in stock
                            </span>
                          )}
                        </div>

                        {/* Dietary Pill Bottom Left */}
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                          {item.isEggless && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700/85 backdrop-blur-xs text-white shadow-2xs">
                              🌿 100% Eggless
                            </span>
                          )}
                          {item.images?.length > 1 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                              +{item.images.length - 1} photos
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-2">
                        {/* Category & Prep Time */}
                        <div className="flex items-center justify-between text-[11px] text-bakery-500">
                          <span className="font-semibold text-amber-700 uppercase tracking-wider">
                            {item.category?.name || 'Bakery Item'}
                          </span>
                          <span>⏱️ {item.preparationTimeHours || 24}h notice</span>
                        </div>

                        {/* Title */}
                        <h4 className="font-serif font-bold text-chocolate text-base leading-snug line-clamp-1">
                          {item.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-bakery-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Price & ID */}
                        <div className="pt-2 flex items-baseline justify-between border-t border-bakery-100">
                          <div className="font-serif font-bold text-lg text-chocolate">
                            PKR {item.price?.toLocaleString()}
                          </div>
                          <span className="text-[10px] font-mono text-bakery-400">
                            ID: {item._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions Bar on Card */}
                    <div className="p-3 bg-bakery-50/70 border-t border-bakery-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/items/${item._id}`}
                        target="_blank"
                        className="text-xs font-semibold text-bakery-700 hover:text-chocolate flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-bakery-200/60 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-bakery-500" />
                        <span>View Item</span>
                      </Link>

                      {/* Admin Toggle Availability Button */}
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={buttonTap}
                        disabled={isToggling}
                        onClick={() => handleToggleItemAvailability(item._id, item.isAvailable)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs ${
                          item.isAvailable
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isToggling ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : item.isAvailable ? (
                          <>
                            <Power className="w-3.5 h-3.5 text-rose-600" />
                            <span>Pause Listing</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Activate Listing</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Order History ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="card-bakery p-0 overflow-hidden shadow-warm">
            <div className="p-4 bg-bakery-100/60 border-b border-bakery-200 flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-chocolate text-base">
                  Order History
                </h4>
                <p className="text-xs text-bakery-500">
                  All customer orders placed with {seller.bakeryName || seller.name}
                </p>
              </div>
              <div className="text-xs font-bold text-chocolate px-3 py-1 rounded-full bg-white border border-bakery-200">
                Total Revenue: PKR {metrics.totalSales?.toLocaleString() || '0'}
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-bakery-500 space-y-2">
                <ShoppingBag className="w-10 h-10 text-bakery-300 mx-auto" />
                <h5 className="font-serif font-bold text-chocolate text-base">No Orders Found</h5>
                <p className="text-xs max-w-sm mx-auto">
                  This seller has not received any customer orders yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-bakery-50 border-b border-bakery-200 text-bakery-600 uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-4">Order & Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bakery-100">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-chocolate">#{order._id.slice(-6)}</div>
                          <div className="text-bakery-500 text-[11px]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-chocolate">{order.buyer?.name || 'Customer'}</div>
                          <div className="text-bakery-500 text-[11px]">{order.buyer?.email || 'N/A'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {order.items?.map((it, idx) => (
                              <div key={idx} className="text-bakery-700">
                                <b>{it.quantity}x</b> {it.title || it.item?.title || 'Bakery Item'}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-chocolate">
                          PKR {order.totalAmount?.toLocaleString()}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] capitalize ${
                              order.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : order.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : order.status === 'confirmed'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: Account Details ── */}
      {activeTab === 'account' && (
        <div className="card-bakery p-6 space-y-6">
          <div>
            <h4 className="font-serif font-bold text-chocolate text-base">
              Account Details
            </h4>
            <p className="text-xs text-bakery-500">
              Overview of seller registration and profile information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-bakery-50/70 border border-bakery-200/70 space-y-1">
              <span className="text-bakery-400 font-semibold uppercase tracking-wider text-[10px]">Account ID</span>
              <div className="font-mono text-chocolate font-bold select-all">{seller._id}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-bakery-50/70 border border-bakery-200/70 space-y-1">
              <span className="text-bakery-400 font-semibold uppercase tracking-wider text-[10px]">Account Type</span>
              <div className="font-bold text-chocolate capitalize">{seller.role}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-bakery-50/70 border border-bakery-200/70 space-y-1">
              <span className="text-bakery-400 font-semibold uppercase tracking-wider text-[10px]">Approval Status</span>
              <div className="font-bold text-chocolate capitalize">{seller.sellerStatus}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-bakery-50/70 border border-bakery-200/70 space-y-1">
              <span className="text-bakery-400 font-semibold uppercase tracking-wider text-[10px]">Email Status</span>
              <div className="font-bold text-chocolate">{seller.isVerified ? 'Verified' : 'Pending Verification'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-bakery-50/70 border border-bakery-200/70 space-y-1">
              <span className="text-bakery-400 font-semibold uppercase tracking-wider text-[10px]">Language Preference</span>
              <div className="font-bold text-chocolate">{seller.preferredLanguage === 'ur' ? 'Urdu (اردو)' : 'English'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-bakery-50/70 border border-bakery-200/70 space-y-1">
              <span className="text-bakery-400 font-semibold uppercase tracking-wider text-[10px]">Registration Date</span>
              <div className="font-bold text-chocolate">{new Date(seller.createdAt).toLocaleString()}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-bakery-50/70 border border-bakery-200/70 space-y-1">
              <span className="text-bakery-400 font-semibold uppercase tracking-wider text-[10px]">Last Updated</span>
              <div className="font-bold text-chocolate">{new Date(seller.updatedAt).toLocaleString()}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-bakery-50/70 border border-bakery-200/70 space-y-1">
              <span className="text-bakery-400 font-semibold uppercase tracking-wider text-[10px]">Business Address</span>
              <div className="font-bold text-chocolate">{seller.address || 'None provided'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDetailView;
