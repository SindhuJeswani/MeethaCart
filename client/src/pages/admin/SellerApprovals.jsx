import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Store,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SellerApprovals = () => {
  const [sellers, setSellers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

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
        setSellers(res.data.sellers);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch sellers.');
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
      const res = await api.patch(`/admin/sellers/${sellerId}/status`, { status: newStatus });
      setActionSuccess(res.data?.message || `Status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 3000);
      fetchSellers();
    } catch (err) {
      setError(err.message || 'Failed to update seller status.');
    }
  };

  const pendingCount = sellers.filter((s) => s.sellerStatus === 'pending').length;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <AdminSidebar pendingCount={pendingCount} />

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-bakery-50/50">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
              <UserCheck className="w-7 h-7 text-amber-600" />
              <span>Baker Approval & Verification</span>
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              Approve home baker storefronts or suspend non-compliant seller accounts.
            </p>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="card-bakery p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-bakery-100 rounded-xl border border-bakery-200 overflow-x-auto">
            {['all', 'pending', 'approved', 'blocked'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-chocolate shadow-xs'
                    : 'text-bakery-600 hover:text-chocolate'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-bakery-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bakery name, baker..."
              className="input-bakery pl-9 text-xs py-2"
            />
          </form>

        </div>

        {/* Sellers Table */}
        <div className="card-bakery p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-bakery-600 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span>Fetching sellers...</span>
            </div>
          ) : sellers.length === 0 ? (
            <div className="p-12 text-center text-bakery-600 space-y-2">
              <Store className="w-10 h-10 text-bakery-300 mx-auto" />
              <h3 className="font-serif font-bold text-chocolate text-base">No Sellers Found</h3>
              <p className="text-xs max-w-sm mx-auto">
                No home bakers matched the selected status and filter criteria.
              </p>
            </div>
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
                  {sellers.map((seller) => (
                    <tr key={seller._id} className="hover:bg-bakery-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-chocolate text-sm">
                          {seller.bakeryName || `${seller.name}'s Bakery`}
                        </div>
                        <div className="text-xs text-bakery-600 flex items-center gap-1.5 mt-0.5">
                          <span>By {seller.name}</span>
                          <span>•</span>
                          <Link
                            to={`/seller/${seller._id}`}
                            target="_blank"
                            className="text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-0.5 text-[11px]"
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
                        {seller.sellerStatus === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </span>
                        )}
                        {seller.sellerStatus === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {seller.sellerStatus === 'blocked' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Suspended</span>
                          </span>
                        )}
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
                            <button
                              onClick={() => handleUpdateStatus(seller._id, 'approved')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(seller._id, 'blocked')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
                            >
                              Block
                            </button>
                          </>
                        )}

                        {seller.sellerStatus === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(seller._id, 'blocked')}
                            className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                          >
                            Suspend
                          </button>
                        )}

                        {seller.sellerStatus === 'blocked' && (
                          <button
                            onClick={() => handleUpdateStatus(seller._id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                          >
                            Reinstate Baker
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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
