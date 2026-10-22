import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import ItemCard from '../../components/items/ItemCard';
import { useToast } from '../../context/ToastContext';
import { Store, Calendar, CheckCircle2, Copy, ShoppingBag, ArrowLeft, RefreshCw } from 'lucide-react';
import { staggerContainer, buttonTap, TIMING, EASING } from '../../animations/motion';

const SellerPublicProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const toast = useToast();

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
        setError(err.message || 'Storefront not found.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSeller();
    }
  }, [id]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Storefront link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-8 h-8 text-caramel animate-spin" />
        <p className="text-xs text-bakery-600">Loading baker storefront...</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-bakery-100 text-chocolate mx-auto flex items-center justify-center shadow-xs">
          <Store className="w-6 h-6 text-caramel" />
        </div>
        <h2 className="text-xl font-serif font-bold text-chocolate">Seller not found</h2>
        <p className="text-xs text-bakery-600">{error || 'The requested seller profile does not exist.'}</p>
        <Link to="/" className="btn-primary inline-flex text-xs py-2 px-4 shadow-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </Link>
      </div>
    );
  }

  const joinedFormatted = seller.joinedDate || seller.createdAt
    ? new Date(seller.joinedDate || seller.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className="page-container py-8 space-y-8">
      {/* Storefront Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="rounded-2xl bg-chocolate text-white overflow-hidden p-6 sm:p-8 shadow-warm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-caramel/20 text-caramel-light font-serif font-bold text-2xl flex items-center justify-center border border-caramel/40 shadow-xs">
              {seller.bakeryName?.charAt(0) || seller.name?.charAt(0) || 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-wider text-caramel font-semibold">
                  Home Baker Storefront
                </span>
                {seller.status === 'approved' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {seller.bakeryName || `${seller.name}'s Bakery`}
              </h1>
              <p className="text-white/70 text-xs mt-0.5">
                Owner: <strong className="text-white font-medium">{seller.name}</strong>
                {seller.address && <span> · {seller.address}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={buttonTap}
              type="button"
              onClick={handleCopyLink}
              className="btn-secondary text-xs py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-xs inline-flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Link copied' : 'Share storefront'}</span>
            </motion.button>
          </div>
        </div>

        {/* Bio & Details Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/70">
          <p className="max-w-xl text-xs text-white/80">
            {seller.bio || 'Independent home baker offering homemade cakes, desserts, and bakery items on MeethaCart.'}
          </p>
          <div className="flex items-center gap-1.5 shrink-0 text-white/60">
            <Calendar className="w-3.5 h-3.5" />
            <span>Selling since {joinedFormatted}</span>
          </div>
        </div>
      </motion.div>

      {/* Bakery Items Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-chocolate">
            Items from {seller.bakeryName || seller.name}
          </h2>
          <p className="text-xs text-bakery-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} available
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-bakery-200 text-center py-14 px-4 shadow-xs">
            <ShoppingBag className="w-8 h-8 text-bakery-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-chocolate">
              No items listed yet
            </h3>
            <p className="text-xs text-bakery-500 mt-0.5">
              This baker has not added any public items yet.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer(0.04)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SellerPublicProfile;
