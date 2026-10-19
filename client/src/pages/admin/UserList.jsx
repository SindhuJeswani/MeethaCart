import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  Store,
  User,
  RefreshCw,
  Globe
} from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      let url = '/admin/users';
      const params = new URLSearchParams();

      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      if (res.data?.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-bakery-50/50">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
              <Users className="w-7 h-7 text-amber-600" />
              <span>User Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              Browse registered buyers, home bakers, and administrative staff.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="card-bakery p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          
          <div className="flex items-center gap-1.5 p-1 bg-bakery-100 rounded-xl border border-bakery-200 overflow-x-auto">
            {['all', 'buyer', 'seller', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-white text-chocolate shadow-xs'
                    : 'text-bakery-600 hover:text-chocolate'
                }`}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-bakery-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="input-bakery pl-9 text-xs py-2"
            />
          </form>

        </div>

        {/* Users Table */}
        <div className="card-bakery p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-bakery-600 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span>Fetching users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-bakery-600">No users match your criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-bakery-100/70 border-b border-bakery-200 text-bakery-600 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bakery-200/70">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-bakery-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-chocolate">{u.name}</div>
                        <div className="text-xs text-bakery-600">{u.email}</div>
                        {u.bakeryName && (
                          <div className="text-[11px] text-amber-800 font-medium">
                            Bakery: {u.bakeryName}
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
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-stone-500 font-medium text-xs">
                            <XCircle className="w-3.5 h-3.5 text-stone-400" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 text-xs text-bakery-700 font-medium uppercase">
                          <Globe className="w-3 h-3 text-amber-600" />
                          <span>{u.preferredLanguage || 'en'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-bakery-600">
                        {new Date(u.createdAt).toLocaleDateString()}
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

export default UserList;
