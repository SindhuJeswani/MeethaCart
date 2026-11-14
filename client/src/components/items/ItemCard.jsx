import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Store, Clock, ShoppingCart, X } from 'lucide-react';
import fallbackImg from '../../assets/fallback-item.jpg';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { cardHover, buttonTap, TIMING, EASING } from '../../animations/motion';

const isFreshToday = (item) => {
  const ref = item.updatedAt || item.createdAt;
  if (!ref) return false;
  const today = new Date();
  const d = new Date(ref);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

const ItemCard = ({ item }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(item?.sizes?.[0]?.name || '');
  const [selectedFlavor, setSelectedFlavor] = useState(item?.flavors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [customizationNote, setCustomizationNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const imageUrl = (() => {
    if (!item?.images || item.images.length === 0) return null;
    const img = item.images[0];
    if (img.startsWith('http')) return img;
    if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
    return img;
  })();

  const sellerName = item?.seller?.bakeryName || item?.seller?.name || 'Home Baker';
  const rawCity = item?.seller?.city || item?.seller?.location || item?.seller?.address || '';
  const sellerCity = (() => {
    if (!rawCity) return '';
    let c = rawCity;
    if (c.toLowerCase().includes('karachi')) return 'Karachi';
    if (c.toLowerCase().includes('lahore')) return 'Lahore';
    if (c.toLowerCase().includes('islamabad')) return 'Islamabad';
    return c;
  })();

  const categoryName = item?.category?.name || '';
  const freshToday = isFreshToday(item);
  const outOfStock = item?.stock !== undefined && item.stock <= 0;
  const isUnavailable = outOfStock || item?.isAvailable === false ||
    item?.approvalStatus !== 'Approved' || item?.seller?.sellerStatus !== 'approved';
  const isBuyerOrGuest = !isAuthenticated || user?.role === 'buyer';
  const hasOptions = Boolean(item?.sizes?.length || item?.flavors?.length);
  const showEggless = Boolean(item?.isEggless);
  const handleAddToCart = async () => {
    if (!item) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    if (user?.role !== 'buyer') return;

    if (isUnavailable) {
      toast.error('This item is currently unavailable');
      return;
    }

    if (hasOptions && !isOptionsOpen) {
      setIsOptionsOpen(true);
      return;
    }

    const parsedQty = hasOptions ? Number(quantity) : 1;
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
        customizationNote: item?.allowsCustomization ? customizationNote : ''
      });
      setIsOptionsOpen(false);
      toast.success(result.message || 'Item added to cart!');
    } catch (error) {
      toast.error(error.message || 'Server error. Item was not added.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={cardHover}
      transition={{ duration: TIMING.normal, ease: EASING.out }}
      className="item-card group card-bakery overflow-hidden flex flex-col h-full"
    >
      {/* Image container with smooth zoom on hover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bakery-100">
        <Link to={`/items/${item?._id}`} className="block w-full h-full overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.4, ease: EASING.out }}
            src={imageUrl || fallbackImg}
            alt={item?.title || 'Bakery item'}
            className="w-full h-full object-cover transition-transform"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImg;
            }}
          />
        </Link>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm">
              Out of stock
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 pointer-events-none max-w-[calc(100%-1.25rem)]">
          {categoryName && (
            <span className="max-w-full truncate whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/95 text-chocolate shadow-[0_2px_8px_rgba(74,44,26,0.06)] border border-amber-950/[0.08] backdrop-blur-xs">
              {categoryName}
            </span>
          )}
          {showEggless && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
              Eggless
            </span>
          )}
          {freshToday && !outOfStock && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-caramel text-white shadow-2xs">
              Fresh today
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3">
        <div>
          {/* Seller / Location */}
          <Link
            to={item?.seller?._id ? `/seller/${item.seller._id}` : '#'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-bakery-600 hover:text-caramel transition-colors truncate max-w-full"
          >
            <Store className="w-3.5 h-3.5 shrink-0 text-caramel" />
            <span className="truncate">{sellerName}</span>
            {sellerCity && <span className="text-bakery-400 font-normal shrink-0">· {sellerCity}</span>}
          </Link>

          {/* Item title */}
          <Link to={`/items/${item?._id}`} className="block mt-2">
            <h3 className="font-serif font-bold text-chocolate text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-caramel transition-colors">
              {item?.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Details Link */}
        <div className="pt-3 border-t border-amber-950/[0.06] space-y-3 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm sm:text-base font-serif font-bold text-chocolate leading-none">
              Rs. {item?.price ? item.price.toLocaleString() : '0'}
            </div>
            {item?.preparationTimeHours ? (
              <span className="text-[10px] text-bakery-500 font-medium flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-caramel" />
                <span>{item.preparationTimeHours} h prep</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <motion.div className="flex-1 min-w-0" whileHover={{ scale: 1.02 }} whileTap={buttonTap}>
              <Link
                to={`/items/${item?._id}`}
                className="btn-primary w-full min-w-0 text-[10px] sm:text-xs py-2 px-2 sm:px-3 font-bold rounded-xl whitespace-nowrap shadow-xs hover:shadow-sm"
              >
                <span className="sm:hidden">View</span>
                <span className="hidden sm:inline">View item</span>
              </Link>
            </motion.div>
            {isBuyerOrGuest && (
              <motion.button
                className="btn-secondary flex-1 min-w-0 text-[10px] sm:text-xs py-2 px-2 sm:px-3 font-bold rounded-xl whitespace-nowrap flex items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={!isUnavailable ? { scale: 1.03 } : undefined}
                whileTap={!isUnavailable ? buttonTap : undefined}
                type="button"
                disabled={isUnavailable || isAdding}
                onClick={handleAddToCart}
                aria-label={isUnavailable ? 'Item unavailable' : isAdding ? 'Adding item to cart' : 'Add item to cart'}
              >
                <ShoppingCart className="w-3 h-3" />
                <span className="hidden sm:inline">{isUnavailable ? 'Unavailable' : isAdding ? 'Adding...' : 'Add to Cart'}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
      {isOptionsOpen && createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsOptionsOpen(false);
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby={`cart-options-${item._id}`} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id={`cart-options-${item._id}`} className="font-serif font-bold text-chocolate">{item?.title}</h2>
              <button type="button" onClick={() => setIsOptionsOpen(false)} aria-label="Close options" className="p-1 text-bakery-500 hover:text-chocolate">
                <X className="w-5 h-5" />
              </button>
            </div>
            {item?.sizes?.length > 0 && (
              <label className="block text-xs font-semibold text-chocolate">
                Size
                <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="input-bakery mt-1 w-full">
                  <option value="">Select a size</option>
                  {item.sizes.map((size) => <option key={size.name} value={size.name}>{size.name}</option>)}
                </select>
              </label>
            )}
            {item?.flavors?.length > 0 && (
              <label className="block text-xs font-semibold text-chocolate">
                Flavor
                <select value={selectedFlavor} onChange={(event) => setSelectedFlavor(event.target.value)} className="input-bakery mt-1 w-full">
                  <option value="">Select a flavor</option>
                  {item.flavors.map((flavor) => <option key={flavor} value={flavor}>{flavor}</option>)}
                </select>
              </label>
            )}
            <label className="block text-xs font-semibold text-chocolate">
              Quantity
              <input type="number" min="1" max={item.stock} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="input-bakery mt-1 w-full" />
            </label>
            {item?.allowsCustomization && (
              <label className="block text-xs font-semibold text-chocolate">
                Customization note
                <textarea value={customizationNote} onChange={(event) => setCustomizationNote(event.target.value)} maxLength={300} rows={3} className="input-bakery mt-1 w-full" />
              </label>
            )}
            <button type="button" onClick={handleAddToCart} disabled={isAdding || !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > item.stock || (item?.sizes?.length > 0 && !selectedSize) || (item?.flavors?.length > 0 && !selectedFlavor)} className="btn-primary w-full justify-center disabled:opacity-60">
              {isAdding ? 'Adding...' : 'Confirm and Add to Cart'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </motion.article>
  );
};

export default ItemCard;
