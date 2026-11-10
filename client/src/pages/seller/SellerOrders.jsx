import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ORDER_STATUS,
  ORDER_LIFECYCLE,
  NEXT_ORDER_STATUS,
  PAYMENT_STATUS
} from '../../config/orderConstants';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  PartyPopper,
  XCircle,
  MapPin,
  Phone,
  User,
  FileText,
  AlertCircle,
  ArrowRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { buttonTap, TIMING, EASING } from '../../animations/motion';

const formatTimestamp = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const NEXT_STEP_LABELS = {
  [ORDER_STATUS.ACCEPTED]: { label: 'Start Baking (Preparing)', icon: ChefHat },
  [ORDER_STATUS.PREPARING]: { label: 'Mark as Packaged (Ready)', icon: ShoppingBag },
  [ORDER_STATUS.READY]: { label: 'Mark as Delivered (Completed)', icon: PartyPopper }
};

const SellerOrders = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionError, setActionError] = useState('');
  const [processingOrderId, setProcessingOrderId] = useState(null);

  // Reject Modal State
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setActionError('');
      const res = await api.get('/orders/seller/my-orders');
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to load seller orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setActionError('');
    try {
      setProcessingOrderId(orderId);
      const res = await api.patch(`/orders/${orderId}/accept`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Order accepted!');
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.order : o))
        );
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Server error. Status was not updated.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleOpenRejectModal = (order) => {
    setRejectModalOrder(order);
    setRejectionReason('');
    setRejectError('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectError('Please enter a reason for rejection');
      return;
    }

    try {
      setProcessingOrderId(rejectModalOrder._id);
      const res = await api.patch(`/orders/${rejectModalOrder._id}/reject`, {
        reason: rejectionReason.trim()
      });

      if (res.data?.success) {
        toast.info('Order marked as rejected.');
        setOrders((prev) =>
          prev.map((o) => (o._id === rejectModalOrder._id ? res.data.order : o))
        );
        setRejectModalOrder(null);
      }
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Server error. Status was not updated.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    setActionError('');
    const nextStatus = NEXT_ORDER_STATUS[currentStatus];
    if (!nextStatus) return;

    try {
      setProcessingOrderId(orderId);
      const res = await api.patch(`/orders/${orderId}/status`, { nextStatus });
      if (res.data?.success) {
        toast.success(`Order status updated to ${nextStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.order : o))
        );
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Server error. Status was not updated.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') {
      return [ORDER_STATUS.PLACED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY].includes(o.status);
    }
    return o.status === filterStatus;
  });

  return (
    <div className="page-container py-8 max-w-5xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bakery-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-caramel" />
            <span>Bakery Orders Management</span>
          </h1>
          <p className="text-xs text-bakery-600 mt-0.5">
            Manage incoming orders, update baking stages sequentially, and track Cash on Delivery.
          </p>
        </div>

        <Link
          to="/seller/dashboard"
          className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Baker Dashboard</span>
        </Link>
      </div>

      {/* Global Action Error Alert */}
      {actionError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shadow-xs"
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="font-medium">{actionError}</span>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-bakery-200 pb-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === 'all'
              ? 'bg-chocolate text-white shadow-xs'
              : 'bg-white text-bakery-700 border border-bakery-200 hover:bg-bakery-50'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === 'active'
              ? 'bg-chocolate text-white shadow-xs'
              : 'bg-white text-bakery-700 border border-bakery-200 hover:bg-bakery-50'
          }`}
        >
          Active / In Progress (
          {
            orders.filter((o) =>
              [ORDER_STATUS.PLACED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY].includes(o.status)
            ).length
          }
          )
        </button>
        <button
          onClick={() => setFilterStatus(ORDER_STATUS.PLACED)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === ORDER_STATUS.PLACED
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-bakery-700 border border-bakery-200 hover:bg-bakery-50'
          }`}
        >
          Placed ({orders.filter((o) => o.status === ORDER_STATUS.PLACED).length})
        </button>
        <button
          onClick={() => setFilterStatus(ORDER_STATUS.COMPLETED)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === ORDER_STATUS.COMPLETED
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-bakery-700 border border-bakery-200 hover:bg-bakery-50'
          }`}
        >
          Completed ({orders.filter((o) => o.status === ORDER_STATUS.COMPLETED).length})
        </button>
        <button
          onClick={() => setFilterStatus(ORDER_STATUS.REJECTED)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === ORDER_STATUS.REJECTED
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-bakery-700 border border-bakery-200 hover:bg-bakery-50'
          }`}
        >
          Rejected ({orders.filter((o) => o.status === ORDER_STATUS.REJECTED).length})
        </button>
      </div>

      {/* Orders List Content */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-caramel rounded-full animate-spin mx-auto" />
          <p className="text-xs text-bakery-600 font-medium">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-bakery-200 p-12 text-center max-w-md mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-caramel mx-auto flex items-center justify-center font-bold text-2xl border border-amber-200">
            📦
          </div>
          <h2 className="text-xl font-serif font-bold text-chocolate">No Orders in this View</h2>
          <p className="text-xs text-bakery-600">
            {filterStatus === 'all'
              ? 'You have not received any orders yet. As buyers place orders for your bakery treats, they will appear here.'
              : `There are currently no orders with status '${filterStatus}'.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isProcessing = processingOrderId === order._id;
            const nextStepInfo = NEXT_STEP_LABELS[order.status];
            const NextStepIcon = nextStepInfo?.icon;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: TIMING.normal }}
                className="bg-white rounded-2xl border border-bakery-200 overflow-hidden shadow-xs hover:border-bakery-300 transition-colors divide-y divide-bakery-100"
              >
                {/* Order Header Row */}
                <div className="p-4 sm:p-5 bg-bakery-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif font-bold text-chocolate text-base">
                        Order #{order.orderNumber || order._id}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                          order.status === ORDER_STATUS.COMPLETED
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === ORDER_STATUS.REJECTED
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : order.status === ORDER_STATUS.PLACED
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          order.paymentStatus === PAYMENT_STATUS.COLLECTED
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        COD: {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-bakery-600">
                      Placed on: {formatTimestamp(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center">
                    <span className="text-[11px] text-bakery-500 uppercase tracking-wider hidden sm:block">
                      Order Total
                    </span>
                    <strong className="font-serif font-bold text-caramel text-base sm:text-lg">
                      Rs. {order.totalAmount?.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Body: Items & Details */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Ordered Items List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-bakery-500 uppercase tracking-wider block">
                      Ordered Items:
                    </span>
                    <div className="space-y-1.5">
                      {order.items?.map((it, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs bg-bakery-50/70 p-2.5 rounded-xl border border-bakery-200/70"
                        >
                          <div>
                            <span className="font-semibold text-chocolate">{it.name}</span>
                            <span className="text-bakery-500 ml-1.5 font-bold">× {it.quantity}</span>
                            {it.selectedSize && <span className="text-bakery-600 text-[11px]"> · Size: {it.selectedSize}</span>}
                            {it.selectedFlavor && <span className="text-bakery-600 text-[11px]"> · Flavor: {it.selectedFlavor}</span>}
                            {it.customizationNote && (
                              <p className="text-[11px] text-amber-900 font-medium italic mt-0.5">
                                Note: "{it.customizationNote}"
                              </p>
                            )}
                          </div>
                          <span className="font-bold text-chocolate shrink-0">
                            Rs. {(it.price * it.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buyer & Delivery Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-amber-50/40 p-3.5 rounded-xl border border-amber-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-chocolate">
                        <User className="w-3.5 h-3.5 text-caramel" />
                        <span>Customer: {order.buyer?.name || 'Customer'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-bakery-600">
                        <Phone className="w-3.5 h-3.5 text-caramel" />
                        <span>{order.contactNumber || order.buyer?.phone || 'No phone'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-start gap-1.5 text-bakery-700">
                        <MapPin className="w-3.5 h-3.5 text-caramel shrink-0 mt-0.5" />
                        <span>
                          <strong>Delivery Address:</strong> {order.deliveryAddress}
                        </span>
                      </div>
                      {order.note && (
                        <div className="flex items-start gap-1.5 text-bakery-700">
                          <FileText className="w-3.5 h-3.5 text-caramel shrink-0 mt-0.5" />
                          <span>
                            <strong>Buyer Note:</strong> "{order.note}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection notice if already rejected */}
                  {order.status === ORDER_STATUS.REJECTED && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 space-y-0.5">
                      <strong className="block font-bold">Rejection Reason:</strong>
                      <p className="italic">"{order.rejectionReason}"</p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-bakery-100">
                    <div className="text-[11px] text-bakery-500">
                      Payment method: <strong className="text-chocolate">Cash on Delivery (COD)</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Placed State: Can Accept or Reject */}
                      {order.status === ORDER_STATUS.PLACED && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(order)}
                            disabled={isProcessing}
                            className="px-3.5 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Reject</span>
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={buttonTap}
                            type="button"
                            onClick={() => handleAcceptOrder(order._id)}
                            disabled={isProcessing}
                            className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isProcessing ? 'Accepting...' : 'Accept Order'}</span>
                          </motion.button>
                        </>
                      )}

                      {/* In-Progress Steps: Move to next step only */}
                      {[ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY].includes(order.status) && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={buttonTap}
                          type="button"
                          onClick={() => handleUpdateStatus(order._id, order.status)}
                          disabled={isProcessing}
                          className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                        >
                          {NextStepIcon && <NextStepIcon className="w-4 h-4" />}
                          <span>{isProcessing ? 'Updating...' : nextStepInfo?.label}</span>
                        </motion.button>
                      )}

                      {/* Completed State */}
                      {order.status === ORDER_STATUS.COMPLETED && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Order Completed · Payment Collected</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal (Reason Required) */}
      <AnimatePresence>
        {rejectModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: TIMING.micro }}
              className="bg-white rounded-2xl border border-bakery-200 p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-chocolate text-base">
                    Reject Order #{rejectModalOrder.orderNumber || rejectModalOrder._id}
                  </h3>
                  <p className="text-xs text-bakery-600">
                    A rejection reason is required so the buyer understands why the order cannot be fulfilled.
                  </p>
                </div>
              </div>

              {rejectError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{rejectError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-bakery-700 mb-1.5 uppercase tracking-wider">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Kitchen fully booked for today, ingredients out of stock, delivery location outside range..."
                  className="input-bakery text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-bakery-100">
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="btn-secondary py-2 px-4 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={processingOrderId === rejectModalOrder._id}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  {processingOrderId === rejectModalOrder._id ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerOrders;
