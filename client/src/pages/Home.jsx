import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { ShoppingBag, Store, ShieldCheck, Heart, ArrowRight, Sparkles, Users, MapPin } from 'lucide-react';
import api from '../services/api';
import heroImg from '../assets/hero.jpg';

// Category name → emoji mapping
const CATEGORY_EMOJI_MAP = {
  'cakes': '🎂',
  'custom cakes': '🎂',
  'cake': '🎂',
  'cookies': '🍪',
  'biscuits': '🍪',
  'cookies & biscuits': '🍪',
  'mithai': '🍬',
  'sweets': '🍬',
  'traditional mithai': '🍬',
  'bread': '🥖',
  'breads': '🥖',
  'artisanal breads': '🥖',
  'cupcakes': '🧁',
  'pastries': '🥐',
  'pastries & cupcakes': '🧁',
  'chocolates': '🍫',
  'chocolate': '🍫',
  'brownies': '🍫',
  'muffins': '🧇',
  'macarons': '🍩',
  'donuts': '🍩',
  'pizza': '🍕',
  'sandwiches': '🥪',
  'savory': '🧆',
  'other': '🍽️',
};

const getCategoryEmoji = (name = '') => {
  const key = name.toLowerCase().trim();
  return CATEGORY_EMOJI_MAP[key] || '🍰';
};

const Home = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ items: null, bakers: null });
  const [catLoading, setCatLoading] = useState(true);

  // Load real categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.categories.slice(0, 6));
        }
      } catch (e) {
        console.warn('Categories load failed:', e.message);
      } finally {
        setCatLoading(false);
      }
    };

    // Soft stats from items count
    const fetchStats = async () => {
      try {
        const res = await api.get('/items?limit=1');
        if (res.data?.success) {
          setStats({ items: res.data.total || res.data.count || 0 });
        }
      } catch { /* silent */ }
    };

    fetchCategories();
    fetchStats();
  }, []);

  return (
    <div className="space-y-0 pb-0">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">

        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Homemade bakery spread"
            className="w-full h-full object-cover"
          />
          {/* Overlay: left dark for text, right transparent */}
          <div className="absolute inset-0 bg-gradient-to-r from-chocolate/90 via-chocolate/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-chocolate/30" />
        </div>

        {/* Floating decorative dots */}
        <div className="absolute top-12 right-12 w-48 h-48 rounded-full bg-caramel/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/3 w-32 h-32 rounded-full bg-strawberry/10 blur-2xl pointer-events-none" />

        {/* Hero Content */}
        <div className="relative page-container w-full py-24">
          <div className="max-w-lg space-y-7 animate-slide-up">

            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-caramel/20 border border-caramel/30 text-caramel-light backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-bold tracking-wider uppercase">
                AI-Powered Bilingual Marketplace
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight text-balance">
              Homemade<br />
              <span className="text-caramel italic">Meetha,</span><br />
              Delivered Fresh.
            </h1>

            {/* Subtitle — neutral, no fake claims */}
            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-md">
              Discover handcrafted cakes, traditional mithai, and artisanal bakery treats — made by local home bakers near you.
            </p>

            {/* Stats row */}
            {stats.items > 0 && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-white">{stats.items}+</div>
                  <div className="text-xs text-white/60 uppercase tracking-wider">Items Listed</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-white">EN / اردو</div>
                  <div className="text-xs text-white/60 uppercase tracking-wider">Bilingual</div>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
              <Link to="/items" id="hero-browse-btn" className="btn-primary text-base py-3.5 px-8 shadow-warm-lg">
                <ShoppingBag className="w-5 h-5" />
                <span>Explore the Catalog</span>
              </Link>
              <Link to="/register?role=seller" id="hero-seller-btn" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 hover:border-white/50 transition-all duration-200">
                <Store className="w-5 h-5" />
                <span>Sell on MeethaCart</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#FFF6E9" />
          </svg>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────── */}
      <section className="py-20 bg-bakery-50">
        <div className="page-container">

          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-eyebrow mb-2">Browse by Type</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-chocolate">
                Popular Categories
              </h2>
            </div>
            <Link
              to="/items"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-caramel hover:text-caramel-dark transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {catLoading ? (
            /* Skeleton grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl skeleton" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-bakery-400 text-sm">
              No categories found. Add some from Admin → Categories.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/items?category=${encodeURIComponent(cat.name)}`}
                  className="group card-bakery p-5 text-center hover:-translate-y-1.5 hover:shadow-warm-lg transition-all duration-200 flex flex-col items-center gap-3"
                >
                  <span
                    className="text-4xl group-hover:scale-110 transition-transform duration-200 block"
                    role="img"
                    aria-label={cat.name}
                  >
                    {getCategoryEmoji(cat.name)}
                  </span>
                  <h3 className="font-serif font-bold text-chocolate text-sm group-hover:text-caramel transition-colors leading-tight">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link to="/items" className="btn-outline text-sm">
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY MEETHACART ────────────────────────────────────── */}
      <section className="py-20 bg-bakery-100/60">
        <div className="page-container">

          <div className="text-center mb-12">
            <p className="section-eyebrow mb-2">Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-chocolate">
              Baked with Care, Sold with Trust
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Pillar 1 */}
            <div className="card-bakery p-8 text-center space-y-4 group hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 rounded-2xl bg-strawberry/10 border border-strawberry/20 flex items-center justify-center mx-auto group-hover:bg-strawberry/20 transition-colors">
                <Heart className="w-7 h-7 text-strawberry fill-strawberry/30" />
              </div>
              <h3 className="font-serif font-bold text-xl text-chocolate">Homemade by Local Bakers</h3>
              <p className="text-sm text-bakery-600 leading-relaxed">
                Every item on MeethaCart is made by a real home baker — not a factory. Support talented bakers in your city.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="card-bakery p-8 text-center space-y-4 group hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto group-hover:bg-emerald-100 transition-colors">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-serif font-bold text-xl text-chocolate">Admin-Verified Sellers</h3>
              <p className="text-sm text-bakery-600 leading-relaxed">
                Each baker goes through a manual approval process before their storefront goes live — so you always know who you're ordering from.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="card-bakery p-8 text-center space-y-4 group hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 rounded-2xl bg-caramel/10 border border-caramel/20 flex items-center justify-center mx-auto group-hover:bg-caramel/20 transition-colors">
                <Users className="w-7 h-7 text-caramel" />
              </div>
              <h3 className="font-serif font-bold text-xl text-chocolate">Custom Orders, Your Way</h3>
              <p className="text-sm text-bakery-600 leading-relaxed">
                Want a custom cake for a birthday or eid? Contact the baker directly. Full bilingual support — English & اردو.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA BAND ──────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-chocolate via-bakery-900 to-chocolate relative overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-caramel/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-strawberry/10 blur-3xl pointer-events-none" />

        <div className="page-container relative text-center space-y-6">
          <p className="section-eyebrow text-caramel/70 mb-2">Are You a Baker?</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white text-balance">
            Turn Your Passion into a<br />
            <span className="text-caramel italic">Thriving Bakery Business</span>
          </h2>
          <p className="text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Join MeethaCart as a seller — list your items, get discovered by buyers near you, and grow your home bakery brand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register?role=seller" id="cta-become-baker" className="btn-primary text-base py-3.5 px-8">
              <Store className="w-5 h-5" />
              Become a Seller
            </Link>
            <Link to="/items" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 hover:border-white/50 transition-all duration-200">
              <ShoppingBag className="w-5 h-5" />
              Browse First
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
