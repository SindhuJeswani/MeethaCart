import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { ShoppingBag, Clock, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-bakery-50/50">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-amber-600" />
              <span>Platform Orders Monitoring</span>
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              Centralized order surveillance across all registered home bakeries.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Structure Ready for FYP Milestone 4</span>
          </div>
        </div>

        {/* Designed Empty State Card */}
        <div className="card-bakery text-center py-16 px-4 bg-white border-bakery-200">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-5 border border-amber-200/80 shadow-xs">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Current Module: M2 (Admin Control)
          </span>

          <h2 className="text-2xl font-serif font-bold text-chocolate mt-2 mb-3">
            Orders Module Arriving in Milestone 4
          </h2>

          <p className="text-sm text-bakery-600 max-w-lg mx-auto leading-relaxed mb-6">
            The database schema, REST endpoint (<code className="bg-bakery-100 px-1.5 py-0.5 rounded text-chocolate font-mono text-xs">GET /api/admin/orders</code>), and admin page structure are fully implemented now. Active order processing, customer cart checkouts, and custom baking bids will be connected in <strong>Milestone 4</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/admin/sellers" className="btn-primary text-xs py-2 px-4 inline-flex">
              <span>Review Baker Approvals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/admin/categories" className="btn-secondary text-xs py-2 px-4 inline-flex">
              <Layers className="w-3.5 h-3.5" />
              <span>Manage Categories</span>
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
};

export default OrdersPlaceholder;
