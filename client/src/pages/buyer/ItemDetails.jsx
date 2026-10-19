import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ItemCard from '../../components/items/ItemCard';
import fallbackImg from '../../assets/fallback-item.jpg';
import {
  Clock,
  Store,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  Heart,
  Share2,
  Calendar,
  Layers,
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
        setError(err.message || 'Bakery item not found.');
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-caramel/20 border-t-caramel rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-bakery-700">Loading bakery details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-caramel/10 text-caramel mx-auto flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-chocolate mb-2">Item Not Found</h2>
        <p className="text-sm text-bakery-600 mb-6">{error || 'The requested bakery item does not exist.'}</p>
        <Link to="/items" className="btn-primary inline-flex text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const seller = item.seller;
  const category = item.category;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Breadcrumb Bar */}
      <div className="flex items-center justify-between text-xs text-bakery-600 pb-2 border-b border-bakery-200/60">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-caramel transition-colors">Home</Link>
          <span>/</span>
          <Link to="/items" className="hover:text-caramel transition-colors">Bakery Catalog</Link>
          <span>/</span>
          <Link to={`/items?category=${category?.slug || category?._id}`} className="hover:text-caramel font-medium transition-colors">
            {category?.name || 'Category'}
          </Link>
          <span>/</span>
          <span className="text-chocolate font-bold truncate max-w-[200px]">{item.title}</span>
        </div>

        <button
          onClick={handleShare}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Main Item Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-4/3 rounded-3xl overflow-hidden bg-bakery-100 border border-bakery-200/80 shadow-warm">
            <img
              src={getFullImageUrl(selectedImage)}
              alt={item.title}
              onError={(e) => { e.target.src = fallbackImg; }}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* Thumbnail list (if more than 1 image) */}
          {item.images && item.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === img
                      ? 'border-caramel shadow-md scale-95'
                      : 'border-transparent opacity-70 hover:opacity-100'
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
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-caramel px-3 py-1 text-xs">
                {category?.name}
              </span>
              {item.isEggless && (
                <span className="badge-green px-3 py-1 text-xs">
                  Eggless 🍃
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-chocolate leading-tight">
              {item.title}
            </h1>

            <Link
              to={`/seller/${seller?._id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel hover:text-chocolate mt-2 transition-colors"
            >
              <Store className="w-4 h-4 text-caramel" />
              <span>Crafted by <strong>{seller?.bakeryName || seller?.name}</strong></span>
            </Link>
          </div>

          {/* Price & Stock */}
          <div className="p-5 rounded-2xl bg-white border border-bakery-200/80 shadow-warm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-bakery-500 tracking-wider block">
                Price
              </span>
              <span className="text-3xl font-serif font-bold text-chocolate">
                PKR {item.price?.toLocaleString()}
              </span>
            </div>

            <div>
              {item.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>In Stock ({item.stock} Available)</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Preparation Time Banner */}
          <div className="p-4 rounded-2xl bg-bakery-100/90 border border-bakery-300 text-bakery-900 flex items-start gap-3.5">
            <Clock className="w-5 h-5 text-caramel shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-chocolate">
                Preparation Time
              </h4>
              <p className="text-xs text-bakery-700 mt-0.5 leading-relaxed">
                This item typically requires approximately <strong>{item.preparationTimeHours || 24} hours</strong> preparation time by the baker before dispatch.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-chocolate text-lg">About This Treat</h3>
            <p className="text-sm text-bakery-700 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Cart & Bidding Notice */}
          <div className="p-4 rounded-xl bg-bakery-100/70 border border-bakery-200 text-xs text-bakery-700 space-y-1">
            <div className="flex items-center gap-2 font-bold text-chocolate">
              <Sparkles className="w-4 h-4 text-caramel" />
              <span>Ordering Roadmap (FYP M4)</span>
            </div>
            <p className="text-[11px] text-bakery-600 leading-relaxed">
              Direct cart checkout, custom tier cake bidding, and wallet transactions are scheduled for <strong>Milestone 4</strong>.
            </p>
          </div>

        </div>

      </div>

      {/* Baker Storefront Showcase Card */}
      {seller && (
        <div className="card-bakery bg-gradient-to-br from-bakery-100 to-amber-50/40 border-bakery-200/90 p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-caramel to-chocolate text-white font-serif font-bold text-2xl flex items-center justify-center shadow-md">
                {seller.bakeryName?.charAt(0) || seller.name?.charAt(0) || 'B'}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-caramel">
                  Verified Home Baker Storefront
                </span>
                <h3 className="text-2xl font-serif font-bold text-chocolate mt-0.5">
                  {seller.bakeryName || `${seller.name}'s Bakery`}
                </h3>
                <p className="text-xs text-bakery-600 mt-1 max-w-xl">
                  {seller.bio || 'Homemade treats baked by local bakers.'}
                </p>
              </div>
            </div>

            <Link
              to={`/seller/${seller._id}`}
              className="btn-primary text-xs py-2.5 px-5 self-start sm:self-auto"
            >
              <Store className="w-4 h-4" />
              <span>Visit Baker Storefront</span>
            </Link>
          </div>
        </div>
      )}

      {/* Related Creations from Same Category */}
      {relatedItems.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-bakery-200/80">
          <div>
            <h2 className="text-2xl font-serif font-bold text-chocolate">
              More in {category?.name}
            </h2>
            <p className="text-xs text-bakery-600 mt-0.5">
              Explore similar handcrafted bakery delights from our community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
