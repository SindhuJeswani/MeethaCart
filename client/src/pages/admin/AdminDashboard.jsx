import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import {
  Users,
  Store,
  Clock,
  Cake,
  FolderTree,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [metricsRes, sellersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/sellers?status=pending')
      ]);

      if (metricsRes.data?.success) {
        setMetrics(metricsRes.data.metrics);
      }
      if (sellersRes.data?.success) {
        setPendingSellers(sellersRes.data.sellers);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (sellerId, newStatus) => {
    try {
      const res = await api.patch(`/admin/sellers/${sellerId}/status`, { status: newStatus });
      setActionMessage(res.data?.message || `Seller marked as ${newStatus}`);
      setTimeout(() => setActionMessage(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update seller status.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-bakery-700">Loading admin metrics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <AdminSidebar pendingCount={metrics?.pendingSellers || 0} />

      <main className="flex-1 p-6 sm:p-8 space-y-8 bg-bakery-50/50">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate">
              Marketplace Monitoring & Control
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              Real-time platform metrics, seller verification queue, and catalog controls.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Administrator Authorized</span>
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="card-bakery p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-bakery-500 tracking-wider">
                Total Users
              </span>
              <p className="text-2xl font-serif font-bold text-chocolate">
                {metrics?.totalUsers || 0}
              </p>
            </div>
          </div>

          <div className="card-bakery p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-bakery-500 tracking-wider">
                Active Bakers
              </span>
              <p className="text-2xl font-serif font-bold text-chocolate">
                {metrics?.approvedSellers || 0}
              </p>
            </div>
          </div>

          <div className="card-bakery p-5 flex items-center gap-4 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-amber-900 tracking-wider">
                Pending Approvals
              </span>
              <p className="text-2xl font-serif font-bold text-amber-950">
                {metrics?.pendingSellers || 0}
              </p>
            </div>
          </div>

          <div className="card-bakery p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-bakery-500 tracking-wider">
                Categories
              </span>
              <p className="text-2xl font-serif font-bold text-chocolate">
                {metrics?.totalCategories || 0}
              </p>
            </div>
          </div>

        </div>

        {/* Pending Seller Approvals Queue */}
        <div className="card-bakery">
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
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View All Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingSellers.length === 0 ? (
            <div className="text-center py-12 px-4 bg-bakery-50/70 rounded-xl border border-bakery-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-serif font-bold text-chocolate text-base">All Caught Up!</h3>
              <p className="text-xs text-bakery-600 mt-1 max-w-sm mx-auto">
                No pending home bakers in the approval queue. New registrations will automatically appear here.
              </p>
            </div>
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
                  {pendingSellers.map((seller) => (
                    <tr key={seller._id} className="hover:bg-bakery-50 transition-colors">
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
                        <button
                          onClick={() => handleUpdateStatus(seller._id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(seller._id, 'blocked')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors"
                        >
                          Block
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/categories"
            className="card-bakery p-6 hover:shadow-warm-lg transition-all group border-bakery-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderTree className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-bakery-400 group-hover:text-amber-700 transition-colors" />
            </div>
            <h3 className="font-serif font-bold text-chocolate text-lg">Category Management</h3>
            <p className="text-xs text-bakery-600 mt-1">
              Add, edit, or remove bakery categories (Custom Cakes, Mithai, Artisanal Breads).
            </p>
          </Link>

          <Link
            to="/admin/orders"
            className="card-bakery p-6 hover:shadow-warm-lg transition-all group border-bakery-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-bakery-100 text-bakery-600">
                FYP M4 Scope
              </span>
            </div>
            <h3 className="font-serif font-bold text-chocolate text-lg">Orders Monitor</h3>
            <p className="text-xs text-bakery-600 mt-1">
              View customer orders across all home bakeries (designed empty state view).
            </p>
          </Link>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
