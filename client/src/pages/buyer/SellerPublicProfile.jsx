import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Store, Calendar, CheckCircle2, Copy, ShoppingBag, ArrowLeft, Heart, Sparkles } from 'lucide-react';

const SellerPublicProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/users/seller/${id}`);
        if (res.data?.success) {
          setSeller(res.data.seller);
          setItems(res.data.items || []);
        }
      } catch (err) {
        setError(err.message || 'Bakery storefront not found.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSeller();
    }
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-bakery-700">Loading bakery storefront...</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-chocolate mb-2">Bakery Not Found</h2>
        <p className="text-sm text-bakery-600 mb-6">{error || 'The requested home bakery profile does not exist.'}</p>
        <Link to="/" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const joinedFormatted = seller.joinedDate
    ? new Date(seller.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Storefront Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 text-white overflow-hidden p-8 sm:p-12 shadow-warm-lg">
        
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-amber-950 font-serif font-bold text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
              {seller.bakeryName?.charAt(0) || seller.name?.charAt(0) || 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                  Verified Home Baker
                </span>
                {seller.status === 'approved' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                {seller.bakeryName}
              </h1>
              <p className="text-amber-200/90 text-sm mt-1">
                Crafted with love by <strong className="text-white">{seller.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="btn-secondary text-xs py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Storefront'}</span>
          </button>
        </div>

        {/* Bio & Details Bar */}
        <div className="mt-8 pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-200/90">
          <p className="max-w-2xl leading-relaxed text-sm text-amber-100/95 font-light">
            "{seller.bio || 'Passionate homemade baker crafting fresh, delicious bakery treats with high quality ingredients.'}"
          </p>
          <div className="flex items-center gap-2 shrink-0 text-amber-300">
            <Calendar className="w-4 h-4" />
            <span>Baking on MeethaCart since {joinedFormatted}</span>
          </div>
        </div>

      </div>

      {/* Bakery Items Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-chocolate flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
              <span>Baked Creations & Specialties</span>
            </h2>
            <p className="text-xs text-bakery-600 mt-0.5">
              Freshly baked to order by {seller.bakeryName}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="card-bakery text-center py-16 px-4 bg-white border-bakery-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-lg text-chocolate mb-1">
              Fresh Recipes Coming Soon!
            </h3>
            <p className="text-sm text-bakery-600 max-w-md mx-auto">
              This baker is preparing delicious fresh items for their storefront. Check back soon or browse other active home bakeries.
            </p>
            <div className="mt-6">
              <Link to="/items" className="btn-primary text-sm py-2 px-5 inline-flex">
                Browse Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id} className="card-bakery hover:shadow-warm-lg transition-all">
                <h4 className="font-serif font-bold text-chocolate text-base">{item.title}</h4>
                <p className="text-xs text-bakery-600 mt-1 line-clamp-2">{item.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-bold text-amber-700">PKR {item.price}</span>
                  <Link to={`/items/${item._id}`} className="text-xs font-semibold text-amber-600 hover:text-amber-800">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SellerPublicProfile;
