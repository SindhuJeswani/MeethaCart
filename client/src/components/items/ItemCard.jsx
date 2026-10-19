import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Store, Star } from 'lucide-react';
import fallbackImg from '../../assets/fallback-item.jpg';

// Check if item was added/updated today → "Fresh Today" badge
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
  // Image with safe fallback
  const imageUrl = (() => {
    if (!item.images || item.images.length === 0) return null;
    const img = item.images[0];
    if (img.startsWith('http')) return img;
    if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
    return img;
  })();

  const sellerName = item.seller?.bakeryName || item.seller?.name || 'Home Baker';
  const categoryName = item.category?.name || '';
  const freshToday = isFreshToday(item);
  const outOfStock = item.stock !== undefined && item.stock <= 0;
  const showEggless = Boolean(item.isEggless);
  const showPrep = item.preparationTimeHours !== undefined;

  return (
    <article className="group flex flex-col rounded-2xl overflow-hidden bg-bakery-100 border border-bakery-200 shadow-warm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300">

      {/* ── Image ── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bakery-200">
        <img
          src={imageUrl || fallbackImg}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImg;
          }}
        />

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Badges top-left: Category */}
        {categoryName && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/95 text-chocolate shadow-sm backdrop-blur-sm border border-white/50">
              {categoryName}
            </span>
          </div>
        )}

        {/* Badges top-right: real data only */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {showEggless && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
              Eggless 🍃
            </span>
          )}
          {freshToday && !outOfStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-caramel text-white shadow-sm">
              Fresh Today ✨
            </span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-3">

        <div className="space-y-1.5">
          {/* Seller tag */}
          <Link
            to={item.seller?._id ? `/seller/${item.seller._id}` : '#'}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-caramel hover:text-caramel-dark transition-colors"
          >
            <Store className="w-3 h-3 shrink-0" />
            <span className="truncate">{sellerName}</span>
          </Link>

          {/* Title */}
          <Link to={`/items/${item._id}`}>
            <h3 className="font-serif font-bold text-chocolate text-[15px] group-hover:text-caramel transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h3>
          </Link>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-bakery-600 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* ── Bottom Bar ── */}
        <div className="pt-3 border-t border-bakery-200 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-bakery-400 uppercase tracking-wider block font-medium">Price</span>
            <span className="text-lg font-serif font-bold text-chocolate leading-none">
              PKR {item.price?.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            {showPrep && (
              <div className="inline-flex items-center gap-1 text-[11px] text-bakery-500 font-medium">
                <Clock className="w-3 h-3 text-caramel" />
                <span>{item.preparationTimeHours}h prep</span>
              </div>
            )}
            <Link
              to={`/items/${item._id}`}
              className="text-xs font-bold text-strawberry hover:text-strawberry-dark transition-colors"
            >
              View Details →
            </Link>
          </div>
        </div>

      </div>
    </article>
  );
};

export default ItemCard;
