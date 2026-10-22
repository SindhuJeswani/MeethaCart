import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import fallbackImg from '../../assets/fallback-item.jpg';
import ItemCard from '../../components/items/ItemCard';
import { useTranslation } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import {
  Store,
  Clock,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Heart,
  RefreshCw,
  AlertCircle,
  Info,
  ShoppingBag,
  Check
} from 'lucide-react';
import {
  fadeUp,
  slideInLeft,
  staggerContainer,
  staggerItem,
  cardHover,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, translateCategory, translateItemTitle, translateItemDescription } = useTranslation();
  const toast = useToast();
  const { addToCart } = useCart();

  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await api.get(`/items/${id}`);
        if (res.data?.success) {
          const itemData = res.data.item;
          setItem(itemData);
          if (itemData.images && itemData.images.length > 0) {
            setSelectedImage(itemData.images[0]);
          }

          if (itemData.category?._id || itemData.category?.slug) {
            const catSlug = itemData.category.slug || itemData.category._id;
            try {
              const relRes = await api.get(`/items?category=${catSlug}&limit=4`);
              if (relRes.data?.success) {
                setRelatedItems(relRes.data.items.filter((i) => i._id !== itemData._id));
              }
            } catch (rErr) {
              console.warn('Related items:', rErr.message);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load item:', err);
        setError(err.message || 'Bakery item not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setAddedSuccess(true);
      if (item) {
        addToCart({
          _id: item._id,
          name: item.title,
          nameUrdu: item.titleUrdu,
          price: item.price,
          weight: item.weight || '1 pc',
          seller: item.seller,
          image: (item.images && item.images[0]) || fallbackImg
        }, quantity);
      }
      toast.success(`"${item?.title}" added to your cart!`);
      setTimeout(() => setAddedSuccess(false), 2200);
    }, 350);
  };

  const getFullImageUrl = (img) => {
    if (!img) return fallbackImg;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
    return img;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-caramel animate-spin mx-auto" />
        <p className="text-xs text-bakery-600">Loading fresh bakery details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-serif font-bold text-chocolate text-xl">Item Unavailable</h2>
        <p className="text-xs text-bakery-600">{error || 'This bakery item does not exist or was removed.'}</p>
        <Link to="/items" className="btn-primary text-xs py-2 px-4 inline-flex shadow-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to marketplace</span>
        </Link>
      </div>
    );
  }

  const { seller, category } = item;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8">
      {/* Top Back & Share Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between text-xs"
      >
        <Link
          to="/items"
          className="inline-flex items-center gap-1.5 font-semibold text-bakery-600 hover:text-chocolate transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('items.backToBrowse') || 'Back to catalog'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="p-2 rounded-lg border border-bakery-200 bg-white hover:bg-bakery-50 text-bakery-600 transition-colors shadow-xs"
            aria-label="Wishlist"
          >
            <motion.div animate={isWishlisted ? { scale: [1, 1.4, 1] } : { scale: 1 }}>
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? 'fill-strawberry text-strawberry' : 'stroke-current'
                }`}
              />
            </motion.div>
          </motion.button>

          <motion.button
            whileTap={buttonTap}
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-bakery-200 bg-white hover:bg-bakery-50 text-bakery-700 font-semibold shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-caramel" />
            <span>{isCopied ? 'Link copied!' : t('items.share') || 'Share'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Item Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Image Gallery with Smooth Transition */}
        <div className="space-y-3">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-bakery-100 border border-bakery-200 shadow-warm relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage || 'fallback'}
                src={getFullImageUrl(selectedImage)}
                alt={translateItemTitle(item)}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASING.out }}
                onError={(e) => {
                  e.target.src = fallbackImg;
                }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
          </div>

          {/* Thumbnail list */}
          {item.images && item.images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {item.images.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileTap={buttonTap}
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border transition-all ${
                    selectedImage === img
                      ? 'border-caramel ring-2 ring-caramel/40 shadow-sm'
                      : 'border-bakery-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getFullImageUrl(img)}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={(e) => {
                      e.target.src = fallbackImg;
                    }}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Item Info & Action Panel */}
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

          {/* Price & Stock Card */}
          <motion.div
            variants={staggerItem}
            className="p-4 card-bakery flex items-center justify-between"
          >
            <div>
              <div className="price-sticker text-2xl sm:text-3xl font-serif font-bold text-chocolate">
                Rs. {item.price?.toLocaleString()}
              </div>
            </div>

            <div>
              {item.stock > 0 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {t('items.inStock') || 'In stock'} ({item.stock} {t('items.available') || 'available'})
                  </span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs">
                  {t('items.outOfStock') || 'Out of stock'}
                </span>
              )}
            </div>
          </motion.div>

          {/* Add to Cart CTA with checkmark morph */}
          <motion.div variants={staggerItem} className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={buttonTap}
              onClick={handleAddToCart}
              disabled={item.stock <= 0 || isAdding}
              className={`btn-primary flex-1 py-3 text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all ${
                addedSuccess ? 'bg-emerald-600 hover:bg-emerald-600' : ''
              }`}
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : addedSuccess ? (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{item.stock > 0 ? 'Add to Cart' : 'Currently Unavailable'}</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Preparation Time Banner */}
          <motion.div
            variants={staggerItem}
            className="p-3.5 rounded-xl bg-bakery-50 border border-bakery-200 text-bakery-900 flex items-start gap-3 shadow-2xs"
          >
            <Clock className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-semibold text-chocolate">
                {t('items.prepTime') || 'Preparation time'}
              </h4>
              <p className="text-bakery-700 mt-0.5 leading-relaxed">
                {t('items.prepNoticePrefix') || 'This item typically requires'}{' '}
                <strong>{item.preparationTimeHours || 24}</strong>{' '}
                {t('items.prepNoticeSuffix') || 'hours notice before dispatch.'}
              </p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={staggerItem} className="space-y-1.5">
            <h3 className="font-serif font-bold text-chocolate text-base">
              {t('items.aboutItem') || 'About this item'}
            </h3>
            <p className="text-xs sm:text-sm text-bakery-700 leading-relaxed whitespace-pre-line">
              {translateItemDescription(item)}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Baker Storefront Card */}
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
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={buttonTap}>
              <Link
                to={`/seller/${seller._id}`}
                className="btn-secondary text-xs py-2 px-4 self-start sm:self-auto inline-flex items-center gap-1.5 shadow-xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t('items.viewSeller') || 'View seller profile'}</span>
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
