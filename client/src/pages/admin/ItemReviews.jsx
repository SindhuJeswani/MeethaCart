import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useToast } from '../../context/ToastContext';
import fallbackImg from '../../assets/fallback-item.jpg';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
  Cake,
  ExternalLink,
  Store,
  DollarSign,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const ItemReviews = () => {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Reject modal state
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError('');

      let url = '/admin/items';
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      } else {
        params.append('status', 'all');
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      if (res.data?.success) {
        setItems(res.data.items || []);
        if (res.data.pendingCount !== undefined) {
          setPendingCount(res.data.pendingCount);
        }
      }
    } catch (err) {
      console.error('Failed to load items for review:', err);
      setError(err.message || 'Failed to retrieve bakery items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleAccept = async (itemId, title) => {
    try {
      setIsSubmitting(true);
      const res = await api.patch(`/admin/items/${itemId}/accept`);
      if (res.data?.success) {
        toast.success(`"${title}" has been approved and is now live.`);
        // Refresh or update list
        fetchItems();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Server error';
      toast.error(msg);
      if (msg.includes('already been reviewed')) {
        fetchItems();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectModal = (item) => {
    setRejectingItem(item);
    setRejectionReason('');
    setRejectError('');
  };

  const closeRejectModal = () => {
    setRejectingItem(null);
    setRejectionReason('');
    setRejectError('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError('Please enter a reason for rejection');
      return;
    }

    try {
      setIsSubmitting(true);
      setRejectError('');
      const res = await api.patch(`/admin/items/${rejectingItem._id}/reject`, {
        reason: rejectionReason.trim()
      });

      if (res.data?.success) {
        toast.info(`"${rejectingItem.title}" was rejected.`);
        closeRejectModal();
        fetchItems();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Server error';
      if (msg.includes('already been reviewed')) {
        toast.error(msg);
        closeRejectModal();
        fetchItems();
      } else {
        setRejectError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getThumbnail = (img) => {
    if (!img) return fallbackImg;
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
    if (img.startsWith('/uploads/')) return `http://localhost:5000${img}`;
    if (img.startsWith('uploads/')) return `http://localhost:5000/${img}`;
    return img;
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-bakery-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 max-w-6xl space-y-6 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal, ease: EASING.out }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bakery-200/80 pb-5"
        >
          <div>
            <span className="section-eyebrow">Catalog Governance</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2 mt-0.5">
              <Cake className="w-7 h-7 text-amber-600" />
              <span>Item Reviews</span>
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              Review and approve home baker recipes and menu items before they go live on the public marketplace.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={buttonTap}
            onClick={fetchItems}
            disabled={isLoading}
            className="btn-secondary text-xs font-semibold py-2 px-3 self-start sm:self-auto flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </motion.div>

        {error && (
          <div className="alert-error">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="card-bakery p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-bakery-100 rounded-xl border border-bakery-200 overflow-x-auto">
            {[
              { id: 'Pending', label: 'Pending', badge: pendingCount },
              { id: 'Approved', label: 'Approved' },
              { id: 'Rejected', label: 'Rejected' },
              { id: 'all', label: 'All Items' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'text-chocolate'
                    : 'text-bakery-600 hover:text-chocolate'
                }`}
              >
                {statusFilter === tab.id && (
                  <motion.div
                    layoutId="item-status-tab"
                    className="absolute inset-0 bg-white rounded-lg shadow-xs border border-bakery-200/80"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="relative z-10 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-2xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-bakery-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="input-bakery pl-9 text-xs py-2 transition-all focus:ring-2 focus:ring-caramel/20"
            />
          </form>
        </div>

        {/* Item Cards / List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="card-bakery p-12 text-center text-sm text-bakery-600 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
              <span>Loading items for review...</span>
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-bakery p-12 text-center text-bakery-600 space-y-2"
            >
              <Cake className="w-10 h-10 text-bakery-300 mx-auto" />
              <h3 className="font-serif font-bold text-chocolate text-base">No Items Found</h3>
              <p className="text-xs max-w-sm mx-auto">
                {statusFilter === 'Pending'
                  ? 'Great job! There are no pending bakery items awaiting moderation right now.'
                  : 'No bakery items matched the selected status filter.'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                    className="card-bakery p-5 hover:shadow-warm transition-all border border-bakery-200"
                  >
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Pictures */}
                      <div className="shrink-0 flex md:flex-col gap-2">
                        <img
                          src={getThumbnail(item.images?.[0])}
                          alt={item.title}
                          className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover border border-bakery-200 shadow-xs"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImg;
                          }}
                        />
                        {item.images?.length > 1 && (
                          <div className="flex md:grid md:grid-cols-3 gap-1 max-w-[144px]">
                            {item.images.slice(1, 4).map((img, idx) => (
                              <img
                                key={idx}
                                src={getThumbnail(img)}
                                alt=""
                                className="w-8 h-8 rounded-md object-cover border border-bakery-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = fallbackImg;
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 space-y-2.5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif font-bold text-chocolate text-base sm:text-lg">
                                {item.title}
                              </h3>
                              {item.category?.name && (
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-bakery-100 text-bakery-800">
                                  {item.category.name}
                                </span>
                              )}
                            </div>

                            {/* Seller Attribution */}
                            <div className="flex items-center gap-2 text-xs text-bakery-600 mt-1">
                              <Store className="w-3.5 h-3.5 text-amber-700" />
                              <span className="font-semibold text-chocolate">
                                {item.seller?.bakeryName || `${item.seller?.name}'s Bakery`}
                              </span>
                              <span>•</span>
                              <span>{item.seller?.name}</span>
                              {item.seller?.email && (
                                <>
                                  <span>•</span>
                                  <span className="text-bakery-500">{item.seller.email}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Approval Status Badge */}
                          <div>
                            {item.approvalStatus === 'Approved' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Approved</span>
                              </span>
                            ) : item.approvalStatus === 'Rejected' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
                                <span>Pending Review</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-bakery-700 leading-relaxed bg-bakery-50/70 p-3 rounded-xl border border-bakery-200/60">
                          {item.description}
                        </p>

                        {/* Price & Meta Badges */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                          <span className="font-bold text-chocolate text-sm">
                            PKR {Number(item.price || 0).toLocaleString()}
                          </span>
                          <span className="text-bakery-500">•</span>
                          <span className="text-bakery-700 font-medium">
                            Stock: <strong>{item.stock ?? 0} units</strong>
                          </span>
                          <span className="text-bakery-500">•</span>
                          <span className="text-bakery-700 font-medium">
                            Prep Time: <strong>{item.preparationTimeHours || 24}h</strong>
                          </span>
                          {item.isEggless && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              🌿 100% Eggless
                            </span>
                          )}
                          {item.allowsCustomization && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              ✨ Customization Allowed
                            </span>
                          )}
                        </div>

                        {/* Sizes & Flavors (if specified) */}
                        {((item.sizes && item.sizes.length > 0) || (item.flavors && item.flavors.length > 0)) && (
                          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                            {item.sizes && item.sizes.length > 0 && (
                              <div className="flex items-center gap-1 text-bakery-600">
                                <span className="font-semibold text-chocolate">Sizes:</span>
                                {item.sizes.map((s, idx) => (
                                  <span key={idx} className="bg-bakery-100 px-1.5 py-0.5 rounded text-bakery-800">
                                    {s.name} ({s.price ? `PKR ${s.price}` : 'base'})
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.flavors && item.flavors.length > 0 && (
                              <div className="flex items-center gap-1 text-bakery-600">
                                <span className="font-semibold text-chocolate">Flavors:</span>
                                {item.flavors.map((f, idx) => (
                                  <span key={idx} className="bg-bakery-100 px-1.5 py-0.5 rounded text-bakery-800">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Rejection reason box if rejected */}
                        {item.approvalStatus === 'Rejected' && item.rejectionReason && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                            <strong className="block font-bold uppercase tracking-wider text-rose-700">
                              Rejection Reason Given:
                            </strong>
                            <span>{item.rejectionReason}</span>
                          </div>
                        )}

                        {/* Action buttons (only for Pending items) */}
                        {item.approvalStatus === 'Pending' && (
                          <div className="flex items-center gap-3 pt-3 border-t border-bakery-200">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={buttonTap}
                              disabled={isSubmitting}
                              onClick={() => handleAccept(item._id, item.title)}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accept (Approve)</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={buttonTap}
                              disabled={isSubmitting}
                              onClick={() => openRejectModal(item)}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject with Reason</span>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal with Reason Input */}
      <AnimatePresence>
        {rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="card-bakery max-w-lg w-full p-6 space-y-4 shadow-xl border border-bakery-200"
            >
              <div className="flex items-center justify-between border-b border-bakery-200 pb-3">
                <h3 className="font-serif font-bold text-chocolate text-lg flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Reject Item Submission</span>
                </h3>
                <button
                  onClick={closeRejectModal}
                  className="text-bakery-400 hover:text-bakery-700 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div>
                <p className="text-xs text-bakery-600">
                  You are rejecting <strong>"{rejectingItem.title}"</strong> submitted by{' '}
                  <strong>{rejectingItem.seller?.bakeryName || rejectingItem.seller?.name}</strong>.
                </p>
                <p className="text-xs text-bakery-500 mt-1">
                  Please provide a clear reason explaining what needs to be corrected. The seller will see this reason in their dashboard.
                </p>
              </div>

              {rejectError && (
                <div className="alert-error text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{rejectError}</span>
                </div>
              )}

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-chocolate mb-1">
                    Rejection Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Please upload clear photos with a plain background, or clarify ingredients..."
                    className="input-bakery w-full text-xs p-3 focus:ring-2 focus:ring-rose-500/20"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeRejectModal}
                    className="btn-secondary text-xs py-2 px-4"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={buttonTap}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Rejecting...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Confirm Rejection</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemReviews;
