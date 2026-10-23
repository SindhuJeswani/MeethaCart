import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import SellerDetailModal from '../../components/admin/SellerDetailModal';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Store,
  Clock,
  FolderTree,
  Cake,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Eye
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

// Animated Counter for KPI metrics
const AnimatedCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 600;
    const stepTime = Math.abs(Math.floor(duration / (end || 1)));
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      }
    }, Math.max(stepTime, 20));

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [metricsRes, sellersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/sellers?status=pending')
      ]);

      if (metricsRes.data?.success) {
        setMetrics(metricsRes.data.metrics);
      }

      if (sellersRes.data?.success) {
        setPendingSellers(sellersRes.data.sellers || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (sellerId, newStatus) => {
    try {
      const res = await api.patch(`/admin/sellers/${sellerId}/status`, {
        status: newStatus
      });

      if (res.data?.success) {
        toast.success(
          newStatus === 'approved'
            ? 'Seller approved successfully.'
            : 'Seller account suspended.'
        );
        // Instant optimistic update
        setPendingSellers((prev) => prev.filter((s) => s._id !== sellerId));
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update seller status.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <AdminSidebar pendingCount={pendingSellers.length} />

      <main className="flex-1 p-6 sm:p-8 space-y-8 bg-bakery-50/50 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal, ease: EASING.out }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate">
              Overview
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              Platform metrics, seller applications, categories, and users.
            </p>
          </div>

          <motion.button
            whileTap={buttonTap}
            whileHover={{ scale: 1.04 }}
            onClick={fetchData}
            disabled={loading}
            className="btn-secondary self-start sm:self-auto text-xs py-2 px-3.5 flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </motion.div>

        {error && (
          <div className="alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Platform KPI Grid */}
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {/* 1. Total Registered Members */}
          <motion.div
            variants={staggerItem}
            whileHover={cardHover}
            className="card-bakery p-5 flex items-center gap-3.5 border-bakery-200"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-bakery-500 tracking-wider">
                Total Users
              </span>
              <p className="text-2xl font-serif font-bold text-chocolate">
                {loading ? (
                  <span className="inline-block w-12 h-6 rounded skeleton skeleton-shimmer" />
                ) : (
                  <AnimatedCounter value={metrics?.totalUsers || 0} />
                )}
              </p>
            </div>
          </motion.div>

          {/* 2. Active Approved Bakers */}
          <motion.div
            variants={staggerItem}
            whileHover={cardHover}
            className="card-bakery p-5 flex items-center gap-3.5 border-bakery-200"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Store className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-bakery-500 tracking-wider">
                Active Sellers
              </span>
              <p className="text-2xl font-serif font-bold text-chocolate">
                {loading ? (
                  <span className="inline-block w-12 h-6 rounded skeleton skeleton-shimmer" />
                ) : (
                  <AnimatedCounter value={metrics?.approvedSellers || 0} />
                )}
              </p>
            </div>
          </motion.div>

          {/* 3. Pending Approvals */}
          <motion.div
            variants={staggerItem}
            whileHover={cardHover}
            className="card-bakery p-5 flex items-center gap-3.5 border-bakery-200"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-bakery-500 tracking-wider">
                Pending Approvals
              </span>
              <p className="text-2xl font-serif font-bold text-chocolate">
                {loading ? (
                  <span className="inline-block w-12 h-6 rounded skeleton skeleton-shimmer" />
                ) : (
                  <AnimatedCounter value={metrics?.pendingSellers || 0} />
                )}
              </p>
            </div>
          </motion.div>

          {/* 4. Total Bakery Items Listed */}
          <motion.div
            variants={staggerItem}
            whileHover={cardHover}
            className="card-bakery p-5 flex items-center gap-3.5 border-bakery-200"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Cake className="w-6 h-6 text-rose-700" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-bakery-500 tracking-wider">
                Total Listings
              </span>
              <p className="text-2xl font-serif font-bold text-chocolate">
                {loading ? (
                  <span className="inline-block w-12 h-6 rounded skeleton skeleton-shimmer" />
                ) : (
                  <AnimatedCounter value={metrics?.totalItems || 0} />
                )}
              </p>
            </div>
          </motion.div>

          {/* 5. Categories */}
          <motion.div
            variants={staggerItem}
            whileHover={cardHover}
            className="card-bakery p-5 flex items-center gap-3.5 border-bakery-200"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold shadow-xs shrink-0">
              <FolderTree className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-bakery-500 tracking-wider">
                Categories
              </span>
              <p className="text-2xl font-serif font-bold text-chocolate">
                {loading ? (
                  <span className="inline-block w-12 h-6 rounded skeleton skeleton-shimmer" />
                ) : (
                  <AnimatedCounter value={metrics?.totalCategories || 0} />
                )}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Pending Seller Approvals Queue */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card-bakery"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-bakery-200/80">
            <div>
              <h2 className="font-serif font-bold text-chocolate text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Pending Seller Approvals</span>
              </h2>
              <p className="text-xs text-bakery-600 mt-0.5">
                New sellers require review before listing items.
              </p>
            </div>
            <Link
              to="/admin/sellers"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
            >
              <span>View All Sellers</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 w-full skeleton skeleton-shimmer rounded-lg" />
              ))}
            </div>
          ) : pendingSellers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 px-4 bg-bakery-50/70 rounded-xl border border-bakery-200"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-serif font-bold text-chocolate text-base">No Pending Approvals</h3>
              <p className="text-xs text-bakery-600 mt-1 max-w-sm mx-auto">
                There are currently no seller applications awaiting review.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-bakery-200 text-bakery-500 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3">Bakery</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Date Applied</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bakery-200/60">
                  <AnimatePresence>
                    {pendingSellers.map((seller) => (
                      <motion.tr
                        key={seller._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, transition: { duration: 0.22 } }}
                        className="hover:bg-amber-50/40 transition-colors"
                      >
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-chocolate truncate max-w-[180px] sm:max-w-[220px]" title={seller.bakeryName || seller.name}>
                            {seller.bakeryName || `${seller.name}'s Bakery`}
                          </div>
                          <div className="text-xs text-bakery-600">{seller.name}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-bakery-800 truncate max-w-[160px] sm:max-w-[200px]" title={seller.email}>{seller.email}</div>
                          <div className="text-xs text-bakery-500">{seller.phone || 'No phone'}</div>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-bakery-600">
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={buttonTap}
                            onClick={() => setSelectedSellerId(seller._id)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={buttonTap}
                            onClick={() => handleUpdateStatus(seller._id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
                          >
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={buttonTap}
                            onClick={() => handleUpdateStatus(seller._id, 'blocked')}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors"
                          >
                            Block
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      <SellerDetailModal
        isOpen={!!selectedSellerId}
        sellerId={selectedSellerId}
        onClose={() => setSelectedSellerId(null)}
        onStatusChange={(id, newStatus) => {
          setPendingSellers((prev) => prev.filter((s) => s._id !== id));
          fetchData();
        }}
      />
    </div>
  );
};

export default AdminDashboard;
