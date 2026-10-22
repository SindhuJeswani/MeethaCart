import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  PackageCheck,
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  PartyPopper,
  ChevronDown,
  ChevronUp,
  Store,
  MapPin,
  Phone,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const ORDER_STAGES = [
  { id: 'placed', step: 1, label: 'Placed', labelUrdu: 'آرڈر موصول', desc: 'Order received by baker', icon: PackageCheck },
  { id: 'accepted', step: 2, label: 'Accepted', labelUrdu: 'منظور شدہ', desc: 'Baker accepted request', icon: CheckCircle2 },
  { id: 'preparing', step: 3, label: 'Preparing', labelUrdu: 'تیاری جاری', desc: 'Baking fresh in kitchen', icon: ChefHat },
  { id: 'ready', step: 4, label: 'Ready', labelUrdu: 'پیکنگ مکمل', desc: 'Packaged & ready for courier', icon: ShoppingBag },
  { id: 'completed', step: 5, label: 'Completed', labelUrdu: 'ترسیل مکمل', desc: 'Delivered fresh to doorstep', icon: PartyPopper }
];

const INITIAL_ORDERS = [
  {
    _id: 'MC-8492',
    date: 'Today, 2:15 PM',
    bakeryName: "Grandma's Oven Delight",
    bakerPhone: '0300 8765432',
    status: 'preparing',
    totalAmount: 3550,
    paymentMethod: 'Cash on Delivery',
    items: [
      { name: 'Artisan Belgian Chocolate Cake', qty: 1, price: 2400, weight: '2 lbs' },
      { name: 'Pistachio Almond Nan Khatai', qty: 2, price: 950, weight: '12 pcs' }
    ],
    deliveryAddress: 'House 42, Street 7, F-8/2, Islamabad'
  },
  {
    _id: 'MC-7301',
    date: '18 Oct 2026',
    bakeryName: 'Lahori Heritage Bakes',
    bakerPhone: '0321 4455667',
    status: 'completed',
    totalAmount: 1850,
    paymentMethod: 'MeethaCart Wallet',
    items: [
      { name: 'Traditional Gulab Jamun Cheesecake', qty: 1, price: 1650, weight: '1.5 lbs' }
    ],
    deliveryAddress: 'Office 301, Blue Area, Islamabad'
  }
];

const OrderTrackingPage = () => {
  const { isUrdu } = useTranslation();
  const toast = useToast();
  const [activeStatus, setActiveStatus] = useState('preparing');
  const [expandedOrderId, setExpandedOrderId] = useState('MC-8492');

  const currentStageIndex = ORDER_STAGES.findIndex((s) => s.id === activeStatus);

  const handleSimulateStatus = (statusId) => {
    setActiveStatus(statusId);
    const stage = ORDER_STAGES.find((s) => s.id === statusId);
    toast.info(`Order status updated to: ${stage?.label}`);
  };

  return (
    <div className="page-container py-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bakery-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-caramel" />
            <span>{isUrdu ? 'لائیو آرڈر ٹریکنگ اور سابقہ آرڈرز' : 'Live Order Tracking & History'}</span>
          </h1>
          <p className="text-xs text-bakery-600 mt-0.5">
            {isUrdu
              ? 'اپنے تازہ تیار شدہ کیک اور بیکری اشیاء کی تیاری کے مراحل لائیو دیکھیں'
              : 'Real-time progress for your handcrafted orders from oven to doorstep.'}
          </p>
        </div>
        <Link
          to="/items"
          className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-caramel" />
          <span>{isUrdu ? 'مزید آرڈر کریں' : 'Order More Bakes'}</span>
        </Link>
      </div>

      {/* Active Order Live Tracking Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="bg-white rounded-2xl border border-bakery-200 p-6 sm:p-8 shadow-warm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bakery-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wide">
                Live Tracking
              </span>
              <span className="text-xs font-semibold text-bakery-500">Order #MC-8492</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-chocolate">
              Grandma's Oven Delight
            </h2>
            <p className="text-xs text-bakery-600">
              Expected arrival: <strong className="text-chocolate">Today by 5:15 PM</strong>
            </p>
          </div>

          {/* Interactive Simulation Pills (for smooth testing of animations) */}
          <div className="flex flex-col sm:items-end gap-1.5">
            <span className="text-[10px] text-bakery-500 font-semibold uppercase tracking-wider">
              Simulate Status Transition:
            </span>
            <div className="flex flex-wrap gap-1">
              {ORDER_STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSimulateStatus(s.id)}
                  className={`text-[10px] px-2 py-1 rounded font-semibold transition-all ${
                    activeStatus === s.id
                      ? 'bg-chocolate text-white ring-2 ring-caramel'
                      : 'bg-bakery-100 text-bakery-700 hover:bg-bakery-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Progress Timeline */}
        <div className="pt-2 pb-4">
          <div className="relative">
            {/* Background line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-bakery-100 rounded-full z-0" />
            {/* Smooth filling line */}
            <motion.div
              className="absolute top-6 left-6 h-1 bg-gradient-to-r from-amber-500 to-caramel rounded-full z-0"
              initial={false}
              animate={{
                width: `${(currentStageIndex / (ORDER_STAGES.length - 1)) * 92}%`
              }}
              transition={{ duration: TIMING.slow, ease: EASING.out }}
            />

            <div className="relative z-10 flex items-start justify-between">
              {ORDER_STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isUpcoming = idx > currentStageIndex;
                const StageIcon = stage.icon;

                return (
                  <div key={stage.id} className="flex flex-col items-center text-center max-w-[90px] sm:max-w-[120px]">
                    {/* Node circle with pulse or check */}
                    <div className="relative mb-2">
                      <motion.div
                        initial={false}
                        animate={
                          isCurrent
                            ? { scale: [1, 1.14, 1] }
                            : { scale: 1 }
                        }
                        transition={
                          isCurrent
                            ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.2 }
                        }
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-xs transition-colors ${
                          isPassed
                            ? 'bg-emerald-600 text-white border-2 border-emerald-600 ring-4 ring-emerald-50'
                            : isCurrent
                            ? 'bg-chocolate text-white border-2 border-caramel ring-4 ring-amber-200 shadow-warm'
                            : 'bg-white text-bakery-400 border-2 border-bakery-200'
                        }`}
                      >
                        {isPassed ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </motion.div>
                        ) : (
                          <StageIcon className="w-5 h-5" />
                        )}
                      </motion.div>

                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-caramel opacity-75" />
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-caramel" />
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-xs font-bold leading-tight ${
                        isCurrent
                          ? 'text-chocolate'
                          : isPassed
                          ? 'text-emerald-800'
                          : 'text-bakery-400'
                      }`}
                    >
                      {isUrdu ? stage.labelUrdu : stage.label}
                    </h4>
                    <p className="text-[10px] text-bakery-500 hidden sm:block mt-0.5 leading-snug">
                      {stage.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dispatch & Baker info pill */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs bg-bakery-50 p-4 rounded-xl border border-bakery-200">
          <div className="flex items-start gap-2.5">
            <Store className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
            <div>
              <span className="text-bakery-500 block">Artisan Kitchen:</span>
              <strong className="text-chocolate">Grandma's Oven Delight (F-8/2, Islamabad)</strong>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
            <div>
              <span className="text-bakery-500 block">Baker Contact:</span>
              <strong className="text-chocolate">0300 8765432</strong>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Order History Section with Expandable Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-chocolate">
            {isUrdu ? 'سابقہ آرڈرز کی تاریخ' : 'Recent Order History'}
          </h2>
          <p className="text-xs text-bakery-600">
            {isUrdu ? 'تفصیلات دیکھنے کے لیے کسی بھی آرڈر پر کلک کریں' : 'Click any past order to expand items and delivery breakdown.'}
          </p>
        </div>

        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {INITIAL_ORDERS.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            return (
              <motion.div
                key={order._id}
                variants={staggerItem}
                layout
                className="bg-white rounded-xl border border-bakery-200 overflow-hidden shadow-xs hover:border-bakery-300 transition-colors"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-bakery-100 text-chocolate flex items-center justify-center font-serif font-bold text-sm shrink-0 border border-bakery-200">
                      🧁
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-chocolate text-sm">Order #{order._id}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                            order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-bakery-600 mt-0.5">
                        {order.bakeryName} · {order.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-serif font-bold text-chocolate text-sm sm:text-base">
                      Rs. {order.totalAmount.toLocaleString()}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: TIMING.micro }}
                      className="text-bakery-500"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>

                {/* Smooth Expandable Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: TIMING.normal, ease: EASING.out }}
                      className="overflow-hidden border-t border-bakery-100 bg-bakery-50/50"
                    >
                      <div className="p-4 sm:p-5 space-y-3 text-xs">
                        <div className="space-y-2">
                          <span className="font-semibold text-bakery-700 block uppercase tracking-wider text-[10px]">
                            Ordered Items:
                          </span>
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-bakery-700 bg-white p-2.5 rounded-lg border border-bakery-200">
                              <span>
                                {item.name} <strong className="text-chocolate">× {item.qty}</strong> ({item.weight})
                              </span>
                              <strong className="text-chocolate">Rs. {(item.price * item.qty).toLocaleString()}</strong>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-bakery-600">
                          <div>
                            <span className="text-[11px] block text-bakery-500">Delivery Address:</span>
                            <span className="text-chocolate font-medium">{order.deliveryAddress}</span>
                          </div>
                          <div>
                            <span className="text-[11px] block text-bakery-500">Payment Option:</span>
                            <span className="text-chocolate font-medium">{order.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
