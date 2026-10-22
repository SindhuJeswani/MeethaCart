import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useTranslation } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Clock,
  Send,
  UploadCloud,
  CheckCircle2,
  DollarSign,
  Calendar,
  MessageCircle,
  Award,
  ArrowRight,
  Truck
} from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  buttonTap,
  cardHover,
  TIMING,
  EASING
} from '../../animations/motion';

const SAMPLE_BIDS = [
  {
    id: 'bid-1',
    bakerName: "Grandma's Oven Delight",
    bakerRating: '4.9 ★ (120 bakes)',
    amount: 3800,
    prepTime: '24 hours',
    note: 'I will use organic Belgian cocoa and handcrafted fondant roses with golden sprinkles.',
    submittedAgo: '15 mins ago'
  },
  {
    id: 'bid-2',
    bakerName: 'Lahori Heritage Bakes',
    bakerRating: '4.8 ★ (85 bakes)',
    amount: 3500,
    prepTime: '18 hours',
    note: 'Premium dark chocolate truffle frosting with custom birthday calligraphy plaque included.',
    submittedAgo: '32 mins ago'
  },
  {
    id: 'bid-3',
    bakerName: 'The Artisan Whisk',
    bakerRating: '5.0 ★ (44 bakes)',
    amount: 4200,
    prepTime: '24 hours',
    note: 'Award-winning recipe: Valrhona chocolate mousse layers with edible gold leaf accents.',
    submittedAgo: '1 hour ago'
  }
];

const CustomRequestsPage = () => {
  const { isUrdu } = useTranslation();
  const toast = useToast();

  // Circular timer countdown state (60s loop demo)
  const [secondsLeft, setSecondsLeft] = useState(54);
  const totalSeconds = 60;

  // Request form state
  const [title, setTitle] = useState('2-Tier Gold & Black Fondant Birthday Cake');
  const [eventDate, setEventDate] = useState('Tomorrow, 6:00 PM');
  const [flavor, setFlavor] = useState('Belgian Chocolate Truffle');
  const [budget, setBudget] = useState('4000');
  const [bids, setBids] = useState(SAMPLE_BIDS);
  const [acceptedBidId, setAcceptedBidId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : totalSeconds));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const strokeDashoffset = 100 - (secondsLeft / totalSeconds) * 100;

  const handleAcceptBid = (bid) => {
    setAcceptedBidId(bid.id);
    setTimeout(() => {
      setOrderCreated(true);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
      toast.success(`Accepted bid from ${bid.bakerName}! Direct order created.`);
    }, 800);
  };

  const simulateNewBid = () => {
    const newBid = {
      id: `bid-${Date.now()}`,
      bakerName: 'Sugar & Spice Studio',
      bakerRating: '4.9 ★ (62 bakes)',
      amount: 3600,
      prepTime: '20 hours',
      note: 'Freshly whipped ganache with customized sugar flowers matching your theme.',
      submittedAgo: 'Just now'
    };
    setBids((prev) => [newBid, ...prev]);
    toast.info('New bid received from Sugar & Spice Studio!');
  };

  return (
    <div className="page-container py-8 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bakery-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-caramel" />
            <span>{isUrdu ? 'خصوصی کیک آرڈرز اور بیکرز کی بولیاں' : 'Custom Cake Requests & Bidding'}</span>
          </h1>
          <p className="text-xs text-bakery-600 mt-0.5">
            {isUrdu
              ? 'اپنے من پسند ڈیزائن کی تفصیلات درج کریں اور قریبی بیکرز سے بہترین پیشکشیں وصول کریں'
              : 'Post your event inspiration, set your budget, and receive custom bids from certified home bakers.'}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={buttonTap}
          onClick={simulateNewBid}
          className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-caramel" />
          <span>Simulate Incoming Bid</span>
        </motion.button>
      </div>

      {/* Active Request Overview Banner with Live Circular Deadline Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="bg-white rounded-2xl border border-bakery-200 p-6 sm:p-8 shadow-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wide">
              Active Request • Open for Bids
            </span>
            <span className="text-xs text-bakery-500">ID #REQ-402</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-chocolate">
            {title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-bakery-600 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-caramel" />
              <span>Target: <strong>{eventDate}</strong></span>
            </span>
            <span>Flavor: <strong>{flavor}</strong></span>
            <span>Budget: <strong className="text-caramel font-bold">Rs. {budget}</strong></span>
          </div>
        </div>

        {/* Circular Countdown Timer (Same aesthetic as OTP timer) */}
        <div className="flex items-center gap-4 bg-bakery-50 p-4 rounded-xl border border-bakery-200 shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-bakery-200"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-caramel transition-all duration-1000 ease-linear"
                strokeDasharray="100, 100"
                strokeDashoffset={strokeDashoffset}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-bold text-chocolate font-mono">
                {secondsLeft}s
              </span>
            </div>
          </div>

          <div className="text-xs">
            <span className="font-bold text-chocolate block">Bidding Window</span>
            <span className="text-[11px] text-bakery-500">Live countdown active</span>
          </div>
        </div>
      </motion.div>

      {/* Success Conversion to Order */}
      <AnimatePresence>
        {orderCreated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 shadow-warm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Bid Accepted! Custom Order Created</h4>
                <p className="text-xs text-emerald-800">
                  The baker is preparing your custom cake now. You can track preparation in Orders.
                </p>
              </div>
            </div>

            <Link
              to="/orders"
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 shadow-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track in Orders</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bids List with Staggered Entrance & Comparison Hover Lift */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-chocolate">
              Baker Bids ({bids.length})
            </h3>
            <p className="text-xs text-bakery-600">
              Compare custom proposals, delivery turnaround and baker ratings.
            </p>
          </div>
        </div>

        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="visible"
          className="space-y-3.5"
        >
          <AnimatePresence>
            {bids.map((bid) => {
              const isAccepted = acceptedBidId === bid.id;
              const hasAcceptedOther = acceptedBidId && !isAccepted;

              return (
                <motion.div
                  key={bid.id}
                  variants={staggerItem}
                  layout
                  whileHover={!acceptedBidId ? { y: -3, transition: { duration: 0.15 } } : {}}
                  className={`p-5 rounded-2xl border transition-all duration-200 ${
                    isAccepted
                      ? 'bg-amber-50/90 border-caramel ring-4 ring-amber-200/60 shadow-warm'
                      : hasAcceptedOther
                      ? 'bg-white border-bakery-200 opacity-40 grayscale'
                      : 'bg-white border-bakery-200 hover:border-bakery-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-chocolate text-base">
                          {bid.bakerName}
                        </h4>
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          {bid.bakerRating}
                        </span>
                        <span className="text-[11px] text-bakery-400">
                          · {bid.submittedAgo}
                        </span>
                      </div>

                      <p className="text-xs text-bakery-700 leading-relaxed max-w-xl">
                        "{bid.note}"
                      </p>

                      <div className="text-[11px] text-bakery-500 pt-1 flex items-center gap-3">
                        <span>Turnaround: <strong className="text-chocolate">{bid.prepTime}</strong></span>
                        <span>Hygiene: <strong className="text-emerald-700">Verified Kitchen</strong></span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-bakery-100">
                      <div className="text-right">
                        <span className="text-[10px] text-bakery-500 uppercase font-semibold block">Bid Price</span>
                        <span className="text-lg font-serif font-bold text-caramel">
                          Rs. {bid.amount.toLocaleString()}
                        </span>
                      </div>

                      {!acceptedBidId ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={buttonTap}
                          onClick={() => handleAcceptBid(bid)}
                          className="btn-primary text-xs py-2 px-4 shadow-xs font-semibold"
                        >
                          <span>Accept & Confirm</span>
                        </motion.button>
                      ) : isAccepted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-caramel text-white shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accepted Offer</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomRequestsPage;
