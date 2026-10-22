import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
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
  AlertCircle
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
      setError(err.message || 'Failed to retrieve bakers list.');
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
            ? 'Baker approved successfully!'
            : 'Baker suspended.'
        );
        setSellers((prev) =>
          prev.map((s) => (s._id === sellerId ? { ...s, sellerStatus: newStatus } : s))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update baker status.');
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
            <span className="section-eyebrow">Baker Governance</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate mt-0.5">
              Seller Verification & Management
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
            {['all', 'pending', 'approved', 'blocked'].map((st) => (
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
              placeholder="Search bakery name, baker..."
              className="input-bakery pl-9 text-xs py-2 transition-all focus:ring-2 focus:ring-caramel/20"
            />
          </form>
        </div>

        {/* Sellers Table with Animated Entrance */}
        <div className="card-bakery p-0 overflow-hidden shadow-warm">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-bakery-600 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
              <span>Fetching sellers...</span>
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
                No home bakers matched the selected status and filter criteria.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-bakery-100/70 border-b border-bakery-200 text-bakery-600 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Bakery Storefront</th>
                    <th className="py-3 px-4">Baker Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Items Listed</th>
                    <th className="py-3 px-4">Joined Date</th>
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
                          <div className="font-bold text-chocolate text-sm">
                            {seller.bakeryName || `${seller.name}'s Bakery`}
                          </div>
                          <div className="text-xs text-bakery-600 flex items-center gap-1.5 mt-0.5">
                            <span>By {seller.name}</span>
                            <span>�</span>
                            <Link
                              to={`/seller/${seller._id}`}
                              target="_blank"
                              className="text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-0.5 text-[11px] hover:underline"
                            >
                              <span>Preview</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs">
                          <div className="text-bakery-900 font-medium">{seller.email}</div>
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

                        <td className="py-4 px-4 font-semibold text-chocolate">
                          {seller.itemCount || 0} items
                        </td>

                        <td className="py-4 px-4 text-xs text-bakery-600">
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
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
                                onClick={() => handleUpdateStatus(seller._id, 'blocked')}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
                              >
                                Block
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
                              Reinstate Baker
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
    </div>
  );
};

export default SellerApprovals;
