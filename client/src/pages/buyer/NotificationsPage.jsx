import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  Cake,
  Truck,
  MessageSquare,
  Sparkles,
  CheckCheck,
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

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    unread: true,
    title: 'Order Status Update',
    message: 'Your artisan cake is now in the oven! Grandma\'s Oven Delight is preparing your order.',
    time: '10 mins ago',
    icon: Cake,
    link: '/orders'
  },
  {
    id: 'notif-2',
    unread: true,
    title: 'New Bid Received!',
    message: 'Sweet Crust Kitchen submitted a bid of Rs. 3,800 on your Custom Fondant Birthday Cake request.',
    time: '45 mins ago',
    icon: Sparkles,
    link: '/custom-requests'
  },
  {
    id: 'notif-3',
    unread: false,
    title: 'Delivery Dispatched',
    message: 'Courier has picked up your Pistachio Nan Khatai box from Lahori Heritage Bakes.',
    time: 'Yesterday',
    icon: Truck,
    link: '/orders'
  },
  {
    id: 'notif-4',
    unread: false,
    title: 'Welcome to MeethaCart',
    message: 'Thank you for supporting authentic home bakers across Pakistan.',
    time: '3 days ago',
    icon: ShoppingBag,
    link: '/items'
  }
];

const NotificationsPage = () => {
  const { isUrdu } = useTranslation();
  const toast = useToast();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All notifications marked as read.');
  };

  const markSingleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <div className="page-container py-8 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bakery-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-caramel" />
            <span>{isUrdu ? 'اطلاعات اور پیغامات' : 'Notifications & Alerts'}</span>
          </h1>
          <p className="text-xs text-bakery-600 mt-0.5">
            {isUrdu
              ? 'اپنے آرڈرز، بیکرز کے پیغامات اور بولیاں کی لمحہ بہ لمحہ اطلاعات'
              : 'Real-time updates regarding bakery preparations, bids, and order tracking.'}
          </p>
        </div>

        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={buttonTap}
            onClick={markAllRead}
            className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto inline-flex items-center gap-1.5 shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 text-caramel" />
            <span>Mark all as read</span>
          </motion.button>
        )}
      </div>

      <motion.div
        variants={staggerContainer(0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence>
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <motion.div
                key={notif.id}
                variants={staggerItem}
                layout
                onClick={() => markSingleRead(notif.id)}
                className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                  notif.unread
                    ? 'bg-amber-50/70 border-caramel/40 shadow-xs'
                    : 'bg-white border-bakery-200 hover:border-bakery-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        notif.unread
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-bakery-100 text-chocolate border-bakery-200'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-caramel" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-chocolate text-sm">{notif.title}</h3>
                        {notif.unread && (
                          <span className="w-2 h-2 rounded-full bg-caramel animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-bakery-700 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-bakery-400 block pt-1">
                        {notif.time}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={notif.link}
                    className="text-xs text-caramel hover:text-caramel-dark font-semibold shrink-0"
                  >
                    View →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default NotificationsPage;
