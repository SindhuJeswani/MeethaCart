import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ItemCard from '../../components/items/ItemCard';
import fallbackImg from '../../assets/fallback-item.jpg';
import {
  Clock,
  Store,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  Share2,
  Info
} from 'lucide-react';

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await api.get(`/items/${id}`);
        if (res.data?.success) {
          setItem(res.data.item);
          setRelatedItems(res.data.relatedItems || []);

          if (res.data.item.images && res.data.item.images.length > 0) {
            setSelectedImage(res.data.item.images[0]);
          }
        }
      } catch (err) {
        setError(err.message || 'Item not found.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchItemDetails();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFullImageUrl = (img) => {
    if (!img) return fallbackImg;
    if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
    return img;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-3 border-caramel/20 border-t-caramel rounded-full animate-spin"></div>
        <p className="text-xs text-bakery-600">Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-bakery-100 text-chocolate mx-auto flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-caramel" />
        </div>
        <h2 className="text-xl font-serif font-bold text-chocolate">Item not found</h2>
        <p className="text-xs text-bakery-600">{error || 'The requested bakery item does not exist or has been removed.'}</p>
        <Link to="/items" className="btn-primary inline-flex text-xs py-2 px-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to items</span>
        </Link>
      </div>
    );
  }

  const seller = item.seller;
  const category = item.category;

  return (
    <div className="page-container py-8 space-y-8">
      
      {/* Breadcrumb Bar */}
      <div className="flex items-center justify-between text-xs text-bakery-600 pb-3 border-b border-bakery-200">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-chocolate">Home</Link>
          <span>/</span>
          <Link to="/items" className="hover:text-chocolate">All items</Link>
          <span>/</span>
          <Link to={`/items?category=${category?.slug || category?._id}`} className="hover:text-chocolate font-medium">
            {category?.name || 'Category'}
          </Link>
          <span>/</span>
          <span className="text-chocolate font-medium truncate max-w-[200px]">{item.title}</span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link copied' : 'Share'}</span>
        </button>
      </div>

      {/* Main Item Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-bakery-100 border border-bakery-200">
            <img
              src={getFullImageUrl(selectedImage)}
              alt={item.title}
              onError={(e) => { e.target.src = fallbackImg; }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail list (if multiple images) */}
          {item.images && item.images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-md overflow-hidden shrink-0 border transition-all ${
                    selectedImage === img
                      ? 'border-caramel ring-2 ring-caramel/20'
                      : 'border-bakery-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getFullImageUrl(img)}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={(e) => { e.target.src = fallbackImg; }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Item Info & Action Panel */}
        <div className="space-y-5">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-bakery-100 text-chocolate border border-bakery-200">
                {category?.name}
              </span>
              {item.isEggless && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Eggless
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate leading-snug">
              {item.title}
            </h1>

            <Link
              to={seller?._id ? `/seller/${seller._id}` : '#'}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-bakery-600 hover:text-caramel mt-2 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-caramel" />
              <span>Sold by <strong>{seller?.bakeryName || seller?.name || 'Home Baker'}</strong></span>
            </Link>
          </div>

          {/* Price & Stock Card */}
          <div className="p-4 rounded-lg bg-white border border-bakery-200 flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-chocolate">
                Rs. {item.price?.toLocaleString()}
              </div>
            </div>

            <div>
              {item.stock > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In stock ({item.stock} available)</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium">
                  Out of stock
                </span>
              )}
            </div>
          </div>

          {/* Preparation Time Banner */}
          <div className="p-3.5 rounded-lg bg-bakery-50 border border-bakery-200 text-bakery-900 flex items-start gap-3">
            <Clock className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-semibold text-chocolate">Preparation time</h4>
              <p className="text-bakery-700 mt-0.5 leading-relaxed">
                This item typically requires <strong>{item.preparationTimeHours || 24} hours</strong> notice before dispatch.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="font-serif font-bold text-chocolate text-base">About this item</h3>
            <p className="text-xs sm:text-sm text-bakery-700 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Made to order notice */}
          <div className="p-3.5 rounded-lg bg-white border border-bakery-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-chocolate">
              <Info className="w-3.5 h-3.5 text-caramel" />
              <span>Made to order</span>
            </div>
            <p className="text-bakery-600 text-[11px] leading-relaxed">
              This item is prepared fresh on order by the home baker. For custom sizes, flavors, or party orders, you can reach out directly via the seller profile.
            </p>
          </div>

        </div>

      </div>

      {/* Baker Storefront Card */}
      {seller && (
        <div className="bg-white rounded-lg border border-bakery-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-caramel/15 text-chocolate font-serif font-bold text-xl flex items-center justify-center border border-caramel/30">
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
              </div>
            </div>

            <Link
              to={`/seller/${seller._id}`}
              className="btn-secondary text-xs py-2 px-4 self-start sm:self-auto"
            >
              <Store className="w-3.5 h-3.5" />
              <span>View seller profile</span>
            </Link>
          </div>
        </div>
      )}

      {/* Related Items from Same Category */}
      {relatedItems.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-bakery-200">
          <div>
            <h2 className="text-xl font-serif font-bold text-chocolate">
              More in {category?.name}
            </h2>
            <p className="text-xs text-bakery-600">
              Other items in this category.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedItems.map((rel) => (
              <ItemCard key={rel._id} item={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ItemDetails;
