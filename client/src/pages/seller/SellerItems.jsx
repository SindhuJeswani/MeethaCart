import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import fallbackImg from '../../assets/fallback-item.jpg';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  ShoppingBag,
  Clock,
  ToggleLeft,
  ToggleRight,
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

const SellerItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const isApproved = user?.sellerStatus === 'approved' || user?.role === 'admin';

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get('/items/seller/me');
      if (res.data?.success) {
        setItems(Array.isArray(res.data.items) ? res.data.items : []);
      }
    } catch (err) {
      console.error('Failed to load seller items:', err);
      setError(err.message || 'Failed to load your bakery catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleAvailability = async (itemId) => {
    try {
      const res = await api.patch(`/items/${itemId}/availability`);
      if (res.data?.success) {
        const isNowAvailable = res.data.item?.isAvailable ?? res.data.isAvailable;
        setItems((prev) =>
          (prev || []).map((it) => {
            if (it?._id === itemId) {
              return res.data.item ? res.data.item : { ...it, isAvailable: isNowAvailable };
            }
            return it;
          }).filter(Boolean)
        );
        toast.info(isNowAvailable ? 'Item marked active' : 'Item paused');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to toggle availability.');
    }
  };

  const handleDelete = async (itemId, title) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/items/${itemId}`);
      if (res.data?.success) {
        toast.success(`"${title}" deleted successfully.`);
        setItems((prev) => (prev || []).filter((it) => it?._id !== itemId));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete item.');
    }
  };

  const getThumbnail = (img) => {
    if (!img) return fallbackImg;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bakery-200"
      >
        <div>
          <span className="section-eyebrow">Baker Studio</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2 mt-0.5">
            <ShoppingBag className="w-7 h-7 text-amber-600" />
            <span>My Bakery Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-bakery-600 mt-1">
            Manage your recipes, edit prices, monitor stock, and toggle order availability.
          </p>
        </div>

        {isApproved ? (
          <motion.div whileHover={{ scale: 1.04 }} whileTap={buttonTap}>
            <Link
              to="/seller/items/new"
              className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Bakery Item</span>
            </Link>
          </motion.div>
        ) : (
          <button
            disabled
            className="btn-secondary text-xs py-2.5 px-4 inline-flex items-center gap-2 opacity-50 cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item (Pending Approval)</span>
          </button>
        )}
      </motion.div>

      {/* Pending Approval Alert with Gentle Pulse */}
      {!isApproved && (
        <motion.div
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs"
        >
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin-slow" />
          <div className="text-xs">
            <strong className="block font-bold uppercase tracking-wider text-amber-900">
              Seller Account Pending Admin Approval
            </strong>
            <span>
              Your profile is currently under review by the Admin team. Once approved, you can publish items and start accepting customer orders.
            </span>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Items Table */}
      <div className="card-bakery p-0 overflow-hidden border-bakery-200 shadow-warm">
        {isLoading ? (
          <div className="p-16 text-center text-sm text-bakery-600">Loading your items...</div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 text-center text-bakery-600 space-y-3"
          >
            <ShoppingBag className="w-12 h-12 text-bakery-300 mx-auto" />
            <h3 className="font-serif font-bold text-chocolate text-lg">No Bakery Items Listed Yet</h3>
            <p className="text-xs text-bakery-500 max-w-sm mx-auto">
              {isApproved
                ? 'Start showcasing your custom cakes, cookies, and traditional sweets to buyers.'
                : 'Items will appear here once you publish after admin approval.'}
            </p>
            {isApproved && (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={buttonTap}>
                <Link to="/seller/items/new" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish First Item</span>
                </Link>
              </motion.div>
            )}
          </motion.div>
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
                <AnimatePresence>
                  {items.filter(Boolean).map((it) => (
                    <motion.tr
                      key={it._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, transition: { duration: 0.22 } }}
                      className="hover:bg-amber-50/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getThumbnail(it.images?.[0])}
                            alt={it.title || 'Bakery Item'}
                            className="w-12 h-12 rounded-xl object-cover border border-bakery-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-chocolate">{it.title || 'Untitled Item'}</div>
                            <div className="text-xs text-bakery-500 flex items-center gap-1.5 mt-0.5">
                              <span>{it.preparationTimeHours || 24}h prep time</span>
                              {it.isEggless && (
                                <span className="text-emerald-700 font-semibold">🌿 Eggless</span>
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
                        PKR {Number(it.price || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-bakery-800">{it.stock ?? 0} units</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <motion.button
                          whileTap={buttonTap}
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
                        </motion.button>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <Link
                          to={`/items/${it._id}`}
                          target="_blank"
                          className="p-1.5 text-bakery-500 hover:text-amber-800 inline-block rounded-lg hover:scale-110 transition-transform"
                          title="View Live Listing"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/seller/items/${it._id}/edit`}
                          className="p-1.5 text-bakery-500 hover:text-amber-800 inline-block rounded-lg hover:scale-110 transition-transform"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <motion.button
                          whileTap={buttonTap}
                          onClick={() => handleDelete(it._id, it.title)}
                          className="p-1.5 text-bakery-500 hover:text-rose-700 rounded-lg inline-block"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerItems;
