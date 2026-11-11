import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import ItemCard from '../../components/items/ItemCard';
import fallbackImg from '../../assets/fallback-item.jpg';
import {
  Clock,
  Store,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { staggerContainer, staggerItem, cardHover, buttonTap, TIMING, EASING } from '../../animations/motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const ItemDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customizationNote, setCustomizationNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Scroll strictly to top when viewing an item
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    const fetchItemAndRelated = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/items/${id}`);
        if (res.data?.success) {
          const it = res.data.item;
          setItem(it);
          setActiveImageIndex(0);
          if (it.sizes?.length) {
            setSelectedSize(it.sizes[0].name);
          }
          if (it.flavors?.length) {
            setSelectedFlavor(it.flavors[0]);
          }

          // Fetch related items from the same category
          const catId = it.category?._id || it.category;
          if (catId) {
            try {
              const relRes = await api.get(`/items?category=${catId}&limit=5`);
              if (relRes.data?.success) {
                const filtered = (relRes.data.items || []).filter((r) => r._id !== id);
                setRelatedItems(filtered.slice(0, 4));
              }
            } catch (relErr) {
              console.warn('Failed to fetch related items:', relErr.message);
            }
          }
        } else {
          setError(res.data?.message || 'Item not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load bakery item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndRelated();
  }, [id]);

  const handleAddToCart = async () => {
    if (!item) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    if (item.stock <= 0 || item.isAvailable === false) {
      toast.error('This item is currently unavailable');
      return;
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > item.stock) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (item.sizes?.length && !selectedSize) {
      toast.error('Please select a valid size');
      return;
    }

    if (item.flavors?.length && !selectedFlavor) {
      toast.error('Please select a valid flavor');
      return;
    }

    try {
      setIsAdding(true);
      const result = await addToCart(item, {
        quantity: parsedQty,
        selectedSize: selectedSize || null,
        selectedFlavor: selectedFlavor || null,
        customizationNote: item.allowsCustomization ? customizationNote : ''
      });
      toast.success(result.message || 'Item added to cart!');
    } catch (err) {
      toast.error(err.message || 'Server error. Item was not added.');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-12 space-y-6">
        <div className="h-6 w-32 skeleton rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[4/3] rounded-2xl skeleton" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 skeleton rounded-md" />
            <div className="h-5 w-1/3 skeleton rounded-md" />
            <div className="h-24 w-full skeleton rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="page-container py-16 text-center space-y-4">
        <div className="p-4 rounded-full bg-rose-50 text-rose-600 w-14 h-14 mx-auto flex items-center justify-center border border-rose-200">
          <Store className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-chocolate">
          {error || 'Bakery Item Not Found'}
        </h2>
        <p className="text-xs text-bakery-600 max-w-sm mx-auto">
          The treat you are looking for may have been removed, sold out, or is temporarily unlisted by the home baker.
        </p>
        <div className="pt-2">
          <Link
            to="/items"
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Browse</span>
          </Link>
        </div>
      </div>
    );
  }

  const resolveImageUrl = (img) => {
    if (!img) return fallbackImg;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/uploads/')) return `http://localhost:5000${img}`;
    if (img.startsWith('uploads/')) return `http://localhost:5000/${img}`;
    return img;
  };

  const rawImages = (item.images && item.images.length > 0)
    ? item.images
    : [fallbackImg];
  const images = rawImages.map(resolveImageUrl);

  const unitPrice = ((selectedSize && item.sizes?.find((s) => s.name?.toLowerCase() === selectedSize.trim().toLowerCase())?.price) || item.price) || 0;
  const numQuantity = Math.max(1, Number(quantity) || 1);
  const totalPrice = unitPrice * numQuantity;

  const category = item.category;
  const seller = item.seller;

  return (
    <div className="page-container py-6 space-y-8">
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
          {item.title}
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
                src={images[activeImageIndex] || fallbackImg}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImg;
                }}
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
                    src={img || fallbackImg}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImg;
                    }}
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
                {category?.name || category?.slug}
              </span>
              {item.isEggless && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                  Eggless
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate leading-snug">
              {item.title}
            </h1>

            <Link
              to={seller?._id ? `/seller/${seller._id}` : '#'}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-bakery-600 hover:text-caramel mt-2 transition-colors group"
            >
              <Store className="w-3.5 h-3.5 text-caramel group-hover:scale-110 transition-transform" />
              <span>
                Sold by{' '}
                <strong>{seller?.bakeryName || seller?.name || 'Home Baker'}</strong>
              </span>
            </Link>
          </motion.div>

          {/* Price & Availability Card */}
          <motion.div
            variants={staggerItem}
            className="p-4 card-bakery space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-bakery-500 tracking-wider block">
                  {numQuantity > 1 ? 'Total Price (PKR)' : 'Price (PKR)'}
                </span>
                <div className="price-sticker overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={totalPrice}
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className="text-2xl sm:text-3xl font-serif font-bold text-chocolate inline-flex items-baseline gap-2"
                    >
                      <span>Rs. {totalPrice.toLocaleString()}</span>
                      {numQuantity > 1 && (
                        <span className="text-xs font-sans font-medium text-bakery-500">
                          ({numQuantity} × Rs. {unitPrice.toLocaleString()})
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div>
                {item.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      In stock ({item.stock} available)
                    </span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs">
                    Out of stock
                  </span>
                )}
              </div>
            </div>

            {item.sizes?.length > 0 && (
              <label className="block text-xs font-semibold text-chocolate">
                Size
                <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="input-bakery mt-1 w-full">
                  <option value="">Select a size</option>
                  {item.sizes.map((size) => <option key={size.name} value={size.name}>{size.name}</option>)}
                </select>
              </label>
            )}
            {item.flavors?.length > 0 && (
              <label className="block text-xs font-semibold text-chocolate">
                Flavor
                <select value={selectedFlavor} onChange={(event) => setSelectedFlavor(event.target.value)} className="input-bakery mt-1 w-full">
                  <option value="">Select a flavor</option>
                  {item.flavors.map((flavor) => <option key={flavor} value={flavor}>{flavor}</option>)}
                </select>
              </label>
            )}
            {user?.role === 'buyer' && (
              <>
                <label className="block text-xs font-semibold text-chocolate">
                  Quantity
                  <input type="number" min="1" max={item.stock} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="input-bakery mt-1 w-full" />
                </label>
                {item.allowsCustomization && (
                  <label className="block text-xs font-semibold text-chocolate">
                    Customization note
                    <textarea value={customizationNote} onChange={(event) => setCustomizationNote(event.target.value)} maxLength={300} rows={3} className="input-bakery mt-1 w-full" />
                  </label>
                )}
              </>
            )}
            {(!isAuthenticated || user?.role === 'buyer') && (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="btn-primary w-full justify-center disabled:opacity-60"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{item.stock <= 0 || item.isAvailable === false ? 'Unavailable' : isAdding ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            )}
          </motion.div>

          {/* Preparation Time Notice */}
          <motion.div
            variants={staggerItem}
            className="p-3.5 rounded-xl bg-bakery-50 border border-bakery-200 text-bakery-900 flex items-start gap-3 shadow-2xs"
          >
            <Clock className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-semibold text-chocolate">
                Preparation Time
              </h4>
              <p className="text-bakery-700 mt-0.5 leading-relaxed">
                This artisan item requires{' '}
                <strong>{item.preparationTimeHours || 24} hours</strong>{' '}
                notice to bake fresh from scratch.
              </p>
            </div>
          </motion.div>

          {/* Item Description */}
          <motion.div variants={staggerItem} className="space-y-1.5">
            <h3 className="font-serif font-bold text-chocolate text-base">
              About this treat
            </h3>
            <p className="text-xs sm:text-sm text-bakery-700 leading-relaxed whitespace-pre-line">
              {item.description}
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
                  Home baker
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
                <span>View seller storefront</span>
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
              More in {category?.name || category?.slug}
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