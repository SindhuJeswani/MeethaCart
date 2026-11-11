import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import SellerDetailModal from '../../components/admin/SellerDetailModal';
import { useToast } from '../../context/ToastContext';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Store,
  RefreshCw,
  AlertCircle,
  Cake,
  Eye,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const SellerApprovals = () => {
  const [sellers, setSellers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState(null);

  // Reject Modal State
  const [rejectModalSeller, setRejectModalSeller] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const toast = useToast();

  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      setError('');

      let url = '/admin/sellers';
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      if (res.data?.success) {
        setSellers(res.data.sellers || []);
      }
    } catch (err) {
      console.error('Failed to load sellers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to retrieve sellers list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSellers();
  };

  const handleUpdateStatus = async (sellerId, newStatus) => {
    try {
      const res = await api.patch(`/admin/sellers/${sellerId}/status`, {
        status: newStatus
      });

      if (res.data?.success) {
        toast.success(
          newStatus === 'approved'
            ? 'Seller approved successfully.'
            : newStatus === 'blocked'
            ? 'Seller suspended.'
            : 'Seller status updated.'
        );
        setSellers((prev) =>
          prev.map((s) => (s._id === sellerId ? { ...s, sellerStatus: newStatus, approvedAt: new Date() } : s))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server error. Account was not approved.');
    }
  };

  const handleOpenRejectModal = (seller) => {
    setRejectModalSeller(seller);
    setRejectReason('');
    setRejectError('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setRejectError('Please enter a reason for rejection');
      return;
    }

    try {
      setIsSubmittingReject(true);
      setRejectError('');
      const res = await api.patch(`/admin/sellers/${rejectModalSeller._id}/status`, {
        status: 'rejected',
        reason: rejectReason.trim()
      });

      if (res.data?.success) {
        toast.success('Seller request rejected.');
        setSellers((prev) =>
          prev.map((s) =>
            s._id === rejectModalSeller._id
              ? { ...s, sellerStatus: 'rejected', rejectionReason: rejectReason.trim() }
              : s
          )
        );
        setRejectModalSeller(null);
      }
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Server error. Request was not rejected.');
    } finally {
      setIsSubmittingReject(false);
    }
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
            <span className="section-eyebrow">Seller Management</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate mt-0.5">
              Sellers
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={buttonTap}
            onClick={fetchSellers}
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
          {/* Status Tabs with animated highlight */}
          <div className="flex items-center gap-1.5 p-1 bg-bakery-100 rounded-xl border border-bakery-200 overflow-x-auto">
            {['all', 'pending', 'approved', 'rejected', 'blocked'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'text-chocolate'
                    : 'text-bakery-600 hover:text-chocolate'
                }`}
              >
                {statusFilter === st && (
                  <motion.div
                    layoutId="seller-status-tab"
                    className="absolute inset-0 bg-white rounded-lg shadow-xs border border-bakery-200/80"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{st}</span>
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
              placeholder="Search by bakery or seller name..."
              className="input-bakery pl-9 text-xs py-2 transition-all focus:ring-2 focus:ring-caramel/20"
            />
          </form>
        </div>

        {/* Sellers Table with Animated Entrance */}
        <div className="card-bakery p-0 overflow-hidden shadow-warm">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-bakery-600 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
              <span>Loading sellers...</span>
            </div>
          ) : sellers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center text-bakery-600 space-y-2"
            >
              <Store className="w-10 h-10 text-bakery-300 mx-auto" />
              <h3 className="font-serif font-bold text-chocolate text-base">No Sellers Found</h3>
              <p className="text-xs max-w-sm mx-auto">
                No sellers matched the selected filter criteria.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-bakery-100/70 border-b border-bakery-200 text-bakery-600 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Bakery</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Listings</th>
                    <th className="py-3 px-4">Sales & Orders</th>
                    <th className="py-3 px-4">Date Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bakery-200/70">
                  <AnimatePresence>
                    {sellers.map((seller) => (
                      <motion.tr
                        key={seller._id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                        className="hover:bg-amber-50/40 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-bold text-chocolate text-sm truncate max-w-[200px] sm:max-w-[260px]" title={seller.bakeryName || seller.name}>
                            {seller.bakeryName || `${seller.name}'s Bakery`}
                          </div>
                          <div className="text-xs text-bakery-600 flex items-center gap-1.5 mt-0.5">
                            <span>By {seller.name}</span>
                            <span>•</span>
                            <Link
                              to={`/seller/${seller._id}`}
                              target="_blank"
                              className="text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-0.5 text-[11px] hover:underline"
                            >
                              <span>Public View</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs">
                          <div className="text-bakery-900 font-medium truncate max-w-[170px] sm:max-w-[220px]" title={seller.email}>{seller.email}</div>
                          <div className="text-bakery-500 mt-0.5">{seller.phone || 'No phone'}</div>
                        </td>

                        <td className="py-4 px-4">
                          <AnimatePresence mode="wait">
                            {seller.sellerStatus === 'approved' && (
                              <motion.span
                                key="approved"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approved</span>
                              </motion.span>
                            )}
                            {seller.sellerStatus === 'pending' && (
                              <motion.span
                                key="pending"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pending Review</span>
                              </motion.span>
                            )}
                            {seller.sellerStatus === 'rejected' && (
                              <motion.div
                                key="rejected"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Rejected</span>
                                </span>
                                {seller.rejectionReason && (
                                  <p className="text-[10px] text-rose-600 mt-0.5 max-w-[150px] truncate" title={seller.rejectionReason}>
                                    Reason: {seller.rejectionReason}
                                  </p>
                                )}
                              </motion.div>
                            )}
                            {seller.sellerStatus === 'blocked' && (
                              <motion.span
                                key="blocked"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Suspended</span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-chocolate flex items-center gap-1">
                            <Cake className="w-3.5 h-3.5 text-amber-600" />
                            <span>{seller.itemCount || 0} items</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs">
                          <div className="font-bold text-chocolate">
                            PKR {(seller.totalSales || 0).toLocaleString()}
                          </div>
                          <div className="text-bakery-500 text-[11px]">
                            {seller.totalOrders || 0} orders
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs text-bakery-600">
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* View Details Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={buttonTap}
                            onClick={() => setSelectedSellerId(seller._id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors inline-flex items-center gap-1"
                            title="View seller details and listings"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </motion.button>

                          {seller.sellerStatus === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={buttonTap}
                                onClick={() => handleUpdateStatus(seller._id, 'approved')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={buttonTap}
                                onClick={() => handleOpenRejectModal(seller)}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
                              >
                                Reject
                              </motion.button>
                            </>
                          )}

                          {seller.sellerStatus === 'approved' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={buttonTap}
                              onClick={() => handleUpdateStatus(seller._id, 'blocked')}
                              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                            >
                              Suspend
                            </motion.button>
                          )}

                          {seller.sellerStatus === 'blocked' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={buttonTap}
                              onClick={() => handleUpdateStatus(seller._id, 'approved')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                            >
                              Reactivate
                            </motion.button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModalSeller && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-chocolate text-base">
                    Reject Seller Request
                  </h3>
                  <p className="text-xs text-bakery-600">
                    {rejectModalSeller.bakeryName || rejectModalSeller.name} ({rejectModalSeller.email})
                  </p>
                </div>
              </div>

              {rejectError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {rejectError}
                </div>
              )}

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-bakery-800 mb-1">
                    Reason for rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please enter a reason for rejection"
                    required
                    className="input-bakery text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalSeller(null)}
                    className="btn-outline text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReject}
                    className="btn-primary bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-4"
                  >
                    {isSubmittingReject ? 'Rejecting...' : 'Confirm Reject'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seller Details Modal */}
      <SellerDetailModal
        isOpen={!!selectedSellerId}
        sellerId={selectedSellerId}
        onClose={() => setSelectedSellerId(null)}
        onStatusChange={(id, newStatus) => {
          setSellers((prev) =>
            prev.map((s) => (s._id === id ? { ...s, sellerStatus: newStatus } : s))
          );
        }}
      />
    </div>
  );
};

export default SellerApprovals;
