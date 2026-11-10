import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import ItemCard from '../../components/items/ItemCard';
import ItemFilterSidebar from '../../components/items/ItemFilterSidebar';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RefreshCw,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const BrowseItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [isCountLoading, setIsCountLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Derived state from URL searchParams (single source of truth)
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const maxPrice = searchParams.get('maxPrice') || '6000';
  const isEggless = searchParams.get('isEggless') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limitParam = searchParams.get('limit');
  const limit = ['12', '24', 'all'].includes(limitParam) ? limitParam : '12';

  // Ensure page and limit are always in the URL
  useEffect(() => {
    let needsUpdate = false;
    const nextParams = new URLSearchParams(searchParams);
    if (!searchParams.get('page')) {
      nextParams.set('page', '1');
      needsUpdate = true;
    }
    if (!searchParams.get('limit')) {
      nextParams.set('limit', '12');
      needsUpdate = true;
    }
    if (needsUpdate) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Load category list on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    };
    fetchCats();
  }, []);

  // Fetch real total available count
  useEffect(() => {
    const fetchAvailableCount = async () => {
      try {
        const res = await api.get('/items?limit=1');
        if (res.data?.success) {
          setAvailableCount(res.data.total ?? res.data.totalCount ?? 0);
        }
      } catch (err) {
        console.error('Failed to load available item count:', err);
      } finally {
        setIsCountLoading(false);
      }
    };
    fetchAvailableCount();
  }, []);

  // Fetch items whenever searchParams change
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();

        if (search.trim()) queryParams.append('search', search.trim());
        if (selectedCategory && selectedCategory !== 'all') queryParams.append('category', selectedCategory);
        if (Number(maxPrice) < 6000) queryParams.append('maxPrice', maxPrice);
        if (isEggless) queryParams.append('isEggless', 'true');
        if (sort) queryParams.append('sort', sort);
        queryParams.append('page', String(page));
        queryParams.append('limit', limit);

        const res = await api.get(`/items?${queryParams.toString()}`);
        if (res.data?.success) {
          const total = res.data.total ?? res.data.totalCount ?? 0;
          const pages = res.data.pages ?? res.data.totalPages ?? 1;
          setItems(res.data.items || []);
          setTotalCount(total);
          setTotalPages(pages);
        }
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [search, selectedCategory, maxPrice, isEggless, sort, page, limit]);

  // Helper to update filters: resets page to 1
  const updateFilter = (updates) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', '1');

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'all' || (key === 'maxPrice' && Number(value) >= 6000) || (key === 'isEggless' && !value)) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    if (!nextParams.get('limit')) {
      nextParams.set('limit', limit);
    }

    setSearchParams(nextParams);
    document.getElementById('items-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePageChange = (nextPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(nextPage));
    if (!nextParams.get('limit')) {
      nextParams.set('limit', limit);
    }
    setSearchParams(nextParams);
    document.getElementById('items-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLimitChange = (nextLimit) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', '1');
    nextParams.set('limit', nextLimit);
    setSearchParams(nextParams);
    document.getElementById('items-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();
    nextParams.set('page', '1');
    nextParams.set('limit', '12');
    setSearchParams(nextParams);
    document.getElementById('items-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBrowseAll = () => {
    const nextParams = new URLSearchParams();
    nextParams.set('page', '1');
    nextParams.set('limit', '12');
    setSearchParams(nextParams);
    document.getElementById('items-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Page Title & Highlights Banner (Redundant Search Box Removed) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bakery-200/80 pb-5"
      >
        <div>
          <span className="section-eyebrow">
            Artisanal Bakery Catalog
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-chocolate mt-0.5">
            All bakery items
          </h1>
          <p className="text-xs sm:text-sm text-bakery-600 mt-1">
            Homemade treats prepared fresh by independent bakers across Pakistan.
          </p>
        </div>

        {/* Marketplace Trust & Freshness Highlights */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={buttonTap}
            type="button"
            onClick={handleBrowseAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-xs cursor-pointer bg-white hover:bg-amber-50 text-chocolate border-bakery-200"
            title="Browse all available homemade treats"
          >
            <Sparkles className="w-3.5 h-3.5 text-caramel shrink-0" />
            <span>{isCountLoading ? "..." : availableCount} Homemade Treats Available</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={buttonTap}
            type="button"
            onClick={() => {
              updateFilter({ isEggless: !isEggless });
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-xs cursor-pointer ${
              isEggless
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
            title="Toggle Eggless filter"
          >
            <span>🌿</span>
            <span>Eggless Only</span>
            {isEggless && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Catalog Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block shrink-0">
          <ItemFilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => updateFilter({ category: cat })}
            maxPrice={maxPrice}
            onChangeMaxPrice={(p) => updateFilter({ maxPrice: p })}
            isEggless={isEggless}
            onToggleEggless={(val) => updateFilter({ isEggless: val })}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Toggle Drawer */}
        <div className="lg:hidden w-full">
          <motion.button
            whileTap={buttonTap}
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="w-full btn-secondary text-xs py-2 px-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5 font-semibold text-chocolate">
              <SlidersHorizontal className="w-4 h-4 text-caramel" />
              <span>Filter items</span>
            </div>
            {(selectedCategory !== 'all' || Number(maxPrice) < 6000 || isEggless) && (
              <span className="w-2 h-2 rounded-full bg-caramel"></span>
            )}
          </motion.button>

          <AnimatePresence>
            {isMobileFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: TIMING.normal, ease: EASING.out }}
                className="mt-3 overflow-hidden"
              >
                <ItemFilterSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    updateFilter({ category: cat });
                    setIsMobileFilterOpen(false);
                  }}
                  maxPrice={maxPrice}
                  onChangeMaxPrice={(p) => updateFilter({ maxPrice: p })}
                  isEggless={isEggless}
                  onToggleEggless={(val) => updateFilter({ isEggless: val })}
                  onResetFilters={handleResetFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Catalog Results Grid */}
        <div id="items-grid" className="flex-1 w-full space-y-4 scroll-mt-24">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-bakery-200 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <span className="font-semibold text-chocolate">
              {isLoading ? "..." : (totalCount || items.length)} homemade treats found
            </span>

            <div className="flex items-center gap-3 ml-auto">
              {/* Limit selector */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-bakery-600 whitespace-nowrap">
                  Show:
                </label>
                <select
                  value={limit}
                  onChange={(e) => {
                    handleLimitChange(e.target.value);
                  }}
                  className="input-bakery text-xs py-1 px-2 bg-white font-medium rounded-md"
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="all">All ({totalCount})</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-bakery-600 whitespace-nowrap">
                  Sort:
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    updateFilter({ sort: e.target.value });
                  }}
                  className="input-bakery text-xs py-1 px-2.5 bg-white font-medium rounded-md"
                >
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Pills with Animated Entrance */}
          {(selectedCategory !== 'all' || Number(maxPrice) < 6000 || isEggless || search) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-bakery-500">Active filters:</span>

              {search && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bakery-100 text-chocolate font-medium border border-bakery-200"
                >
                  <span>"{search}"</span>
                  <button onClick={() => updateFilter({ search: '' })} className="hover:text-strawberry">
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}

              {selectedCategory !== 'all' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bakery-100 text-chocolate font-medium border border-bakery-200"
                >
                  <span>Category: {selectedCategory}</span>
                  <button onClick={() => updateFilter({ category: 'all' })} className="hover:text-strawberry">
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}

              {Number(maxPrice) < 6000 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bakery-100 text-chocolate font-medium border border-bakery-200"
                >
                  <span>Under Rs. {Number(maxPrice).toLocaleString()}</span>
                  <button onClick={() => updateFilter({ maxPrice: '6000' })} className="hover:text-strawberry">
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}

              {isEggless && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200"
                >
                  <span>Eggless only</span>
                  <button onClick={() => updateFilter({ isEggless: false })} className="hover:text-rose-700">
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-caramel hover:text-caramel-dark underline font-medium ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Item Grid with Layout Animations */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-bakery aspect-[4/5] rounded-xl skeleton skeleton-shimmer" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-bakery-200 text-center py-16 px-4 shadow-sm"
            >
              <ShoppingBag className="w-10 h-10 text-bakery-300 mx-auto mb-2" />
              <h3 className="text-base font-serif font-bold text-chocolate mb-1">
                No items found
              </h3>
              <p className="text-xs text-bakery-600 max-w-sm mx-auto mb-4">
                No items match your selected filters. Try removing some filters or searching for something else.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={buttonTap}
                type="button"
                onClick={handleResetFilters}
                className="btn-primary text-xs py-1.5 px-4 inline-flex shadow-xs"
              >
                Reset all filters
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              layout
              variants={staggerContainer(0.04)}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
            >
              <AnimatePresence>
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination Controls with Micro-Interactions */}
          {totalPages > 1 && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-bakery-200">
              <span className="text-xs text-bakery-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={buttonTap}
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    handlePageChange(Math.max(page - 1, 1));
                  }}
                  className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <motion.button
                    key={pNum}
                    whileTap={buttonTap}
                    type="button"
                    onClick={() => {
                      handlePageChange(pNum);
                    }}
                    className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${
                      page === pNum
                        ? 'bg-caramel text-white shadow-xs'
                        : 'bg-white text-chocolate border border-bakery-200 hover:bg-bakery-50'
                    }`}
                  >
                    {pNum}
                  </motion.button>
                ))}
                <motion.button
                  whileTap={buttonTap}
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => {
                    handlePageChange(Math.min(page + 1, totalPages));
                  }}
                  className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseItems;
