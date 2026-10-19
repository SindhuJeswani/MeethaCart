import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Store, Search, PackageCheck, UtensilsCrossed } from 'lucide-react';
import api from '../services/api';
import ItemCard from '../components/items/ItemCard';
import heroImg from '../assets/hero.jpg';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [latestItems, setLatestItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    // 1. Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      } finally {
        setLoadingCats(false);
      }
    };

    // 2. Fetch latest items (limit 8, sorted newest)
    const fetchLatestItems = async () => {
      try {
        setLoadingItems(true);
        const res = await api.get('/items?limit=8&sort=newest');
        if (res.data?.success) {
          setLatestItems(res.data.items || []);
        }
      } catch (err) {
        console.warn('Failed to load latest items:', err.message);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchCategories();
    fetchLatestItems();
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12 pb-14">

      {/* ── 1. CATEGORY CHIPS BAR ─────────────────────────── */}
      <div className="bg-white border-b border-bakery-200 py-2.5">
        <div className="page-container">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <Link
              to="/items"
              className="px-3.5 py-1.5 rounded-full bg-bakery-100 text-chocolate font-medium hover:bg-bakery-200 whitespace-nowrap transition-colors"
            >
              All items
            </Link>

            {loadingCats ? (
              <div className="flex gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-7 w-20 rounded-full skeleton" />
                ))}
              </div>
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/items?category=${encodeURIComponent(cat.slug || cat.name)}`}
                  className="px-3.5 py-1.5 rounded-full border border-bakery-200 text-bakery-700 font-medium hover:bg-bakery-100 hover:text-chocolate whitespace-nowrap transition-colors"
                >
                  {cat.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 2. COMPACT HERO BANNER (max ~380px) ─────────────── */}
      <section className="page-container">
        <div className="bg-bakery-100/80 border border-bakery-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 items-center">
          
          {/* Left: Text & Actions */}
          <div className="p-6 sm:p-10 md:col-span-7 flex flex-col justify-center space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-chocolate leading-tight">
              Homemade cakes and bakes from local bakers in Pakistan
            </h1>
            <p className="text-sm sm:text-base text-bakery-700 max-w-lg leading-relaxed">
              Browse ready items or contact a baker directly for custom cakes and party orders.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/items"
                id="hero-browse-btn"
                className="btn-primary text-sm py-2.5 px-5 font-medium"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse items</span>
              </Link>
              <Link
                to="/register?role=seller"
                id="hero-seller-btn"
                className="btn-secondary text-sm py-2.5 px-5 font-medium"
              >
                <Store className="w-4 h-4" />
                <span>Sell on MeethaCart</span>
              </Link>
            </div>
          </div>

          {/* Right: Realistic Image */}
          <div className="md:col-span-5 h-56 md:h-80 relative overflow-hidden bg-bakery-200">
            <img
              src={heroImg}
              alt="Freshly baked homemade cakes and pastries"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* ── 3. LATEST ITEMS GRID ────────────────────────────── */}
      <section className="page-container space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-chocolate">
              Latest items
            </h2>
            <p className="text-xs sm:text-sm text-bakery-600">Freshly listed by local home bakers</p>
          </div>
          <Link
            to="/items"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-caramel hover:text-caramel-dark transition-colors"
          >
            <span>View all items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingItems ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-lg skeleton" />
            ))}
          </div>
        ) : latestItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-bakery-200 text-bakery-500 text-sm">
            No items listed yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {latestItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* ── 4. SELL ON MEETHACART STRIP ─────────────────────── */}
      <section className="page-container">
        <div className="bg-white border border-bakery-200 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-chocolate text-base sm:text-lg">
              Are you a home baker?
            </h3>
            <p className="text-xs sm:text-sm text-bakery-600">
              List your bakery items, receive orders from buyers in your city, and manage your storefront.
            </p>
          </div>
          <Link
            to="/register?role=seller"
            className="btn-primary text-xs sm:text-sm py-2 px-4 font-medium shrink-0"
          >
            Become a seller
          </Link>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS (3 steps in 1 row) ──────────────── */}
      <section className="page-container pt-2">
        <div className="border-t border-bakery-200 pt-8 pb-4">
          <h2 className="text-center text-lg font-serif font-bold text-chocolate mb-6">
            How MeethaCart works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-bakery-100 border border-bakery-200 flex items-center justify-center shrink-0 text-chocolate">
                <Search className="w-4 h-4 text-caramel" />
              </div>
              <div>
                <h4 className="font-semibold text-chocolate text-sm">1. Find a baker or item</h4>
                <p className="text-xs text-bakery-600 mt-1 leading-relaxed">
                  Search by cake type, dessert category, or location to find bakers near you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-bakery-100 border border-bakery-200 flex items-center justify-center shrink-0 text-chocolate">
                <UtensilsCrossed className="w-4 h-4 text-caramel" />
              </div>
              <div>
                <h4 className="font-semibold text-chocolate text-sm">2. Order or request custom</h4>
                <p className="text-xs text-bakery-600 mt-1 leading-relaxed">
                  Choose ready items or contact the baker with custom flavors, weights, and dates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-bakery-100 border border-bakery-200 flex items-center justify-center shrink-0 text-chocolate">
                <PackageCheck className="w-4 h-4 text-caramel" />
              </div>
              <div>
                <h4 className="font-semibold text-chocolate text-sm">3. Freshly prepared for you</h4>
                <p className="text-xs text-bakery-600 mt-1 leading-relaxed">
                  Your order is prepared fresh on demand and delivered on your specified schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
