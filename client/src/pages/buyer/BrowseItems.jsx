import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import ItemCard from '../../components/items/ItemCard';
import ItemFilterSidebar from '../../components/items/ItemFilterSidebar';
import { useTranslation } from '../../context/LanguageContext';
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
  const navigate = useNavigate();
  const { t, translateCategory, lang } = useTranslation();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter & Search states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '6000');
  const [isEggless, setIsEggless] = useState(searchParams.get('isEggless') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(searchParams.get('limit') || '12');

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

  // Sync search param from Navbar search into state
  useEffect(() => {
    const q = searchParams.get('search') || '';
    if (q !== search) {
      setSearch(q);
      setPage(1);
    }
  }, [searchParams]);

  // Fetch items whenever filters or page change
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();

        if (search.trim()) params.append('search', search.trim());
        if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
        if (Number(maxPrice) < 6000) params.append('maxPrice', maxPrice);
        if (isEggless) params.append('isEggless', 'true');
        if (sort) params.append('sort', sort);
        if (page > 1) params.append('page', String(page));
        if (limit && limit !== '12') params.append('limit', limit);

        setSearchParams(params, { replace: true });

        const res = await api.get(`/items?${params.toString()}`);
        if (res.data?.success) {
          const count = res.data.total ?? res.data.totalCount ?? res.data.count ?? (res.data.items?.length || 0);
          const pagesCount = res.data.pages ?? res.data.totalPages ?? 1;
          setItems(res.data.items || []);
          setTotalCount(count);
          setTotalPages(pagesCount);
        }
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [search, selectedCategory, maxPrice, isEggless, sort, page, limit]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setMaxPrice('6000');
    setIsEggless(false);
    setSort('newest');
    setPage(1);
    setLimit('12');
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
            {t('browse.eyebrow') || 'Artisanal Bakery Catalog'}
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-chocolate mt-0.5">
            {t('browse.title') || 'All bakery items'}
          </h1>
          <p className="text-xs sm:text-sm text-bakery-600 mt-1">
            {t('browse.subtitle') || 'Homemade treats prepared fresh by independent bakers across Pakistan.'}
          </p>
        </div>

        {/* Marketplace Trust & Freshness Highlights */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-600/20 text-chocolate text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-caramel shrink-0" />
            <span>{isLoading ? "..." : (totalCount || items.length)} Homemade Treats Available</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={buttonTap}
            type="button"
            onClick={() => {
              setIsEggless(!isEggless);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-xs cursor-pointer ${
              isEggless
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
            title="Toggle Eggless filter"
          >
            <span>🌿</span>
            <span>{t('items.eggless') || 'Eggless Only'}</span>
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
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            maxPrice={maxPrice}
            onChangeMaxPrice={(p) => {
              setMaxPrice(p);
              setPage(1);
            }}
            isEggless={isEggless}
            onToggleEggless={(val) => {
              setIsEggless(val);
              setPage(1);
            }}
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
              <span>{t('browse.filters') || 'Filter items'}</span>
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
                    setSelectedCategory(cat);
                    setPage(1);
                    setIsMobileFilterOpen(false);
                  }}
                  maxPrice={maxPrice}
                  onChangeMaxPrice={(p) => {
                    setMaxPrice(p);
                    setPage(1);
                  }}
                  isEggless={isEggless}
                  onToggleEggless={(val) => {
                    setIsEggless(val);
                    setPage(1);
                  }}
                  onResetFilters={handleResetFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Catalog Results Grid */}
        <div className="flex-1 w-full space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-bakery-200 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <span className="font-semibold text-chocolate">
              {isLoading ? "..." : (totalCount || items.length)} {t('browse.itemsAvailable') || 'homemade treats found'}
            </span>

            <div className="flex items-center gap-3 ml-auto">
              {/* Limit selector */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-bakery-600 whitespace-nowrap">
                  {t('browse.show') || 'Show:'}
                </label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(e.target.value);
                    setPage(1);
                  }}
                  className="input-bakery text-xs py-1 px-2 bg-white font-medium rounded-md"
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="all">{t('browse.all') || 'All'} ({totalCount})</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-bakery-600 whitespace-nowrap">
                  {t('browse.sort') || 'Sort:'}
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="input-bakery text-xs py-1 px-2.5 bg-white font-medium rounded-md"
                >
                  <option value="newest">{t('browse.sortNewest') || 'Newest first'}</option>
                  <option value="price_asc">{t('browse.sortPriceAsc') || 'Price: low to high'}</option>
                  <option value="price_desc">{t('browse.sortPriceDesc') || 'Price: high to low'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Pills with Animated Entrance */}
          {(selectedCategory !== 'all' || Number(maxPrice) < 6000 || isEggless || search) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-bakery-500">{t('browse.activeFilters') || 'Active filters:'}</span>

              {search && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bakery-100 text-chocolate font-medium border border-bakery-200"
                >
                  <span>"{search}"</span>
                  <button onClick={() => setSearch('')} className="hover:text-strawberry">
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
                  <span>{t('browse.category') || 'Category:'} {translateCategory(selectedCategory)}</span>
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-strawberry">
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
                  <span>{t('browse.under') || 'Under'} Rs. {Number(maxPrice).toLocaleString()}</span>
                  <button onClick={() => setMaxPrice('6000')} className="hover:text-strawberry">
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
                  <span>{t('browse.egglessOnly') || 'Eggless only'}</span>
                  <button onClick={() => setIsEggless(false)} className="hover:text-rose-700">
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-caramel hover:text-caramel-dark underline font-medium ml-1"
              >
                {t('browse.clearAll') || 'Clear all'}
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
                {t('browse.noItemsFound') || 'No items found'}
              </h3>
              <p className="text-xs text-bakery-600 max-w-sm mx-auto mb-4">
                {t('browse.noItemsFoundDesc') || 'No items match your selected filters. Try removing some filters or searching for something else.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={buttonTap}
                type="button"
                onClick={handleResetFilters}
                className="btn-primary text-xs py-1.5 px-4 inline-flex shadow-xs"
              >
                {t('browse.resetFilters') || 'Reset all filters'}
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
                {t('browse.page') || 'Page'} {page} {t('browse.of') || 'of'} {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={buttonTap}
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(p - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{t('browse.prev') || 'Prev'}</span>
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <motion.button
                    key={pNum}
                    whileTap={buttonTap}
                    type="button"
                    onClick={() => {
                      setPage(pNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    setPage((p) => Math.min(p + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
                >
                  <span>{t('browse.next') || 'Next'}</span>
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
