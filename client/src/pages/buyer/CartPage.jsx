import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  AlertCircle,
  ShoppingBasket,
  Store,
  Tag,
  ShieldCheck,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { buttonTap, TIMING, EASING } from '../../animations/motion';

const CartPage = () => {
  const { items, cartCount, totalPrice, updateQuantity, updateCartItem, removeItem, clearCart, loading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editOptions, setEditOptions] = useState({});
  const [actionError, setActionError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const hasUnavailableItem = items.some(
    (entry) => entry.isUnavailable
  );
  const unavailableNames = items
    .filter((entry) => entry.isUnavailable)
    .map((entry) => entry.item?.title || entry.itemTitle || 'Deleted item');

  const handleClearCart = async () => {
    setActionError('');
    try {
      await clearCart();
      toast.info('Cart cleared');
    } catch (err) {
      setActionError(err.message || 'Server error. Cart was not updated.');
    }
  };

  const handleQuantityChange = async (cartItemId, currentQty, delta, maxStock) => {
    setActionError('');
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    if (maxStock !== undefined && newQty > maxStock) {
      setActionError('Requested quantity is not available');
      return;
    }

    try {
      setProcessingId(cartItemId);
      await updateQuantity(cartItemId, newQty);
    } catch (err) {
      setActionError(err.message || 'Server error. Cart was not updated.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStartEdit = (entry) => {
    setEditingItemId(entry._id);
    setEditOptions({
      selectedSize: entry.selectedSize || '',
      selectedFlavor: entry.selectedFlavor || '',
      customizationNote: entry.customizationNote || ''
    });
  };

  const handleSaveOptions = async (cartItemId) => {
    setActionError('');
    try {
      setProcessingId(cartItemId);
      await updateCartItem(cartItemId, editOptions);
      setEditingItemId(null);
      toast.success('Options updated');
    } catch (err) {
      setActionError(err.message || 'Server error. Cart was not updated.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!confirmDeleteId) return;
    setActionError('');
    try {
      setProcessingId(confirmDeleteId);
      await removeItem(confirmDeleteId);
      setConfirmDeleteId(null);
      toast.info('Item removed from cart');
    } catch (err) {
      setActionError(err.message || 'Server error. Item was not removed.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center font-bold text-2xl">
          <ShoppingBag className="w-8 h-8 text-caramel" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-chocolate">
          Please Sign In
        </h2>
        <p className="text-xs text-bakery-600">
          Sign in to access your personal shopping cart and place orders.
        </p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-6 shadow-xs">
          <span>Sign In to Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-5xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bakery-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-caramel" />
            <span>Bakery Shopping Cart</span>
          </h1>
          <p className="text-xs text-bakery-600 mt-0.5">
            Review your handcrafted sweets, change options or quantities, and proceed to checkout.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your entire cart?')) {
                handleClearCart();
              }
            }}
            className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1.5 self-start sm:self-auto py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-medium">{actionError}</span>
          </div>
          <button
            onClick={() => setActionError('')}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Main Content: Empty Cart or Item List */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal }}
          className="bg-white rounded-2xl border border-bakery-200 p-12 text-center max-w-md mx-auto shadow-xs space-y-6"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-full bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center text-caramel shadow-xs"
          >
            <ShoppingBasket className="w-12 h-12 stroke-[1.5]" />
          </motion.div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-serif font-bold text-chocolate">
              Your bakery cart is empty
            </h2>
            <p className="text-xs text-bakery-600 max-w-xs mx-auto leading-relaxed">
              Explore fresh handcrafted cakes, traditional mithai, and artisanal bakes from local home bakers.
            </p>
          </div>

          <Link
            to="/items"
            className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5 shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Bakery Treats</span>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-white rounded-xl border border-bakery-200 overflow-hidden shadow-xs divide-y divide-bakery-100">
              <div className="p-4 bg-bakery-50/70 flex items-center justify-between text-xs font-semibold text-bakery-700">
                <span>Selected Items ({cartCount})</span>
                <span>Subtotal</span>
              </div>

              <AnimatePresence initial={false}>
                {items.map((entry) => {
                  const product = entry.item || {};
                  const isEditing = editingItemId === entry._id;
                  const itemTotal = entry.price * entry.quantity;
                  const imageSrc =
                    product.images && product.images.length > 0
                      ? product.images[0].startsWith('http')
                        ? product.images[0]
                        : `http://localhost:5000${product.images[0]}`
                      : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop';

                  return (
                    <motion.div
                      key={entry._id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 sm:p-5 flex flex-col gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <img
                            src={imageSrc}
                            alt={product.title || 'Bakery Item'}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-bakery-200 shrink-0 bg-bakery-100"
                          />
                          <div className="space-y-1">
                            <h3 className="font-serif font-bold text-chocolate text-sm sm:text-base">
                              {product.title || entry.itemTitle || 'Deleted item'}
                            </h3>
                            <p className="text-[11px] text-bakery-600 flex items-center gap-1.5">
                              <Store className="w-3 h-3 text-caramel" />
                              <span>{product.seller?.bakeryName || product.seller?.name || 'Artisan Baker'}</span>
                            </p>

                            {/* Displayed Options */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {entry.selectedSize && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold">
                                  Size: {entry.selectedSize}
                                </span>
                              )}
                              {entry.selectedFlavor && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold">
                                  Flavor: {entry.selectedFlavor}
                                </span>
                              )}
                              {entry.customizationNote && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bakery-100 border border-bakery-200 text-chocolate text-[10px]">
                                  Note: "{entry.customizationNote}"
                                </span>
                              )}
                              {entry.isUnavailable && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-300 text-rose-800 text-[10px] font-bold">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span>Unavailable: {entry.unavailableReason || 'Please remove this item'}</span>
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-bold text-caramel pt-1">
                              Rs. {entry.price.toLocaleString()} each
                            </p>
                          </div>
                        </div>

                        {/* Quantity and Line Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0">
                          {/* Quantity control */}
                          <div className="flex items-center border border-bakery-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(entry._id, entry.quantity, -1, product.stock)}
                              disabled={entry.quantity <= 1 || processingId === entry._id}
                              className="p-1.5 hover:bg-bakery-100 text-bakery-600 disabled:opacity-40 transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-chocolate">
                              {entry.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(entry._id, entry.quantity, 1, product.stock)}
                              disabled={entry.quantity >= (product.stock || 99) || processingId === entry._id}
                              className="p-1.5 hover:bg-bakery-100 text-bakery-600 disabled:opacity-40 transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[80px]">
                            <span className="text-xs sm:text-sm font-bold text-chocolate font-serif block">
                              Rs. {itemTotal.toLocaleString()}
                            </span>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-1">
                            {/* Option edit toggle */}
                            {(product.sizes?.length > 0 || product.flavors?.length > 0 || product.allowsCustomization) && (
                              <button
                                type="button"
                                onClick={() => (isEditing ? setEditingItemId(null) : handleStartEdit(entry))}
                                className="p-1.5 text-bakery-500 hover:text-caramel hover:bg-amber-50 rounded-md transition-colors"
                                title="Change size or flavor"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(entry._id)}
                              className="p-1.5 text-bakery-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Options Editor */}
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-3 border-t border-bakery-100 bg-bakery-50/70 p-3.5 rounded-xl space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-chocolate">
                            <span>Change Item Options:</span>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="text-bakery-400 hover:text-bakery-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {product.sizes && product.sizes.length > 0 && (
                            <div>
                              <label className="block text-[11px] font-semibold text-bakery-700 mb-1">
                                Size Option:
                              </label>
                              <select
                                value={editOptions.selectedSize}
                                onChange={(e) =>
                                  setEditOptions({ ...editOptions, selectedSize: e.target.value })
                                }
                                className="input-bakery text-xs py-1.5 bg-white"
                              >
                                {product.sizes.map((s, i) => (
                                  <option key={i} value={s.name}>
                                    {s.name} {s.price ? `(Rs. ${s.price})` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {product.flavors && product.flavors.length > 0 && (
                            <div>
                              <label className="block text-[11px] font-semibold text-bakery-700 mb-1">
                                Flavor Option:
                              </label>
                              <select
                                value={editOptions.selectedFlavor}
                                onChange={(e) =>
                                  setEditOptions({ ...editOptions, selectedFlavor: e.target.value })
                                }
                                className="input-bakery text-xs py-1.5 bg-white"
                              >
                                {product.flavors.map((flv, i) => (
                                  <option key={i} value={flv}>
                                    {flv}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {product.allowsCustomization && (
                            <div>
                              <label className="block text-[11px] font-semibold text-bakery-700 mb-1">
                                Customization Request:
                              </label>
                              <input
                                type="text"
                                value={editOptions.customizationNote}
                                onChange={(e) =>
                                  setEditOptions({ ...editOptions, customizationNote: e.target.value })
                                }
                                placeholder="e.g. Message on cake, sugar level..."
                                className="input-bakery text-xs py-1.5 bg-white"
                              />
                            </div>
                          )}

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="btn-secondary py-1 px-3 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveOptions(entry._id)}
                              className="btn-primary py-1 px-3.5 text-xs inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Apply Changes</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Cart Summary & Checkout Action */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-bakery-200 p-5 shadow-xs space-y-4 sticky top-20">
              <h3 className="font-serif font-bold text-chocolate text-base border-b border-bakery-100 pb-2.5">
                Cart Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-bakery-600">
                  <span>Total Items</span>
                  <span className="font-semibold text-chocolate">{cartCount}</span>
                </div>
                <div className="flex justify-between text-bakery-600">
                  <span>Payment Method</span>
                  <span className="font-semibold text-chocolate">Cash on Delivery (COD)</span>
                </div>
                <div className="border-t border-bakery-200 pt-2.5 flex justify-between text-sm font-bold text-chocolate">
                  <span>Cart Total</span>
                  <span className="text-caramel font-serif text-lg">
                    Rs. <AnimatedCounter value={totalPrice} />
                  </span>
                </div>
              </div>

              <div className="pt-2">
                {hasUnavailableItem ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="btn-secondary w-full py-3 px-5 text-xs font-bold flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                    >
                      <span>Checkout Disabled</span>
                    </button>
                    <p className="text-[11px] text-rose-600 text-center font-medium">
                      An item in your cart is no longer available ({unavailableNames.join(', ')}). Please remove it to proceed.
                    </p>
                  </div>
                ) : (
                  <Link
                    to="/checkout"
                    className="btn-primary w-full py-3 px-5 text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <div className="pt-1">
                <Link
                  to="/items"
                  className="text-xs text-caramel hover:text-caramel-dark font-medium text-center block transition-colors"
                >
                  ← Add more treats from bakeries
                </Link>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 flex items-center gap-2 text-[11px] text-amber-900">
                <ShieldCheck className="w-4 h-4 text-caramel shrink-0" />
                <span>Handcrafted fresh by verified local home bakers.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Removing Item */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: TIMING.micro }}
              className="bg-white rounded-2xl border border-bakery-200 p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-chocolate">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">Remove Item?</h3>
                  <p className="text-xs text-bakery-600">
                    Are you sure you want to remove this item from your cart?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="btn-secondary py-2 px-4 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  disabled={processingId === confirmDeleteId}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  {processingId === confirmDeleteId ? 'Removing...' : 'Yes, Remove'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
