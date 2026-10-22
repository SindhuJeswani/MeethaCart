import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Truck,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ShoppingBasket
} from 'lucide-react';
import {
  fadeIn,
  fadeUp,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const STEPS = [
  { id: 1, label: 'Cart Review', labelUrdu: 'ٹوکری جائزہ' },
  { id: 2, label: 'Delivery Details', labelUrdu: 'ترسیل کی تفصیل' },
  { id: 3, label: 'Payment Method', labelUrdu: 'طریقہ ادائیگی' },
  { id: 4, label: 'Confirmation', labelUrdu: 'آرڈر تصدیق' }
];

const CartPage = () => {
  const { items, cartCount, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { isUrdu } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [deliveryType, setDeliveryType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState('House 42, Street 7, F-8/2, Islamabad');
  const [contactPhone, setContactPhone] = useState('0300 1234567');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Please handle with care, fresh butter cake inside.');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const deliveryFee = deliveryType === 'express' ? 350 : 200;
  const grandTotal = totalPrice > 0 ? totalPrice + deliveryFee : 0;

  const goToStep = (targetStep) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    setTimeout(() => {
      setIsPlacingOrder(false);
      setOrderCompleted(true);
      clearCart();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D97706', '#C77B30', '#4A2C1A', '#F59E0B']
        });
      } catch {
        // fallback
      }

      toast.success(isUrdu ? 'آپ کا آرڈر کامیابی سے موصول ہو گیا ہے!' : 'Order placed successfully! Baker notified.');
    }, 1200);
  };

  const stepVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: TIMING.normal, ease: EASING.out }
    },
    exit: (dir) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      transition: { duration: TIMING.fast, ease: EASING.in }
    })
  };

  return (
    <div className="page-container py-8 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bakery-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-caramel" />
            <span>{isUrdu ? 'بیکری شاپنگ کارٹ اور چیک آؤٹ' : 'Bakery Cart & Checkout'}</span>
          </h1>
          <p className="text-xs text-bakery-600 mt-0.5">
            {isUrdu
              ? 'اپنے منتخب کردہ گھریلو کیک اور بیکری آئٹمز کا جائزہ لیں'
              : 'Review your handcrafted sweets, choose delivery and confirm order.'}
          </p>
        </div>

        {items.length > 0 && !orderCompleted && (
          <button
            onClick={() => {
              clearCart();
              toast.info('Cart cleared');
            }}
            className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1.5 self-start sm:self-auto py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'کارٹ خالی کریں' : 'Clear Cart'}</span>
          </button>
        )}
      </div>

      {/* Interactive Step Indicator with animated filling line */}
      {!orderCompleted && items.length > 0 && (
        <div className="bg-white rounded-xl border border-bakery-200 p-4 shadow-xs">
          <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
            <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-bakery-100 rounded-full z-0" />
            <motion.div
              className="absolute top-1/2 left-8 -translate-y-1/2 h-1 bg-caramel rounded-full z-0"
              initial={false}
              animate={{
                width: `${((step - 1) / (STEPS.length - 1)) * 90}%`
              }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
            />

            {STEPS.map((s) => {
              const isActive = step === s.id;
              const isPassed = step > s.id;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={buttonTap}
                    disabled={s.id > step}
                    onClick={() => goToStep(s.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs ${
                      isPassed
                        ? 'bg-caramel text-white border-2 border-caramel'
                        : isActive
                        ? 'bg-chocolate text-white ring-4 ring-amber-100 border-2 border-chocolate'
                        : 'bg-white text-bakery-400 border-2 border-bakery-200'
                    }`}
                  >
                    {isPassed ? <CheckCircle className="w-4 h-4" /> : s.id}
                  </motion.button>
                  <span
                    className={`text-[11px] font-medium hidden sm:block ${
                      isActive ? 'text-chocolate font-bold' : 'text-bakery-500'
                    }`}
                  >
                    {isUrdu ? s.labelUrdu : s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {orderCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: TIMING.normal, ease: EASING.out }}
          className="bg-white rounded-2xl border border-bakery-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-warm space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-200 shadow-xs">
            <svg viewBox="0 0 52 52" className="w-12 h-12 stroke-emerald-600 fill-none stroke-[3]">
              <circle cx="26" cy="26" r="23" strokeLinecap="round" />
              <path d="M14 27l7 7 17-17" strokeLinecap="round" strokeLinejoin="round" className="animate-checkmark" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
              {isUrdu ? 'آرڈر تصدیق شدہ' : 'Order Placed • #MC-8492'}
            </span>
            <h2 className="text-2xl font-serif font-bold text-chocolate">
              {isUrdu ? 'شکریہ! آپ کا آرڈر تیار ہو رہا ہے' : 'Thank you! Your order is baking.'}
            </h2>
            <p className="text-xs sm:text-sm text-bakery-600 max-w-sm mx-auto leading-relaxed">
              {isUrdu
                ? 'ہوم بیکر کو آپ کی فرمائش موصول ہو گئی ہے۔ آپ آرڈر کے مراحل لائیو ٹریک کر سکتے ہیں۔'
                : 'The artisan baker has received your order and will start fresh preparation according to schedule.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bakery-50 border border-bakery-200 text-left text-xs space-y-2">
            <div className="flex justify-between text-bakery-700">
              <span>Estimated Delivery:</span>
              <strong className="text-chocolate">Today, 4:30 PM - 5:30 PM</strong>
            </div>
            <div className="flex justify-between text-bakery-700">
              <span>Payment Mode:</span>
              <strong className="text-chocolate uppercase">{paymentMethod === 'wallet' ? 'MeethaCart Wallet' : 'Cash on Delivery (COD)'}</strong>
            </div>
            <div className="flex justify-between text-bakery-700">
              <span>Total Amount:</span>
              <strong className="text-caramel font-bold">Rs. {grandTotal || 3550}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/orders"
              className="btn-primary w-full sm:w-auto text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>{isUrdu ? 'آرڈر ٹریک کریں' : 'Track Order Status'}</span>
            </Link>
            <Link
              to="/items"
              className="btn-secondary w-full sm:w-auto text-xs py-2.5 px-5 flex items-center justify-center gap-2"
            >
              <span>{isUrdu ? 'مزید بیکری آئٹمز دیکھیں' : 'Browse More Bakes'}</span>
            </Link>
          </div>
        </motion.div>
      ) : items.length === 0 ? (
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
              {isUrdu ? 'آپ کی شاپنگ کارٹ خالی ہے' : 'Your bakery cart is empty'}
            </h2>
            <p className="text-xs text-bakery-600 max-w-xs mx-auto leading-relaxed">
              {isUrdu
                ? 'اپنے پسندیدہ کیک، پیسٹری اور مٹھائیاں شامل کرنے کے لیے مینیو کا رخ کریں۔'
                : 'Treat yourself or loved ones with freshly baked treats from authentic local home bakers.'}
            </p>
          </div>

          <Link
            to="/items"
            className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5 shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isUrdu ? 'ابھی بیکری اشیاء دیکھیں' : 'Explore Bakery Treats'}</span>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4"
                >
                  <div className="bg-white rounded-xl border border-bakery-200 overflow-hidden shadow-xs divide-y divide-bakery-100">
                    <div className="p-4 bg-bakery-50/70 flex items-center justify-between text-xs font-semibold text-bakery-700">
                      <span>Selected Items ({cartCount})</span>
                      <span>Subtotal</span>
                    </div>

                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, scale: 0.95 }}
                          transition={{ duration: TIMING.normal, ease: EASING.out }}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover border border-bakery-200 shrink-0 bg-bakery-100"
                            />
                            <div>
                              <h3 className="font-serif font-bold text-chocolate text-sm line-clamp-1">
                                {isUrdu && item.nameUrdu ? item.nameUrdu : item.name}
                              </h3>
                              <p className="text-[11px] text-bakery-500">
                                {item.seller?.bakeryName || item.seller?.name || 'Home Baker'} · {item.weight}
                              </p>
                              <p className="text-xs font-semibold text-caramel mt-0.5">
                                Rs. {item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-5">
                            <div className="flex items-center border border-bakery-300 rounded-lg overflow-hidden bg-white">
                              <motion.button
                                whileTap={buttonTap}
                                onClick={() => updateQuantity(item._id, -1)}
                                className="p-1.5 hover:bg-bakery-100 text-bakery-600 transition-colors"
                                title="Decrease"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </motion.button>
                              <span className="w-8 text-center text-xs font-bold text-chocolate overflow-hidden inline-block">
                                <motion.span
                                  key={item.quantity}
                                  initial={{ y: -8, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  className="inline-block"
                                  transition={{ duration: TIMING.micro }}
                                >
                                  {item.quantity}
                                </motion.span>
                              </span>
                              <motion.button
                                whileTap={buttonTap}
                                onClick={() => updateQuantity(item._id, 1)}
                                className="p-1.5 hover:bg-bakery-100 text-bakery-600 transition-colors"
                                title="Increase"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>

                            <span className="text-xs font-bold text-chocolate min-w-[70px] text-right">
                              Rs. {(item.price * item.quantity).toLocaleString()}
                            </span>

                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={buttonTap}
                              onClick={() => removeItem(item._id)}
                              className="p-1.5 text-bakery-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="flex justify-end pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={buttonTap}
                      onClick={() => goToStep(2)}
                      className="btn-primary py-2.5 px-6 text-xs inline-flex items-center gap-2 shadow-xs"
                    >
                      <span>Proceed to Delivery</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="bg-white rounded-xl border border-bakery-200 p-6 shadow-xs space-y-5"
                >
                  <h3 className="font-serif font-bold text-chocolate text-base">
                    Delivery Address & Schedule
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                        Complete Delivery Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-bakery"
                        placeholder="Apartment, house number, street, city"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                          Recipient Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="input-bakery"
                          placeholder="0300 1234567"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                          Delivery Speed
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDeliveryType('standard')}
                            className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                              deliveryType === 'standard'
                                ? 'border-caramel bg-amber-50/70 font-bold text-chocolate ring-2 ring-caramel/20'
                                : 'border-bakery-200 text-bakery-700 hover:bg-bakery-50'
                            }`}
                          >
                            <div>Standard (Rs. 200)</div>
                            <div className="text-[10px] text-bakery-500 font-normal mt-0.5">3-4 hours</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeliveryType('express')}
                            className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                              deliveryType === 'express'
                                ? 'border-caramel bg-amber-50/70 font-bold text-chocolate ring-2 ring-caramel/20'
                                : 'border-bakery-200 text-bakery-700 hover:bg-bakery-50'
                            }`}
                          >
                            <div>Express (Rs. 350)</div>
                            <div className="text-[10px] text-bakery-500 font-normal mt-0.5">90 mins priority</div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                        Baking or Delivery Instructions (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        className="input-bakery"
                        placeholder="E.g. Write 'Happy Birthday Sarah' on the fondant card..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-bakery-100">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Cart</span>
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={buttonTap}
                      type="button"
                      onClick={() => goToStep(3)}
                      className="btn-primary py-2 px-6 text-xs inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="bg-white rounded-xl border border-bakery-200 p-6 shadow-xs space-y-5"
                >
                  <h3 className="font-serif font-bold text-chocolate text-base">
                    Choose Payment Option
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={buttonTap}
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-caramel bg-amber-50/60 shadow-xs'
                          : 'border-bakery-200 hover:border-bakery-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                          💵
                        </div>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'cod' ? 'border-caramel bg-caramel' : 'border-bakery-300'
                        }`}>
                          {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <h4 className="font-bold text-chocolate text-sm">Cash on Delivery (COD)</h4>
                      <p className="text-xs text-bakery-600 mt-1">
                        Pay in cash at your doorstep when your freshly baked treats arrive.
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={buttonTap}
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-caramel bg-amber-50/60 shadow-xs'
                          : 'border-bakery-200 hover:border-bakery-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          💳
                        </div>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'wallet' ? 'border-caramel bg-caramel' : 'border-bakery-300'
                        }`}>
                          {paymentMethod === 'wallet' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <h4 className="font-bold text-chocolate text-sm">MeethaCart Wallet</h4>
                      <p className="text-xs text-bakery-600 mt-1">
                        Instant 1-tap checkout. Available balance: <strong className="text-emerald-700">Rs. 8,500</strong>
                      </p>
                    </motion.div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-caramel shrink-0" />
                    <span>Protected by MeethaCart Freshness Guarantee and Baker Hygiene Standards.</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-bakery-100">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Delivery</span>
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={buttonTap}
                      type="button"
                      onClick={() => goToStep(4)}
                      className="btn-primary py-2 px-6 text-xs inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Review & Place Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step-4"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="bg-white rounded-xl border border-bakery-200 p-6 shadow-xs space-y-5"
                >
                  <h3 className="font-serif font-bold text-chocolate text-base">
                    Final Order Review
                  </h3>

                  <div className="space-y-3 text-xs bg-bakery-50/70 p-4 rounded-xl border border-bakery-200">
                    <div className="flex justify-between">
                      <span className="text-bakery-600">Dispatch Address:</span>
                      <strong className="text-chocolate max-w-xs text-right">{address}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bakery-600">Payment Choice:</span>
                      <strong className="text-chocolate uppercase">{paymentMethod === 'wallet' ? 'MeethaCart Wallet' : 'Cash on Delivery'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bakery-600">Delivery Method:</span>
                      <strong className="text-chocolate uppercase">{deliveryType} (Rs. {deliveryFee})</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-bakery-100">
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Payment</span>
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={buttonTap}
                      disabled={isPlacingOrder}
                      type="button"
                      onClick={handlePlaceOrder}
                      className="btn-primary py-2.5 px-7 text-xs inline-flex items-center gap-2 shadow-warm text-white font-bold"
                    >
                      {isPlacingOrder ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Notifying Baker...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Confirm & Place Order (Rs. {grandTotal.toLocaleString()})</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-bakery-200 p-5 shadow-xs space-y-4 sticky top-20">
              <h3 className="font-serif font-bold text-chocolate text-sm border-b border-bakery-100 pb-2.5">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-bakery-600">
                  <span>Items Subtotal ({cartCount})</span>
                  <span className="font-semibold text-chocolate">
                    Rs. <AnimatedCounter value={totalPrice} />
                  </span>
                </div>
                <div className="flex justify-between text-bakery-600">
                  <span>Estimated Delivery Fee</span>
                  <span className="font-semibold text-chocolate">
                    Rs. {deliveryFee}
                  </span>
                </div>
                <div className="flex justify-between text-bakery-600">
                  <span>Platform Packaging Fee</span>
                  <span className="font-semibold text-emerald-700">FREE</span>
                </div>
                <div className="border-t border-bakery-200 pt-2.5 flex justify-between text-sm font-bold text-chocolate">
                  <span>Total Amount</span>
                  <span className="text-caramel font-serif text-base">
                    Rs. <AnimatedCounter value={grandTotal} />
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/items"
                  className="text-xs text-caramel hover:text-caramel-dark font-medium text-center block transition-colors"
                >
                  ← Add more treats from bakeries
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
