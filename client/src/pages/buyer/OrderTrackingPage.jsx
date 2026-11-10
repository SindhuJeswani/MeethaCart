import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ORDER_STATUS, ORDER_LIFECYCLE } from '../../config/orderConstants';
import {
  PackageCheck,
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  PartyPopper,
  Store,
  MapPin,
  Phone,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  XCircle,
  FileText
} from 'lucide-react';
import { TIMING, EASING } from '../../animations/motion';

const STAGE_CONFIG = {
  [ORDER_STATUS.PLACED]: {
    label: 'Placed',
    desc: 'Order received by home baker',
    icon: PackageCheck
  },
  [ORDER_STATUS.ACCEPTED]: {
    label: 'Accepted',
    desc: 'Baker confirmed and scheduled',
    icon: CheckCircle2
  },
  [ORDER_STATUS.PREPARING]: {
    label: 'Preparing',
    desc: 'Baking fresh in artisan kitchen',
    icon: ChefHat
  },
  [ORDER_STATUS.READY]: {
    label: 'Ready',
    desc: 'Packaged & ready for dispatch',
    icon: ShoppingBag
  },
  [ORDER_STATUS.COMPLETED]: {
    label: 'Completed',
    desc: 'Delivered fresh to doorstep',
    icon: PartyPopper
  }
};

const formatTimestamp = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const OrderTrackingPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let isActive = true;
    const fetchOrder = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
          setError('');
          setUnauthorized(false);
        }
        const res = await api.get(`/orders/${id}`);
        if (isActive && res.data?.success && res.data.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        if (!isActive) return;
        if (!showLoading) {
          console.warn('Failed to refresh order status:', err.message);
          return;
        }
        if (err.response?.status === 403 || err.message?.includes('Unauthorized')) {
          setUnauthorized(true);
          setError('Unauthorized access. Only the owner buyer can view this order tracking page.');
        } else if (err.response?.status === 404) {
          setError('Order not found.');
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load order details.');
        }
      } finally {
        if (isActive && showLoading) setLoading(false);
      }
    };

    if (id) {
      fetchOrder(true);
    }
    const refreshTimer = window.setInterval(() => {
      if (id) fetchOrder();
    }, 5000);
    return () => {
      isActive = false;
      window.clearInterval(refreshTimer);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-container py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-caramel rounded-full animate-spin" />
        <p className="text-sm font-medium text-bakery-700">Loading order tracking...</p>
      </div>
    );
  }

  if (unauthorized || error || !order) {
    return (
      <div className="page-container py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold text-2xl border border-red-200">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-chocolate">
          {unauthorized ? 'Access Restricted' : 'Order Not Found'}
        </h2>
        <p className="text-xs text-bakery-600 leading-relaxed">
          {error || 'This order could not be located or you do not have permission to view it.'}
        </p>
        <Link to="/items" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-6 shadow-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Bakery Items</span>
        </Link>
      </div>
    );
  }

  const isRejected = order.status === ORDER_STATUS.REJECTED;
  const currentStageIndex = ORDER_LIFECYCLE.indexOf(order.status);

  // Map statusHistory to quick lookup by status
  const historyMap = (order.statusHistory || []).reduce((acc, entry) => {
    acc[entry.status] = entry;
    return acc;
  }, {});

  return (
    <div className="page-container py-8 max-w-4xl mx-auto space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bakery-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-bakery-500">Live Order Tracking</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
              #{order.orderNumber || order._id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate">
            {order.seller?.bakeryName || order.seller?.name || 'Artisan Bakery'}
          </h1>
          <p className="text-xs text-bakery-600 mt-0.5">
            Placed on: {formatTimestamp(order.createdAt)}
          </p>
        </div>

        <Link
          to="/items"
          className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-caramel" />
          <span>Browse More Bakes</span>
        </Link>
      </div>

      {/* Rejection Alert Banner (If order was rejected by seller) */}
      {isRejected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-red-50 border-2 border-red-200 text-red-900 shadow-sm space-y-2"
        >
          <div className="flex items-center gap-2.5">
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
            <h3 className="font-serif font-bold text-lg text-red-900">
              Order Rejected by Baker
            </h3>
          </div>
          <p className="text-xs text-red-800 leading-relaxed pl-8">
            The home baker was unable to accept this order at this time.
          </p>
          <div className="mt-3 pl-8">
            <div className="p-3.5 rounded-xl bg-white border border-red-200 text-xs">
              <span className="font-bold text-red-900 block mb-1">Reason for Rejection:</span>
              <p className="text-red-800 italic">
                "{order.rejectionReason || 'Kitchen capacity exceeded for requested delivery time.'}"
              </p>
              {historyMap[ORDER_STATUS.REJECTED]?.timestamp && (
                <span className="text-[10px] text-bakery-500 block mt-2">
                  Rejected at: {formatTimestamp(historyMap[ORDER_STATUS.REJECTED].timestamp)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Timeline Card (Only for non-rejected orders or shows timeline up to rejection) */}
      {!isRejected && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal, ease: EASING.out }}
          className="bg-white rounded-2xl border border-bakery-200 p-6 sm:p-8 shadow-warm space-y-8"
        >
          <div className="flex items-center justify-between border-b border-bakery-100 pb-4">
            <div>
              <h2 className="font-serif font-bold text-chocolate text-lg">
                Order Status Timeline
              </h2>
              <p className="text-xs text-bakery-600 mt-0.5">
                Current State: <strong className="text-caramel uppercase">{order.status}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-bakery-500 uppercase tracking-wider block">Payment</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border inline-block ${
                  order.paymentStatus === 'Collected'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                COD · {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pt-4 pb-2">
            {/* Background line */}
            <div className="absolute top-10 left-8 right-8 h-1 bg-bakery-100 rounded-full z-0 hidden sm:block" />
            {/* Filling line */}
            <motion.div
              className="absolute top-10 left-8 h-1 bg-gradient-to-r from-amber-500 to-caramel rounded-full z-0 hidden sm:block"
              initial={false}
              animate={{
                width: `${Math.max(0, (currentStageIndex / (ORDER_LIFECYCLE.length - 1)) * 88)}%`
              }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
            />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2">
              {ORDER_LIFECYCLE.map((stageName, idx) => {
                const config = STAGE_CONFIG[stageName];
                const StageIcon = config.icon;
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isUpcoming = idx > currentStageIndex;
                const historyEntry = historyMap[stageName];
                const stageTime = historyEntry?.timestamp ? formatTimestamp(historyEntry.timestamp) : null;

                return (
                  <div key={stageName} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    {/* Circle Node */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-xs transition-colors ${
                          isPassed
                            ? 'bg-emerald-600 text-white border-2 border-emerald-600 ring-4 ring-emerald-50'
                            : isCurrent
                            ? 'bg-chocolate text-white border-2 border-caramel ring-4 ring-amber-200 shadow-warm'
                            : 'bg-white text-bakery-400 border-2 border-bakery-200'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <StageIcon className="w-5 h-5" />
                        )}
                      </div>

                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-caramel opacity-75" />
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-caramel" />
                        </span>
                      )}
                    </div>

                    {/* Step Text & Timestamp */}
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-bold leading-tight ${
                          isCurrent
                            ? 'text-chocolate font-bold'
                            : isPassed
                            ? 'text-emerald-800'
                            : 'text-bakery-400'
                        }`}
                      >
                        {config.label}
                      </h4>
                      <p className="text-[10px] text-bakery-500 leading-snug hidden sm:block mt-0.5">
                        {config.desc}
                      </p>
                      {stageTime ? (
                        <span className="text-[10px] text-bakery-600 font-semibold block mt-1 bg-bakery-50 px-1.5 py-0.5 rounded border border-bakery-200/60">
                          {stageTime}
                        </span>
                      ) : (
                        <span className="text-[10px] text-bakery-300 block mt-1">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Order Items & Order Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Items List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-bakery-200 p-6 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-chocolate text-base border-b border-bakery-100 pb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-caramel" />
            <span>Ordered Items</span>
          </h3>

          <div className="space-y-3 divide-y divide-bakery-100">
            {order.items?.map((it, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-3 flex justify-between gap-3' : 'flex justify-between gap-3'}>
                <div>
                  <h4 className="font-bold text-chocolate text-xs sm:text-sm">{it.name}</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-bakery-600">
                    <span className="font-semibold text-chocolate">Quantity: {it.quantity}</span>
                    {it.selectedSize && <span>· Size: {it.selectedSize}</span>}
                    {it.selectedFlavor && <span>· Flavor: {it.selectedFlavor}</span>}
                  </div>
                  {it.customizationNote && (
                    <p className="text-[11px] text-bakery-700 italic pt-1">
                      Note: "{it.customizationNote}"
                    </p>
                  )}
                  <p className="text-xs text-caramel font-semibold mt-1">
                    Rs. {it.price.toLocaleString()} each
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-chocolate font-serif">
                    Rs. {(it.price * it.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-bakery-200 pt-3 flex justify-between items-center text-sm font-bold text-chocolate">
            <span>Total Amount:</span>
            <span className="font-serif text-lg text-caramel">
              Rs. {order.totalAmount?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dispatch & Delivery Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-bakery-200 p-5 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-chocolate text-sm border-b border-bakery-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-caramel" />
              <span>Delivery Details</span>
            </h3>

            <div className="space-y-3 text-xs text-bakery-700">
              <div>
                <span className="text-bakery-500 block text-[11px] uppercase tracking-wider">
                  Delivery Address:
                </span>
                <strong className="text-chocolate font-medium block mt-0.5">
                  {order.deliveryAddress}
                </strong>
              </div>

              <div>
                <span className="text-bakery-500 block text-[11px] uppercase tracking-wider">
                  Contact Phone:
                </span>
                <strong className="text-chocolate font-medium block mt-0.5">
                  {order.contactNumber}
                </strong>
              </div>

              {order.note && (
                <div>
                  <span className="text-bakery-500 block text-[11px] uppercase tracking-wider">
                    Buyer Note for Seller:
                  </span>
                  <p className="text-bakery-700 italic mt-0.5">"{order.note}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Baker Details Card */}
          <div className="bg-white rounded-2xl border border-bakery-200 p-5 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-chocolate text-sm border-b border-bakery-100 pb-2 flex items-center gap-2">
              <Store className="w-4 h-4 text-caramel" />
              <span>Baker Kitchen</span>
            </h3>

            <div className="space-y-1.5 text-xs text-bakery-700">
              <p className="font-bold text-chocolate text-sm">
                {order.seller?.bakeryName || order.seller?.name || 'Artisan Baker'}
              </p>
              {order.seller?.address && (
                <p className="text-bakery-600">Location: {order.seller.address}</p>
              )}
              {order.seller?.phone && (
                <p className="text-bakery-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-caramel" />
                  <span>{order.seller.phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
