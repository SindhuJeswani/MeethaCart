import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
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
  ExternalLink
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
      setError(err.message || 'Failed to load admin metrics.');
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
            ? 'Home baker has been approved!'
            : 'Home baker account has been suspended.'
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
              Marketplace Administration
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              Platform health, seller verification queue, catalog categories, and member directory.
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
            <span>Refresh Data</span>
          </motion.button>
        </motion.div>

        {error && (
          <div className="alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Milestone 3 KPI Grid: Total Users, Active Bakers, Pending Approvals, Total Items, Categories */}
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
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
                Active Bakers
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
                Pending Reviews
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
                Bakery Items
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
                <span>Baker Approval Queue</span>
              </h2>
              <p className="text-xs text-bakery-600 mt-0.5">
                New home bakers require Admin review before they can list bakery items.
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
              <h3 className="font-serif font-bold text-chocolate text-base">All Caught Up!</h3>
              <p className="text-xs text-bakery-600 mt-1 max-w-sm mx-auto">
                No pending home bakers in the approval queue. New registrations will automatically appear here.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-bakery-200 text-bakery-500 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3">Bakery & Baker</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Registered</th>
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
                          <div className="font-bold text-chocolate">
                            {seller.bakeryName || `${seller.name}'s Bakery`}
                          </div>
                          <div className="text-xs text-bakery-600">{seller.name}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-bakery-800">{seller.email}</div>
                          <div className="text-xs text-bakery-500">{seller.phone || 'No phone'}</div>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-bakery-600">
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 text-right space-x-2">
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

        {/* Quick Management Shortcuts (Milestone 3 Modules Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div whileHover={cardHover} className="rounded-xl">
            <Link
              to="/admin/categories"
              className="card-bakery p-6 block transition-all group border-bakery-200 h-full"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderTree className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-bakery-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-chocolate text-lg">Category Management</h3>
              <p className="text-xs text-bakery-600 mt-1">
                Add, edit, or remove bakery categories (Custom Cakes, Mithai, Artisanal Breads).
              </p>
            </Link>
          </motion.div>

          <motion.div whileHover={cardHover} className="rounded-xl">
            <Link
              to="/admin/users"
              className="card-bakery p-6 block transition-all group border-bakery-200 h-full"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-blue-700" />
                </div>
                <ArrowRight className="w-4 h-4 text-bakery-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-chocolate text-lg">User Directory</h3>
              <p className="text-xs text-bakery-600 mt-1">
                Browse registered buyers, home bakers, and administrative accounts with search and filtering.
              </p>
            </Link>
          </motion.div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
