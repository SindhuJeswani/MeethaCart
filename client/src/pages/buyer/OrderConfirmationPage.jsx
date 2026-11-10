import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Truck,
  Store,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Phone
} from 'lucide-react';
import { buttonTap, TIMING, EASING } from '../../animations/motion';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const orders = location.state?.orders || [];

  // Launch celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D97706', '#C77B30', '#4A2C1A', '#F59E0B']
      });
    } catch {
      // fallback
    }
  }, []);

  if (!orders || orders.length === 0) {
    return (
      <div className="page-container py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center font-bold text-2xl">
          <ShoppingBag className="w-8 h-8 text-caramel" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-chocolate">
          Order Placed
        </h2>
        <p className="text-xs text-bakery-600">
          Your orders have been dispatched to local artisan bakers.
        </p>
        <Link to="/items" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-6 shadow-xs">
          <span>Explore More Bakes</span>
        </Link>
      </div>
    );
  }

  const grandTotal = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="page-container py-10 max-w-3xl mx-auto space-y-8">
      {/* Top Hero Confirmation Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="bg-white rounded-2xl border border-bakery-200 p-8 sm:p-10 text-center shadow-warm space-y-5"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-200 shadow-xs">
          <svg viewBox="0 0 52 52" className="w-12 h-12 stroke-emerald-600 fill-none stroke-[3]">
            <circle cx="26" cy="26" r="23" strokeLinecap="round" />
            <path
              d="M14 27l7 7 17-17"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-checkmark"
            />
          </svg>
        </div>

        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
            Order Placed Successfully
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate">
            Thank you! Your order is baking.
          </h1>
          <p className="text-xs sm:text-sm text-bakery-600 max-w-md mx-auto leading-relaxed">
            {orders.length === 1
              ? 'The artisan home baker has received your order and will begin fresh preparation.'
              : `Your items have been separated into ${orders.length} orders for individual artisan bakeries.`}
          </p>
        </div>
      </motion.div>

      {/* Created Orders Breakdown */}
      <div className="space-y-4">
        <h2 className="font-serif font-bold text-chocolate text-lg">
          {orders.length === 1 ? 'Order Details & Live Tracking' : `Orders Placed (${orders.length})`}
        </h2>

        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: TIMING.normal }}
              className="bg-white rounded-2xl border border-bakery-200 p-6 shadow-xs hover:border-bakery-300 transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bakery-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-serif font-bold text-chocolate">
                      Order #{order.orderNumber || order._id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                      {order.status || 'Placed'}
                    </span>
                  </div>
                  <p className="text-xs text-bakery-600 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-caramel" />
                    <strong className="text-chocolate">
                      {order.seller?.bakeryName || order.seller?.name || 'Artisan Baker'}
                    </strong>
                    {order.seller?.phone && <span>· {order.seller.phone}</span>}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-bakery-500 block">Total Amount</span>
                  <strong className="font-serif font-bold text-caramel text-base">
                    Rs. {order.totalAmount?.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Items List in this order */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-bakery-500 uppercase tracking-wider block">
                  Items in this order:
                </span>
                <div className="space-y-1.5">
                  {order.items?.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-bakery-50/70 p-2.5 rounded-xl border border-bakery-100 text-bakery-800"
                    >
                      <div>
                        <span className="font-semibold text-chocolate">{it.name}</span>
                        <span className="text-bakery-500 ml-1.5">× {it.quantity}</span>
                        {it.selectedSize && <span className="text-bakery-500 text-[11px]"> · {it.selectedSize}</span>}
                        {it.selectedFlavor && <span className="text-bakery-500 text-[11px]"> · {it.selectedFlavor}</span>}
                        {it.customizationNote && (
                          <span className="block text-[10px] text-bakery-600 italic">
                            "{it.customizationNote}"
                          </span>
                        )}
                      </div>
                      <strong className="text-chocolate">
                        Rs. {(it.price * it.quantity).toLocaleString()}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispatch Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-bakery-700">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-caramel shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-chocolate">Delivery Address:</strong> {order.deliveryAddress}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-caramel shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-chocolate">Contact:</strong> {order.contactNumber}
                  </span>
                </div>
              </div>

              {/* Link to order's tracking page */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-bakery-500">
                  Payment: <strong className="text-chocolate">Cash on Delivery (Pending)</strong>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="btn-primary w-full sm:w-auto text-xs py-2 px-5 inline-flex items-center justify-center gap-2 shadow-xs"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Order #{order.orderNumber || order._id}</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-2 flex justify-center">
        <Link
          to="/items"
          className="btn-secondary text-xs py-2.5 px-6 inline-flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4 text-caramel" />
          <span>Browse More Bakery Treats</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
