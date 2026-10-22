import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Store,
  Clock,
  FolderTree,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw
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

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const fetchDashboardData = async () => {
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
      console.error('Failed to load admin dashboard:', err);
      setError(err.message || 'Failed to load system dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (sellerId, newStatus) => {
    try {
      const res = await api.patch(`/admin/sellers/${sellerId}/status`, {
        status: newStatus
      });

      if (res.data?.success) {
        toast.success(
          newStatus === 'approved'
            ? 'Home baker approved! They can now list bakery items.'
            : 'Baker status updated to blocked.'
        );
        // Animate row removal smoothly
        setPendingSellers((prev) => prev.filter((s) => s._id !== sellerId));
        // Refresh live KPI counts
        if (metrics) {
          setMetrics((prev) => ({
            ...prev,
            pendingSellers: Math.max(0, (prev?.pendingSellers || 1) - 1),
            approvedSellers:
              newStatus === 'approved'
                ? (prev?.approvedSellers || 0) + 1
                : prev?.approvedSellers
          }));
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update baker status.');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-bakery-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar pendingCount={metrics?.pendingSellers || pendingSellers.length} />

      <main className="flex-1 p-6 md:p-10 max-w-6xl space-y-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal, ease: EASING.out }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bakery-200/80 pb-5"
        >
          <div>
            <span className="section-eyebrow">Platform Overview</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate mt-0.5">
              MeethaCart Admin Console
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={buttonTap}
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-secondary text-xs font-semibold py-2 px-3 self-start sm:self-auto flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </motion.button>
        </motion.div>

        {error && (
          <div className="alert-error">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Animated KPI Stat Cards */}
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Card 1: Total Users */}
          <motion.div
            variants={staggerItem}
            whileHover={cardHover}
            className="card-bakery p-5 flex items-center gap-4 transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-6 h-6" />
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

          {/* Card 2: Active Bakers */}
          <motion.div
            variants={staggerItem}
            whileHover={cardHover}
            className="card-bakery p-5 flex items-center gap-4 transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-6 h-6" />
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

          {/* Card 3: Pending Approvals */}
          <motion.div
            variants={staggerItem}
            whileHover={cardHover}
            className="card-bakery p-5 flex items-center gap-4 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-6 h-6 animate-gentle-pulse" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-amber-900 tracking-wider">
                Pending Approvals
              </span>
              <p className="text-2xl font-serif font-bold text-amber-950">
                {loading ? (
                  <span className="inline-block w-12 h-6 rounded skeleton skeleton-shimmer" />
                ) : (
                  <AnimatedCounter value={metrics?.pendingSellers || 0} />
                )}
              </p>
            </div>
          </motion.div>

          {/* Card 4: Categories */}
          <motion.div
            variants={staggerItem}
            whileHover={cardHover}
            className="card-bakery p-5 flex items-center gap-4 transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0 shadow-xs">
              <FolderTree className="w-6 h-6" />
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

        {/* Pending Seller Approvals Queue with Animated Table Rows */}
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

        {/* Quick Management Shortcuts with Micro-interactions */}
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
              to="/admin/orders"
              className="card-bakery p-6 block transition-all group border-bakery-200 h-full"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-bakery-100 text-caramel">
                  Live Stream
                </span>
              </div>
              <h3 className="font-serif font-bold text-chocolate text-lg">Orders Monitor</h3>
              <p className="text-xs text-bakery-600 mt-1">
                View customer baking orders and custom requests across all home bakeries.
              </p>
            </Link>
          </motion.div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
