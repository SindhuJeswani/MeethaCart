import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock,
  Store,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const SellerItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isApproved = user?.sellerStatus === 'approved';

  const fetchMyItems = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get('/items/seller/my-items');
      if (res.data?.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch your bakery items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, []);

  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.patch(`/items/${id}/availability`);
      setSuccess(res.data?.message || 'Availability updated.');
      fetchMyItems();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Failed to toggle availability.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'?`)) {
      return;
    }

    try {
      const res = await api.delete(`/items/${id}`);
      setSuccess(res.data?.message || 'Item deleted successfully.');
      fetchMyItems();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Failed to delete bakery item.');
    }
  };

  const getThumbnail = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop';
    if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
    return img;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/seller/dashboard" className="text-xs font-semibold text-amber-800 hover:text-amber-950">
              ← Baker Studio
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-amber-600" />
            <span>My Bakery Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-bakery-600 mt-0.5">
            Manage your recipes, edit prices, monitor stock, and toggle order availability.
          </p>
        </div>

        {isApproved ? (
          <Link
            to="/seller/items/new"
            className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-warm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bakery Item</span>
          </Link>
        ) : (
          <button
            disabled
            className="btn-primary text-xs sm:text-sm py-2.5 px-4 opacity-50 cursor-not-allowed self-start sm:self-auto"
            title="Awaiting Admin approval"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item (Pending Approval)</span>
          </button>
        )}
      </div>

      {/* Pending Approval Alert */}
      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block font-bold uppercase tracking-wider text-amber-900">
              Seller Account Pending Admin Approval
            </strong>
            <span>
              Your profile is currently under review by the Admin team. Once approved, you can publish items and start accepting customer orders.
            </span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Items Table */}
      <div className="card-bakery p-0 overflow-hidden border-bakery-200">
        {isLoading ? (
          <div className="p-16 text-center text-sm text-bakery-600">Loading your items...</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-bakery-600 space-y-3">
            <ShoppingBag className="w-12 h-12 text-bakery-300 mx-auto" />
            <h3 className="font-serif font-bold text-chocolate text-lg">No Bakery Items Listed Yet</h3>
            <p className="text-xs text-bakery-500 max-w-sm mx-auto">
              {isApproved
                ? 'Start showcasing your custom cakes, cookies, and traditional sweets to buyers.'
                : 'Items will appear here once you publish after admin approval.'}
            </p>
            {isApproved && (
              <Link to="/seller/items/new" className="btn-primary text-xs py-2 px-4 inline-flex">
                <Plus className="w-3.5 h-3.5" />
                <span>Publish First Item</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-bakery-100/70 border-b border-bakery-200 text-bakery-600 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Item & Recipe</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bakery-200/70">
                {items.map((it) => (
                  <tr key={it._id} className="hover:bg-bakery-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getThumbnail(it.images?.[0])}
                          alt={it.title}
                          className="w-12 h-12 rounded-xl object-cover border border-bakery-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-chocolate">{it.title}</div>
                          <div className="text-xs text-bakery-500 flex items-center gap-1.5 mt-0.5">
                            <span>{it.preparationTimeHours || 24}h prep time</span>
                            {it.isEggless && (
                              <span className="text-emerald-700 font-semibold">• Eggless</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-bakery-100 text-bakery-800">
                        {it.category?.name || 'Bakery'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-chocolate">
                      PKR {it.price?.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-bakery-800">{it.stock} units</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleAvailability(it._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          it.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        {it.isAvailable ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-stone-400" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link
                        to={`/items/${it._id}`}
                        target="_blank"
                        className="p-1.5 text-bakery-500 hover:text-amber-800 inline-block rounded-lg"
                        title="View Live Listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/seller/items/${it._id}/edit`}
                        className="p-1.5 text-bakery-500 hover:text-amber-800 inline-block rounded-lg"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(it._id, it.title)}
                        className="p-1.5 text-bakery-500 hover:text-rose-700 rounded-lg"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default SellerItems;
