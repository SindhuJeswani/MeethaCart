import React from 'react';
import { ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BrowseItemsPlaceholder = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
        Module 3 (M3) Scope
      </span>
      <h1 className="text-3xl font-serif font-bold text-chocolate mt-1 mb-3">
        Bakery Catalog & Browsing
      </h1>
      <p className="text-sm text-bakery-600 max-w-lg mx-auto leading-relaxed mb-6">
        The public marketplace, live search, multi-criteria filters (category, price range, seller), and item details pages will be unlocked in <strong>Module 3 (M3)</strong> right after M1 and M2 approvals.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/" className="btn-secondary text-sm">
          Return Home
        </Link>
        <Link to="/register?role=seller" className="btn-primary text-sm">
          <span>Register as Baker</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default BrowseItemsPlaceholder;
