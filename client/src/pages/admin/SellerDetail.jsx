import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';
import SellerDetailView from '../../components/admin/SellerDetailView';
import { ArrowLeft, Shield } from 'lucide-react';
import { TIMING, EASING } from '../../animations/motion';

const SellerDetail = () => {
  const { id } = useParams();

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-bakery-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 max-w-6xl space-y-6 overflow-y-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-bakery-200 pb-4">
          <Link
            to="/admin/sellers"
            className="inline-flex items-center gap-2 text-xs font-bold text-bakery-600 hover:text-chocolate transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            <span>Back to Sellers</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Administrator View</span>
          </div>
        </div>

        {/* Full Details & Inventory View */}
        <SellerDetailView sellerId={id} isModal={false} />
      </main>
    </div>
  );
};

export default SellerDetail;
