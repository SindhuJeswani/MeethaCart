import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  CreditCard,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  fadeIn,
  fadeUp,
  buttonTap,
  cardHover,
  staggerContainer,
  staggerItem,
  TIMING,
  EASING
} from '../../animations/motion';

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'debit',
    title: 'Order Payment #MC-8492',
    baker: "Grandma's Oven Delight",
    date: 'Today, 2:15 PM',
    amount: 3550,
    status: 'success'
  },
  {
    id: 'tx-2',
    type: 'credit',
    title: 'Wallet Top-up via EasyPaisa',
    baker: 'Auto-recharge',
    date: 'Yesterday, 6:30 PM',
    amount: 5000,
    status: 'success'
  },
  {
    id: 'tx-3',
    type: 'credit',
    title: 'Instant Refund: Order Cancelled',
    baker: 'Sweet Crust Bakery',
    date: '16 Oct 2026',
    amount: 1400,
    status: 'success'
  }
];

const WalletPage = () => {
  const { isUrdu } = useTranslation();
  const toast = useToast();
  const [balance, setBalance] = useState(8500);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [topUpAmount, setTopUpAmount] = useState('2000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusModal, setStatusModal] = useState(null); // 'success' | 'failure' | null
  const [selectedMethod, setSelectedMethod] = useState('easypaisa');

  const handleTopUp = (e) => {
    e.preventDefault();
    const val = parseInt(topUpAmount, 10);
    if (!val || val <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBalance((prev) => prev + val);

      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'credit',
        title: `Wallet Top-up (${selectedMethod.toUpperCase()})`,
        baker: 'Instant Deposit',
        date: 'Just now',
        amount: val,
        status: 'success',
        isNew: true
      };

      setTransactions((prev) => [newTx, ...prev]);
      setStatusModal('success');
      toast.success(`Rs. ${val.toLocaleString()} added to your wallet!`);
    }, 1000);
  };

  const simulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStatusModal('failure');
      toast.error('Payment gateway declined the transaction.');
    }, 900);
  };

  return (
    <div className="page-container py-8 max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="border-b border-bakery-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
          <Wallet className="w-7 h-7 text-caramel" />
          <span>{isUrdu ? 'میتھا کارٹ والیٹ اور ادائیگی' : 'MeethaCart Wallet & Payments'}</span>
        </h1>
        <p className="text-xs text-bakery-600 mt-0.5">
          {isUrdu
            ? 'فوری آرڈر، ایک کلک ریفنڈز اور محفوظ بیکری ادائیگی کا نظام'
            : 'Store credits for 1-click checkout, seamless bakery refunds and instant cash top-ups.'}
        </p>
      </div>

      {/* Hero Wallet Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="rounded-2xl bg-gradient-to-br from-chocolate via-[#3E2415] to-[#2D1A0F] text-white p-6 sm:p-8 shadow-warm relative overflow-hidden"
      >
        {/* Decorative circle glow */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-caramel/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-amber-200/80 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-caramel" />
              <span>Available Demo Wallet Balance</span>
            </span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white flex items-baseline gap-2">
              <span className="text-caramel-light font-normal text-2xl sm:text-3xl">Rs.</span>
              <AnimatedCounter value={balance} />
            </div>
            <p className="text-xs text-amber-100/70">
              Zero transaction fees · Instant checkout at all certified home bakeries
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="#topup-section"
              className="btn-primary text-xs py-2.5 px-5 bg-caramel hover:bg-caramel-dark text-white font-bold inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isUrdu ? 'رقم جمع کریں' : 'Top Up Wallet'}</span>
            </a>
            <button
              onClick={simulateFailure}
              className="text-[11px] text-amber-200/70 hover:text-white underline text-center"
            >
              Simulate Failure State
            </button>
          </div>
        </div>
      </motion.div>

      {/* Top Up Form Section */}
      <div id="topup-section" className="bg-white rounded-2xl border border-bakery-200 p-6 shadow-xs space-y-5">
        <h3 className="font-serif font-bold text-chocolate text-base flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-caramel" />
          <span>Top Up MeethaCart Credits</span>
        </h3>

        {/* Payment Method Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'easypaisa', label: 'EasyPaisa', icon: '🟢' },
            { id: 'jazzcash', label: 'JazzCash', icon: '🔴' },
            { id: 'card', label: 'Debit / Credit Card', icon: '💳' }
          ].map((m) => {
            const isSelected = selectedMethod === m.id;
            return (
              <motion.div
                key={m.id}
                whileHover={{ scale: 1.02 }}
                whileTap={buttonTap}
                onClick={() => setSelectedMethod(m.id)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-caramel bg-amber-50/70 shadow-xs'
                    : 'border-bakery-200 hover:border-bakery-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{m.icon}</span>
                  <span className="font-bold text-chocolate text-xs">{m.label}</span>
                </div>
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-caramel bg-caramel' : 'border-bakery-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Amount Pills */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700">
            Select or Type Amount (PKR)
          </label>
          <div className="flex flex-wrap gap-2">
            {[1000, 2000, 5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopUpAmount(amt.toString())}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  topUpAmount === amt.toString()
                    ? 'bg-chocolate text-white border-chocolate shadow-xs'
                    : 'bg-bakery-50 text-bakery-700 border-bakery-200 hover:bg-bakery-100'
                }`}
              >
                + Rs. {amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleTopUp} className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-bakery-500">PKR</span>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              min="100"
              className="input-bakery pl-12 font-bold text-chocolate text-sm"
              placeholder="Enter amount"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={buttonTap}
            disabled={isProcessing}
            type="submit"
            className="btn-primary py-2.5 px-6 text-xs inline-flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Deposit Rs. {parseInt(topUpAmount || 0, 10).toLocaleString()}</span>
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-chocolate text-lg">
          Recent Wallet Transactions
        </h3>

        <div className="bg-white rounded-xl border border-bakery-200 overflow-hidden shadow-xs divide-y divide-bakery-100">
          <AnimatePresence initial={false}>
            {transactions.map((tx) => (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: -15 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  backgroundColor: tx.isNew ? ['#FEF3C7', '#FFFFFF'] : '#FFFFFF'
                }}
                transition={{ duration: TIMING.normal, ease: EASING.out }}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      tx.type === 'credit'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-chocolate text-xs">{tx.title}</h4>
                    <p className="text-[11px] text-bakery-500">
                      {tx.baker} · {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-serif font-bold text-xs sm:text-sm ${
                      tx.type === 'credit' ? 'text-emerald-700' : 'text-chocolate'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-emerald-700 uppercase font-semibold">
                    {tx.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal for Success / Failure simulation */}
      <AnimatePresence>
        {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setStatusModal(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
              className="relative z-10 bg-white rounded-2xl border border-bakery-200 p-6 sm:p-8 text-center max-w-sm w-full shadow-warm space-y-4"
            >
              {statusModal === 'success' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-200 shadow-xs">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-chocolate">Top-up Successful!</h3>
                  <p className="text-xs text-bakery-600">
                    Your MeethaCart demo wallet balance has been updated immediately.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center border-2 border-red-200 shadow-xs">
                    <XCircle className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-chocolate">Payment Failed</h3>
                  <p className="text-xs text-bakery-600">
                    The transaction could not be processed. Please check your credentials and try again.
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={() => setStatusModal(null)}
                className="btn-primary w-full py-2.5 text-xs font-bold shadow-xs"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPage;
