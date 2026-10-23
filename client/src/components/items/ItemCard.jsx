import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, ArrowRight, Clock } from 'lucide-react';
import fallbackImg from '../../assets/fallback-item.jpg';
import { useTranslation } from '../../context/LanguageContext';
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
  const { t, translateCategory, translateItemTitle, lang } = useTranslation();

  const imageUrl = (() => {
    if (!item?.images || item.images.length === 0) return null;
    const img = item.images[0];
    if (img.startsWith('http')) return img;
    if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
    return img;
  })();

  const sellerName = item?.seller?.bakeryName || item?.seller?.name || (lang === 'ur' ? 'ہوم بیکر' : 'Home Baker');
  const rawCity = item?.seller?.city || item?.seller?.location || item?.seller?.address || '';
  const sellerCity = (() => {
    if (!rawCity) return '';
    let c = rawCity;
    if (c.toLowerCase().includes('karachi')) return lang === 'ur' ? 'کراچی' : 'Karachi';
    if (c.toLowerCase().includes('lahore')) return lang === 'ur' ? 'لاہور' : 'Lahore';
    if (c.toLowerCase().includes('islamabad')) return lang === 'ur' ? 'اسلام آباد' : 'Islamabad';
    return c;
  })();

  const categoryName = item?.category?.name || '';
  const freshToday = isFreshToday(item);
  const outOfStock = item?.stock !== undefined && item.stock <= 0;
  const showEggless = Boolean(item?.isEggless);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={cardHover}
      transition={{ duration: TIMING.normal, ease: EASING.out }}
      className="group card-bakery overflow-hidden flex flex-col h-full"
    >
      {/* Image container with smooth zoom on hover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bakery-100">
        <Link to={`/items/${item?._id}`} className="block w-full h-full overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.4, ease: EASING.out }}
            src={imageUrl || fallbackImg}
            alt={translateItemTitle(item) || 'Bakery item'}
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
              {t('items.outOfStock') || 'Out of stock'}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none">
          {categoryName && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/95 text-chocolate shadow-[0_2px_8px_rgba(74,44,26,0.06)] border border-amber-950/[0.08] backdrop-blur-xs">
              {translateCategory(categoryName)}
            </span>
          )}
          {showEggless && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
              {t('items.eggless') || 'Eggless'}
            </span>
          )}
          {freshToday && !outOfStock && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-caramel text-white shadow-2xs">
              {t('items.freshToday') || 'Fresh today'}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5">
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
          <Link to={`/items/${item?._id}`} className="block mt-1.5">
            <h3 className="font-serif font-bold text-chocolate text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-caramel transition-colors">
              {translateItemTitle(item)}
            </h3>
          </Link>
        </div>

        {/* Pricing & Details Link */}
        <div className="pt-3 border-t border-amber-950/[0.06] flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="text-sm sm:text-base font-serif font-bold text-chocolate leading-none">
              {lang === 'ur' ? 'روپے ' : 'Rs. '}{item?.price ? item.price.toLocaleString() : '0'}
            </div>
            {item?.preparationTimeHours ? (
              <span className="text-[10px] text-bakery-500 font-medium flex items-center gap-1 mt-1">
                <Clock className="w-2.5 h-2.5 text-caramel" />
                <span>{item.preparationTimeHours} {t('items.prepTimeHours') || 'h prep'}</span>
              </span>
            ) : null}
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={buttonTap}>
            <Link
              to={`/items/${item?._id}`}
              className="btn-primary text-xs py-2 px-3.5 font-bold rounded-xl whitespace-nowrap shadow-xs hover:shadow-sm"
            >
              <span>{t('items.viewItem') || 'View item'}</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
};

export default ItemCard;
