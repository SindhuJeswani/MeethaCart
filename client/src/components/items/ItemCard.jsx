import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Store, Clock } from 'lucide-react';
import fallbackImg from '../../assets/fallback-item.jpg';
import { useTranslation } from '../../context/LanguageContext';

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
  const { t, translateCategory, translateItemTitle } = useTranslation();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const imageUrl = (() => {
    if (!item?.images || item.images.length === 0) return null;
    const img = item.images[0];
    if (img.startsWith('http')) return img;
    if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
    return img;
  })();

  const sellerName = item?.seller?.bakeryName || item?.seller?.name || 'Home Baker';
  const sellerCity = item?.seller?.city || item?.seller?.location || '';
  const categoryName = item?.category?.name || '';
  const freshToday = isFreshToday(item);
  const outOfStock = item?.stock !== undefined && item.stock <= 0;
  const showEggless = Boolean(item?.isEggless);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <article className="group bg-white rounded-lg border border-bakery-200 overflow-hidden hover:border-bakery-300 hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bakery-100">
        <Link to={`/items/${item?._id}`} className="block w-full h-full">
          <img
            src={imageUrl || fallbackImg}
            alt={translateItemTitle(item) || 'Bakery item'}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImg;
            }}
          />
        </Link>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-bakery-200/80 flex items-center justify-center text-bakery-600 hover:text-strawberry hover:bg-white transition-colors shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-strawberry text-strawberry' : 'stroke-current'
            }`}
          />
        </button>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold text-xs uppercase tracking-wider">
              {t('items.outOfStock') || 'Out of stock'}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 pointer-events-none">
          {categoryName && (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/95 text-chocolate shadow-sm border border-bakery-200">
              {translateCategory(categoryName)}
            </span>
          )}
          {showEggless && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white shadow-sm">
              {t('items.eggless') || 'Eggless'}
            </span>
          )}
          {freshToday && !outOfStock && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-caramel text-white shadow-sm">
              {t('items.freshToday') || 'Fresh today'}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Seller / Location */}
          <Link
            to={item?.seller?._id ? `/seller/${item.seller._id}` : '#'}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-bakery-600 hover:text-caramel transition-colors truncate max-w-full"
          >
            <Store className="w-3 h-3 shrink-0 text-bakery-400" />
            <span className="truncate">{sellerName}</span>
            {sellerCity && <span className="text-bakery-400 shrink-0">· {sellerCity}</span>}
          </Link>

          {/* Item title */}
          <Link to={`/items/${item?._id}`} className="block mt-1">
            <h3 className="font-medium text-chocolate text-sm leading-snug line-clamp-2 group-hover:text-caramel transition-colors">
              {translateItemTitle(item)}
            </h3>
          </Link>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-bakery-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="text-base font-bold text-chocolate leading-tight">
              Rs. {item?.price ? item.price.toLocaleString() : '0'}
            </div>
            {item?.preparationTimeHours ? (
              <span className="text-[10px] text-bakery-500 font-normal">
                {item.preparationTimeHours} {t('items.prepTimeHours') || 'h prep time'}
              </span>
            ) : null}
          </div>

          <Link
            to={`/items/${item?._id}`}
            className="btn-primary text-xs py-1.5 px-3 font-medium rounded-md whitespace-nowrap"
          >
            {t('items.viewItem') || 'View item'}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;
