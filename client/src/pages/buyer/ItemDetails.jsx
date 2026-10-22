import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import ItemCard from '../../components/items/ItemCard';
import { useTranslation } from '../../context/LanguageContext';
import {
  Clock,
  Store,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { staggerContainer, staggerItem, cardHover, buttonTap, TIMING, EASING } from '../../animations/motion';

const ItemDetails = () => {
  const { id } = useParams();
  const { t, translateCategory, translateItemTitle, translateItemDescription } = useTranslation();
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/items/${id}`);
        if (res.data?.success) {
          setItem(res.data.item);
          setRelatedItems(res.data.relatedItems || []);
          setActiveImageIndex(0);
        }
      } catch (err) {
        setError(err.message || 'Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[4/3] rounded-2xl skeleton skeleton-shimmer" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 skeleton rounded-lg" />
            <div className="h-10 w-3/4 skeleton rounded-lg" />
            <div className="h-20 w-full skeleton rounded-xl" />
            <div className="h-12 w-full skeleton rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="page-container py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center font-bold text-xl shadow-xs">
          🍰
        </div>
        <h2 className="text-2xl font-serif font-bold text-chocolate">
          {error || 'Bakery item not found'}
        </h2>
        <p className="text-xs sm:text-sm text-bakery-600 max-w-sm mx-auto">
          This treat might have been unlisted by the home baker or does not exist.
        </p>
        <Link to="/items" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5 shadow-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Browse other bakery items</span>
        </Link>
      </div>
    );
  }

  const { seller, category } = item;
  const images = item.images && item.images.length > 0
    ? item.images.map((img) => (img.startsWith('http') ? img : `http://localhost:5000${img}`))
    : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop'];

  return (
    <div className="page-container py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 text-xs text-bakery-600"
      >
        <Link to="/" className="hover:text-caramel transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-bakery-400" />
        <Link to="/items" className="hover:text-caramel transition-colors">
          Browse Items
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-bakery-400" />
        <span className="text-chocolate font-semibold truncate max-w-[200px]">
          {translateItemTitle(item)}
        </span>
      </motion.nav>

      {/* Main Item Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Image Carousel & Gallery */}
        <div className="space-y-3.5">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-bakery-100 border border-bakery-200 shadow-warm">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: TIMING.normal, ease: EASING.out }}
                src={images[activeImageIndex]}
                alt={translateItemTitle(item)}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {item.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                  Currently Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={buttonTap}
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-caramel shadow-xs ring-2 ring-caramel/20'
                      : 'border-bakery-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Item Info & Attributes */}
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          <motion.div variants={staggerItem}>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bakery-100 text-chocolate border border-bakery-200 shadow-2xs">
                {translateCategory(category?.name || category?.slug)}
              </span>
              {item.isEggless && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                  {t('items.eggless') || 'Eggless'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate leading-snug">
              {translateItemTitle(item)}
            </h1>

            <Link
              to={seller?._id ? `/seller/${seller._id}` : '#'}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-bakery-600 hover:text-caramel mt-2 transition-colors group"
            >
              <Store className="w-3.5 h-3.5 text-caramel group-hover:scale-110 transition-transform" />
              <span>
                {t('items.soldBy') || 'Sold by'}{' '}
                <strong>{seller?.bakeryName || seller?.name || (t('items.homeBaker') || 'Home Baker')}</strong>
              </span>
            </Link>
          </motion.div>

          {/* Price & Availability Card */}
          <motion.div
            variants={staggerItem}
            className="p-4 card-bakery flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-bakery-500 tracking-wider block">
                Price (PKR)
              </span>
              <div className="price-sticker text-2xl sm:text-3xl font-serif font-bold text-chocolate">
                Rs. {item.price?.toLocaleString()}
              </div>
            </div>

            <div>
              {item.stock > 0 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {t('items.inStock') || 'In stock'} ({item.stock} {t('items.available') || 'available'})
                  </span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs">
                  {t('items.outOfStock') || 'Out of stock'}
                </span>
              )}
            </div>
          </motion.div>

          {/* Preparation Time Notice */}
          <motion.div
            variants={staggerItem}
            className="p-3.5 rounded-xl bg-bakery-50 border border-bakery-200 text-bakery-900 flex items-start gap-3 shadow-2xs"
          >
            <Clock className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-semibold text-chocolate">
                {t('items.prepTime') || 'Preparation Time'}
              </h4>
              <p className="text-bakery-700 mt-0.5 leading-relaxed">
                {t('items.prepNoticePrefix') || 'This artisan item requires'}{' '}
                <strong>{item.preparationTimeHours || 24} hours</strong>{' '}
                {t('items.prepNoticeSuffix') || 'notice to bake fresh from scratch.'}
              </p>
            </div>
          </motion.div>

          {/* Item Description */}
          <motion.div variants={staggerItem} className="space-y-1.5">
            <h3 className="font-serif font-bold text-chocolate text-base">
              {t('items.aboutItem') || 'About this treat'}
            </h3>
            <p className="text-xs sm:text-sm text-bakery-700 leading-relaxed whitespace-pre-line">
              {translateItemDescription(item)}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Baker Storefront Summary Card */}
      {seller && (
        <motion.div
          whileHover={cardHover}
          className="bg-white rounded-2xl border border-bakery-200 p-6 shadow-warm transition-shadow"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-caramel/15 text-chocolate font-serif font-bold text-xl flex items-center justify-center border border-caramel/30 shadow-xs">
                {seller.bakeryName?.charAt(0) || seller.name?.charAt(0) || 'B'}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-bakery-500 uppercase tracking-wider">
                  {t('items.homeBaker') || 'Home baker'}
                </span>
                <h3 className="text-lg font-serif font-bold text-chocolate mt-0.5">
                  {seller.bakeryName || `${seller.name}'s Bakery`}
                </h3>
                <p className="text-xs text-bakery-600 mt-0.5 max-w-lg">
                  {seller.bio || 'Independent home baker on MeethaCart.'}
                </p>
                {seller.address && (
                  <p className="text-[11px] text-bakery-500 mt-0.5">
                    Location: {seller.address}
                  </p>
                )}
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={buttonTap}>
              <Link
                to={`/seller/${seller._id}`}
                className="btn-secondary text-xs py-2 px-4 self-start sm:self-auto inline-flex items-center gap-1.5 shadow-xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t('items.viewSeller') || 'View seller storefront'}</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Related Items from Same Category */}
      {relatedItems.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-bakery-200">
          <div>
            <h2 className="text-xl font-serif font-bold text-chocolate">
              {t('items.moreInCategory') || 'More in'} {translateCategory(category?.name || category?.slug)}
            </h2>
            <p className="text-xs text-bakery-600">
              Other freshly baked treats in this category.
            </p>
          </div>

          <motion.div
            variants={staggerContainer(0.04)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {relatedItems.map((rel) => (
              <ItemCard key={rel._id} item={rel} />
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
