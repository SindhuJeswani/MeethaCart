import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import {
  ShoppingBag,
  MapPin,
  Phone,
  FileText,
  DollarSign,
  Truck,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Store
} from 'lucide-react';
import { buttonTap, TIMING, EASING } from '../../animations/motion';

const CheckoutPage = () => {
  const { items, cartCount, totalPrice, loading, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const orderPlaced = useRef(false);

  // Synchronize address and phone if user profile updates
  useEffect(() => {
    if (user?.address && !deliveryAddress) {
      setDeliveryAddress(user.address);
    }
    if (user?.phone && !contactNumber) {
      setContactNumber(user.phone);
    }
  }, [user]);

  // If cart is empty, redirect back to /cart
  useEffect(() => {
    if (!loading && items.length === 0 && !isSubmitting && !orderPlaced.current) {
      navigate('/cart');
    }
  }, [items.length, isSubmitting, loading, navigate]);

  // Group items by seller for order breakdown
  const itemsBySeller = items.reduce((acc, entry) => {
    const seller = entry.item?.seller || { name: 'Home Baker', bakeryName: 'Artisan Bakery' };
    const sellerId = seller._id ? seller._id.toString() : 'unknown';
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller,
        items: [],
        subtotal: 0
      };
    }
    acc[sellerId].items.push(entry);
    acc[sellerId].subtotal += entry.price * entry.quantity;
    return acc;
  }, {});

  const sellerGroups = Object.values(itemsBySeller);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Delivery details validation
    if (!deliveryAddress || !deliveryAddress.trim()) {
      setErrorMessage('Please enter a delivery address');
      return;
    }

    if (!contactNumber || !contactNumber.trim()) {
      setErrorMessage('Please enter a contact number');
      return;
    }

    // Check if any cart item is unavailable or not approved
    const unavailableItem = items.find(
      (entry) =>
        entry.isUnavailable ||
        !entry.item ||
        entry.item.isAvailable === false ||
        entry.item.approvalStatus !== 'Approved' ||
        entry.item.seller?.sellerStatus !== 'approved' ||
        entry.item.stock < entry.quantity
    );
    if (unavailableItem) {
      const itemName = unavailableItem.item?.title || unavailableItem.itemTitle || 'An item in your cart';
      setErrorMessage(`${itemName} is no longer available. Please remove it from your cart to proceed.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/orders', {
        deliveryAddress: deliveryAddress.trim(),
        contactNumber: contactNumber.trim(),
        note: note ? note.trim() : '',
        paymentMethod: 'COD'
      });

      if (res.data?.success && res.data.orders) {
        orderPlaced.current = true;
        await refreshCart();
        toast.success('Order placed successfully!');
        navigate('/orders/confirmation', {
          replace: true,
          state: { orders: res.data.orders }
        });
      } else {
        setErrorMessage(res.data?.message || 'Server error. Order was not placed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Server error. Order was not placed.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container py-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          to="/cart"
          className="text-xs font-semibold text-bakery-600 hover:text-chocolate inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shopping Cart</span>
        </Link>
      </div>

      {/* Page Title */}
      <div className="border-b border-bakery-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
          <Truck className="w-7 h-7 text-caramel" />
          <span>Checkout & Delivery Details</span>
        </h1>
        <p className="text-xs text-bakery-600 mt-0.5">
          Provide your delivery address and contact information. Cash on Delivery is confirmed at doorstep.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 shadow-xs"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </motion.div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Details & Payment */}
          <div className="lg:col-span-7 space-y-5">
            {/* Delivery Details Card */}
            <div className="bg-white rounded-2xl border border-bakery-200 p-6 shadow-warm space-y-4">
              <h2 className="font-serif font-bold text-chocolate text-base flex items-center gap-2 border-b border-bakery-100 pb-3">
                <MapPin className="w-5 h-5 text-caramel" />
                <span>Delivery Address & Contact</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House / Apartment number, street, sector, landmarks, city"
                    className="input-bakery text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="0300 1234567"
                      className="input-bakery pl-10 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                    Note for the Baker / Delivery Rider <span className="text-xs text-bakery-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Ring the doorbell twice, please call on arrival..."
                      className="input-bakery pl-10 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Card: COD Only */}
            <div className="bg-white rounded-2xl border border-bakery-200 p-6 shadow-warm space-y-4">
              <h2 className="font-serif font-bold text-chocolate text-base flex items-center gap-2 border-b border-bakery-100 pb-3">
                <DollarSign className="w-5 h-5 text-caramel" />
                <span>Payment Method</span>
              </h2>

              <div className="p-4 rounded-xl border-2 border-caramel bg-amber-50/70 shadow-xs flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💵</span>
                    <h3 className="font-bold text-chocolate text-sm">Cash on Delivery (COD)</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                      Default
                    </span>
                  </div>
                  <p className="text-xs text-bakery-700 leading-relaxed">
                    Pay in exact cash directly to the delivery courier when your fresh handmade treats arrive at your doorstep.
                  </p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-caramel bg-caramel flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-caramel shrink-0" />
                <span>Protected by MeethaCart Freshness Guarantee and Baker Hygiene Standards.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-bakery-200 p-6 shadow-warm space-y-5 sticky top-20">
              <h2 className="font-serif font-bold text-chocolate text-base border-b border-bakery-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-bakery-500">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </span>
              </h2>

              {/* Notice if items from multiple sellers */}
              {sellerGroups.length > 1 && (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-caramel" />
                    <span>Multiple Bakeries in Cart ({sellerGroups.length})</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Your cart contains items from {sellerGroups.length} independent bakers. A separate order will be dispatched from each kitchen.
                  </p>
                </div>
              )}

              {/* Grouped item listing */}
              <div className="space-y-4 divide-y divide-bakery-100 max-h-[360px] overflow-y-auto pr-1">
                {sellerGroups.map((group, gIdx) => (
                  <div key={gIdx} className={gIdx > 0 ? 'pt-3 space-y-2' : 'space-y-2'}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-chocolate">
                      <Store className="w-3.5 h-3.5 text-caramel" />
                      <span>{group.seller?.bakeryName || group.seller?.name || 'Artisan Baker'}</span>
                    </div>

                    <div className="space-y-2">
                      {group.items.map((entry) => (
                        <div
                          key={entry._id}
                          className="flex items-center justify-between gap-3 text-xs bg-bakery-50/60 p-2.5 rounded-lg border border-bakery-200/70"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-chocolate truncate">
                              {entry.item?.title || 'Bakery Item'}
                            </p>
                            <p className="text-[11px] text-bakery-500">
                              Qty: {entry.quantity}
                              {entry.selectedSize ? ` · ${entry.selectedSize}` : ''}
                              {entry.selectedFlavor ? ` · ${entry.selectedFlavor}` : ''}
                            </p>
                          </div>
                          <span className="font-bold text-chocolate shrink-0">
                            Rs. {(entry.price * entry.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="border-t border-bakery-200 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-bakery-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-chocolate">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-bakery-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-emerald-700">Cash on Delivery (Standard)</span>
                </div>
                <div className="border-t border-bakery-200 pt-2 flex justify-between text-base font-bold text-chocolate">
                  <span>Total Amount</span>
                  <span className="text-caramel font-serif text-xl">
                    Rs. <AnimatedCounter value={totalPrice} />
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={buttonTap}
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3.5 px-6 text-xs font-bold flex items-center justify-center gap-2 shadow-warm text-white uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Place Order (Rs. {totalPrice.toLocaleString()})</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
