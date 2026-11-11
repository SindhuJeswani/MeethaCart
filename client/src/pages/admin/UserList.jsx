import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Store,
  User,
  Shield,
  RefreshCw,
  Ban,
  Unlock,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  fadeUp,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'blocked'
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Block Modal State
  const [blockingUser, setBlockingUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockError, setBlockError] = useState('');
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  // Unblock Confirm Modal State
  const [unblockingUser, setUnblockingUser] = useState(null);
  const [isSubmittingUnblock, setIsSubmittingUnblock] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      let url = '/admin/users';
      const params = new URLSearchParams();

      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
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
        setUsers(res.data.users || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenBlockModal = (user) => {
    setBlockingUser(user);
    setBlockReason('');
    setBlockError('');
  };

  const handleConfirmBlock = async (e) => {
    e.preventDefault();
    if (!blockReason.trim()) {
      setBlockError('Please enter a reason for blocking');
      return;
    }

    try {
      setIsSubmittingBlock(true);
      setBlockError('');
      const res = await api.patch(`/admin/users/${blockingUser._id}/block`, {
        reason: blockReason.trim()
      });

      if (res.data?.success) {
        setSuccessMsg(`User '${blockingUser.name}' has been blocked.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setBlockingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setBlockError(err.response?.data?.message || 'Server error. Account was not blocked.');
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  const handleConfirmUnblock = async () => {
    try {
      setIsSubmittingUnblock(true);
      const res = await api.patch(`/admin/users/${unblockingUser._id}/unblock`);

      if (res.data?.success) {
        setSuccessMsg(`User '${unblockingUser.name}' has been unblocked.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setUnblockingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Account was not unblocked.');
    } finally {
      setIsSubmittingUnblock(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-bakery-50/50 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal, ease: EASING.out }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
              <Users className="w-7 h-7 text-amber-600" />
              <span>User Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              Manage buyers, sellers, and platform accounts with blocking and unblocking.
            </p>
          </div>
        </motion.div>

        {error && (
          <div className="alert-error">
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="card-bakery p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-bakery-100 rounded-xl border border-bakery-200">
              {['all', 'buyer', 'seller', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    roleFilter === r
                      ? 'bg-white text-chocolate shadow-xs'
                      : 'text-bakery-600 hover:text-chocolate'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : `${r}s`}
                </button>
              ))}
            </div>

            {/* Status Filter (Active vs Blocked) */}
            <div className="flex items-center gap-1.5 p-1 bg-bakery-100 rounded-xl border border-bakery-200">
              {['all', 'active', 'blocked'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    statusFilter === s
                      ? 'bg-white text-chocolate shadow-xs'
                      : 'text-bakery-600 hover:text-chocolate'
                  }`}
                >
                  {s === 'all' ? 'All Status' : s === 'blocked' ? 'Blocked Accounts' : 'Active'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-bakery-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="input-bakery pl-9 text-xs py-2 focus:ring-2 focus:ring-caramel/20"
            />
          </form>
        </div>

        {/* Users Table */}
        <div className="card-bakery p-0 overflow-hidden shadow-warm">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-bakery-600 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span>Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center text-bakery-600 space-y-2"
            >
              <Users className="w-10 h-10 text-bakery-300 mx-auto" />
              <h3 className="font-serif font-bold text-chocolate text-base">No Users Found</h3>
              <p className="text-xs max-w-sm mx-auto">
                No user accounts matched your search keyword or selected filters.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-bakery-100/70 border-b border-bakery-200 text-bakery-600 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Date Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bakery-200/70">
                  <AnimatePresence>
                    {users.map((u) => {
                      const isBlocked = Boolean(u.isBlocked || u.sellerStatus === 'blocked');
                      const isAdmin = u.role === 'admin';

                      return (
                        <motion.tr
                          key={u._id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-amber-50/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-chocolate truncate max-w-[180px]" title={u.name}>
                              {u.name}
                            </div>
                            <div className="text-xs text-bakery-600 truncate max-w-[180px]" title={u.email}>
                              {u.email}
                            </div>
                            {u.bakeryName && (
                              <div className="text-[11px] text-amber-800 font-medium">
                                Store: {u.bakeryName}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : u.role === 'seller'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-blue-100 text-blue-900 border border-blue-200'
                              }`}
                            >
                              {u.role === 'admin' && <Shield className="w-3 h-3 text-purple-700" />}
                              {u.role === 'seller' && <Store className="w-3 h-3 text-amber-700" />}
                              {u.role === 'buyer' && <User className="w-3 h-3 text-blue-700" />}
                              <span>{u.role}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {isBlocked ? (
                              <div>
                                <span className="inline-flex items-center gap-1 text-red-700 font-bold text-xs bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                  <Ban className="w-3 h-3 text-red-600" />
                                  <span>Blocked</span>
                                </span>
                                {u.blockReason && (
                                  <p className="text-[11px] text-red-600 mt-0.5 max-w-[200px] truncate" title={u.blockReason}>
                                    Reason: {u.blockReason}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-xs text-bakery-600">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {!isAdmin && (
                              isBlocked ? (
                                <button
                                  onClick={() => setUnblockingUser(u)}
                                  className="btn-outline text-xs py-1 px-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50 inline-flex items-center gap-1"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>Unblock</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenBlockModal(u)}
                                  className="btn-outline text-xs py-1 px-3 border-red-300 text-red-700 hover:bg-red-50 inline-flex items-center gap-1"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>Block</span>
                                </button>
                              )
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Block Confirmation Modal with Reason */}
      <AnimatePresence>
        {blockingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-chocolate text-base">
                    Block User Account
                  </h3>
                  <p className="text-xs text-bakery-600">
                    {blockingUser.name} ({blockingUser.email})
                  </p>
                </div>
              </div>

              <p className="text-xs text-bakery-700">
                Blocking this account will end the user's active session and prevent them from signing in. If this is a seller, their items will be hidden from buyers.
              </p>

              {blockError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {blockError}
                </div>
              )}

              <form onSubmit={handleConfirmBlock} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-bakery-800 mb-1">
                    Reason for blocking <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Enter the official reason for blocking this user..."
                    required
                    className="input-bakery text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBlockingUser(null)}
                    className="btn-outline text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBlock}
                    className="btn-primary bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-4 inline-flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{isSubmittingBlock ? 'Blocking...' : 'Confirm Block'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unblock Confirmation Modal */}
      <AnimatePresence>
        {unblockingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-chocolate text-base">
                    Unblock User Account
                  </h3>
                  <p className="text-xs text-bakery-600">
                    {unblockingUser.name} ({unblockingUser.email})
                  </p>
                </div>
              </div>

              {unblockingUser.blockReason && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <strong>Previous Block Reason:</strong> {unblockingUser.blockReason}
                </div>
              )}

              <p className="text-xs text-bakery-700">
                Are you sure you want to restore access for this account? The user will be able to sign in again, and if they are a seller, their approved items will be visible to buyers.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUnblockingUser(null)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnblock}
                  disabled={isSubmittingUnblock}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isSubmittingUnblock ? 'Unblocking...' : 'Confirm Unblock'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserList;