import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { ShoppingBag, Clock, Layers, ArrowRight } from 'lucide-react';
import { fadeUp, buttonTap, TIMING, EASING } from '../../animations/motion';

const OrdersPlaceholder = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/admin/orders');
        if (res.data?.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.warn('Orders fetch:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-bakery-50/50 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal, ease: EASING.out }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-amber-600" />
              <span>Orders</span>
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              View and track customer orders across all sellers.
            </p>
          </div>
        </motion.div>

        {/* Empty State Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card-bakery text-center py-16 px-4 bg-white border-bakery-200 shadow-warm"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-3xl bg-amber-50 text-caramel mx-auto flex items-center justify-center mb-5 border border-amber-200/80 shadow-xs"
          >
            <Clock className="w-10 h-10 text-caramel" />
          </motion.div>

          <h2 className="text-2xl font-serif font-bold text-chocolate mb-3">
            No Orders Placed Yet
          </h2>

          <p className="text-sm text-bakery-600 max-w-lg mx-auto leading-relaxed mb-6">
            Customer orders placed through the marketplace will be listed here.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={buttonTap}>
              <Link to="/admin/sellers" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs">
                <span>View Sellers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={buttonTap}>
              <Link to="/admin/categories" className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs">
                <Layers className="w-3.5 h-3.5" />
                <span>Manage Categories</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default OrdersPlaceholder;
