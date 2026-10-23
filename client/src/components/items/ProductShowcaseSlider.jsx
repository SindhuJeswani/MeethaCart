import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Store,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Star
} from 'lucide-react';
import api from '../../services/api';
import fallbackImg from '../../assets/fallback-item.jpg';
import { useTranslation } from '../../context/LanguageContext';

const ProductShowcaseCard = ({ item, isUrdu, translateItemTitle, onInteraction }) => {
  const imageUrl = (() => {
    if (!item?.images || item.images.length === 0) return fallbackImg;
    const img = item.images[0];
    if (img.startsWith('http')) return img;
    if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
    return img;
  })();

  const sellerName =
    item?.seller?.bakeryName ||
    item?.seller?.name ||
    (isUrdu ? 'ہوم بیکر' : 'Home Baker');

  const sellerCity = (() => {
    const raw = item?.seller?.city || item?.seller?.location || item?.seller?.address || '';
    if (!raw) return '';
    const low = raw.toLowerCase();
    if (low.includes('karachi')) return isUrdu ? 'کراچی' : 'Karachi';
    if (low.includes('lahore')) return isUrdu ? 'لاہور' : 'Lahore';
    if (low.includes('islamabad')) return isUrdu ? 'اسلام آباد' : 'Islamabad';
    return raw.split(',')[0].trim();
  })();

  const title = translateItemTitle ? translateItemTitle(item) : item?.title;
  const originalPrice = Math.round((item?.price || 0) * 1.15);

  return (
    <Link
      to={`/items/${item?._id}`}
      onMouseEnter={onInteraction}
      onTouchStart={onInteraction}
      className="group flex-shrink-0 w-48 sm:w-56 md:w-64 bg-white rounded-2xl border border-amber-950/[0.06] shadow-[0_6px_20px_-3px_rgba(74,44,26,0.04),0_2px_6px_rgba(74,44,26,0.02)] hover:shadow-[0_16px_36px_-6px_rgba(74,44,26,0.1),0_6px_16px_-2px_rgba(74,44,26,0.05)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden text-left"
    >
      {/* Product Image & Badges Container */}
      <div className="relative aspect-[4/3] w-full bg-bakery-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={title || 'Delicious Cake'}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackImg;
          }}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
        />

        {/* Top Badges (Daraz / Shein Deal Flair) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
            <Flame className="w-2.5 h-2.5 fill-current" />
            <span>Trending</span>
          </span>

          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-500 text-white shadow-xs">
            -15%
          </span>
        </div>

        {/* Dietary / City Overlay Badge */}
        <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1 pointer-events-none">
          {item?.isEggless && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-600/90 text-white backdrop-blur-xs shadow-2xs">
              Eggless
            </span>
          )}
          {sellerCity && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-chocolate/80 text-white backdrop-blur-xs shadow-2xs">
              {sellerCity}
            </span>
          )}
        </div>

        {/* Hover Quick Action Indicator */}
        <div className="absolute inset-x-0 bottom-0 py-1.5 px-3 bg-gradient-to-t from-chocolate/80 via-chocolate/40 to-transparent text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between pointer-events-none">
          <span>{isUrdu ? 'تفصیلات دیکھیں' : 'View Cake'}</span>
          <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Card Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between gap-2.5">
        <div>
          {/* Seller / Bakery Name with Verification Icon */}
          <div className="flex items-center gap-1.5 text-xs text-bakery-600 mb-1">
            <Store className="w-3.5 h-3.5 text-caramel shrink-0" />
            <span className="truncate font-medium">{sellerName}</span>
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          </div>

          {/* Cake Title (Clamp to 2 lines) */}
          <h4 className="font-serif font-bold text-chocolate text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-caramel transition-colors">
            {title}
          </h4>
        </div>

        {/* Pricing & Rating Area */}
        <div className="pt-2 border-t border-bakery-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-chocolate font-serif leading-none">
                Rs. {Number(item?.price || 0).toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs text-bakery-400 line-through leading-none">
                Rs. {originalPrice.toLocaleString()}
              </span>
            </div>
            {item?.preparationTimeHours ? (
              <div className="flex items-center gap-1 text-[10px] text-bakery-500 mt-1">
                <Clock className="w-2.5 h-2.5 text-caramel" />
                <span>{item.preparationTimeHours}h bake time</span>
              </div>
            ) : null}
          </div>

          {/* Micro Rating Flair */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold shrink-0">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            <span>4.9</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ProductShowcaseSlider = () => {
  const { translateItemTitle, isUrdu } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchShowcaseItems = async () => {
      try {
        setLoading(true);
        const res = await api.get('/items?limit=16&sort=newest');
        if (isMounted && res.data?.success) {
          const validItems = (res.data.items || []).filter(
            (it) => it && it.isAvailable !== false
          );
          setItems(validItems);
        }
      } catch (err) {
        console.warn('Failed to load showcase slider items:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchShowcaseItems();
    return () => {
      isMounted = false;
    };
  }, []);

  // Duplicate items array to guarantee a seamless 50% infinite loop transition with zero jitter
  const duplicatedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    let base = [...items];
    while (base.length < 8) {
      base = [...base, ...items];
    }
    return [...base, ...base];
  }, [items]);

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="w-full page-container py-2 sm:py-3">
      {/* Daraz / Shein Style Flash Banner Container */}
      <div className="bg-gradient-to-b from-amber-50/60 via-bakery-50/40 to-white border border-amber-950/[0.06] rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_-4px_rgba(74,44,26,0.04)] relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-500 text-white shadow-2xs">
                <Sparkles className="w-3 h-3" />
                <span>{isUrdu ? 'ٹرینڈنگ شوکیس' : 'Trending Showcase'}</span>
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-serif font-bold text-chocolate flex items-center gap-2">
              <span>{isUrdu ? 'تازہ تیار شدہ کیکس اور ڈیزرٹس' : 'Trending Cakes & Treats'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-bakery-600">
              {isUrdu
                ? 'پاکستان بھر کے تصدیق شدہ ہوم بیکرز کی تازہ ترین پیشکش'
                : 'Handcrafted daily by verified home bakers across Pakistan'}
            </p>
          </div>

          {/* Clean View All Action */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              to="/items"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-caramel hover:bg-caramel-dark text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              <span>{isUrdu ? 'تمام دیکھیں' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Carousel Viewport with Fade Edge Masks */}
        <div className="relative w-full overflow-hidden rounded-2xl py-2">
          {/* Subtle Left & Right edge gradient fade masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-amber-50/80 via-white/50 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white via-white/50 to-transparent z-10" />

          {loading ? (
            /* Skeleton Loading State */
            <div className="flex gap-4 sm:gap-5 py-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-48 sm:w-56 md:w-64 h-72 rounded-2xl bg-white border border-bakery-200 p-3 space-y-3 flex-shrink-0 animate-pulse"
                >
                  <div className="aspect-[4/3] w-full rounded-xl bg-bakery-200/70" />
                  <div className="h-4 bg-bakery-200/70 rounded w-3/4" />
                  <div className="h-3 bg-bakery-200/50 rounded w-1/2" />
                  <div className="h-5 bg-bakery-200/70 rounded w-1/3 mt-2" />
                </div>
              ))}
            </div>
          ) : (
            /* Continuous Zero-Jitter Infinite Marquee Track */
            <div
              className={`animate-infinite-marquee flex items-stretch gap-4 sm:gap-5 py-2 ${
                isPaused ? 'is-paused' : ''
              }`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {duplicatedItems.map((item, idx) => (
                <ProductShowcaseCard
                  key={`${item._id}-showcase-${idx}`}
                  item={item}
                  isUrdu={isUrdu}
                  translateItemTitle={translateItemTitle}
                  onInteraction={() => setIsPaused(true)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default ProductShowcaseSlider;
