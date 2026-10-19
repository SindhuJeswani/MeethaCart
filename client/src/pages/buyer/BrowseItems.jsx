import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ItemCard from '../../components/items/ItemCard';
import ItemFilterSidebar from '../../components/items/ItemFilterSidebar';
import { Search, ShoppingBag, SlidersHorizontal, X, RefreshCw } from 'lucide-react';

const BrowseItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '6000');
  const [isEggless, setIsEggless] = useState(searchParams.get('isEggless') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Sync state if URL search query changes (e.g. from navbar search)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCat = searchParams.get('category') || 'all';
    setSearch(urlSearch);
    setSelectedCategory(urlCat);
  }, [searchParams]);

  // Fetch Categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.warn('Error loading categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Items on filter change
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (maxPrice && Number(maxPrice) < 6000) params.append('maxPrice', maxPrice);
      if (isEggless) params.append('isEggless', 'true');
      if (sort) params.append('sort', sort);

      // Sync state back to URL query parameters
      setSearchParams(params, { replace: true });

      const res = await api.get(`/items?${params.toString()}`);
      if (res.data?.success) {
        setItems(res.data.items || []);
        setTotalCount(res.data.total ?? res.data.count ?? (res.data.items?.length || 0));
      }
    } catch (err) {
      console.error('Error fetching items:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, maxPrice, isEggless, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setMaxPrice('6000');
    setIsEggless(false);
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="page-container py-6 space-y-6">

      {/* Breadcrumb & Header */}
      <div className="space-y-1.5 pb-2 border-b border-bakery-200">
        <nav className="flex items-center gap-1.5 text-xs text-bakery-500">
          <Link to="/" className="hover:text-chocolate">Home</Link>
          <span>/</span>
          <span className="text-bakery-800 font-medium">All items</span>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span className="text-chocolate font-medium capitalize">{selectedCategory}</span>
            </>
          )}
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate">
              {selectedCategory !== 'all' ? `${selectedCategory}` : 'All bakery items'}
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-0.5">
              Homemade treats prepared fresh by independent bakers across Pakistan.
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-bakery-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-8 py-2 rounded-md bg-white border border-bakery-200 text-chocolate placeholder-bakery-400 text-xs focus:outline-none focus:border-caramel"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchItems();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bakery-400 hover:text-bakery-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Catalog Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden w-full flex items-center justify-between py-2 border-b border-bakery-200">
          <button
            type="button"
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-caramel" />
            <span>{showMobileFilter ? 'Hide filters' : 'Filters'}</span>
          </button>
          <span className="text-xs text-bakery-600 font-medium">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Sidebar Filters */}
        <div className={`${showMobileFilter ? 'block w-full' : 'hidden'} lg:block shrink-0`}>
          <ItemFilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            maxPrice={maxPrice}
            onChangeMaxPrice={(p) => setMaxPrice(p)}
            isEggless={isEggless}
            onToggleEggless={(val) => setIsEggless(val)}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Items Grid & Sort Toolbar */}
        <div className="flex-1 space-y-4 w-full">

          {/* Top Bar: Count & Sort */}
          <div className="bg-white rounded-lg border border-bakery-200 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-bakery-700">
              Showing <strong className="text-chocolate">{items.length}</strong> of{' '}
              <strong className="text-chocolate">{totalCount}</strong> items
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-medium text-bakery-600 whitespace-nowrap">
                Sort:
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-bakery text-xs py-1 px-2.5 bg-white font-medium rounded-md"
              >
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {(selectedCategory !== 'all' || Number(maxPrice) < 6000 || isEggless || search) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-bakery-500">Active filters:</span>

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bakery-100 text-chocolate font-medium border border-bakery-200">
                  <span>"{search}"</span>
                  <button onClick={() => setSearch('')} className="hover:text-strawberry">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bakery-100 text-chocolate font-medium border border-bakery-200">
                  <span>Category: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-strawberry">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {Number(maxPrice) < 6000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bakery-100 text-chocolate font-medium border border-bakery-200">
                  <span>Under Rs. {Number(maxPrice).toLocaleString()}</span>
                  <button onClick={() => setMaxPrice('6000')} className="hover:text-strawberry">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {isEggless && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                  <span>Eggless only</span>
                  <button onClick={() => setIsEggless(false)} className="hover:text-rose-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
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

          {/* Item Grid */}
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-caramel animate-spin" />
              <p className="text-xs text-bakery-600">Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-lg border border-bakery-200 text-center py-16 px-4">
              <ShoppingBag className="w-10 h-10 text-bakery-300 mx-auto mb-2" />
              <h3 className="text-base font-serif font-bold text-chocolate mb-1">
                No items found
              </h3>
              <p className="text-xs text-bakery-600 max-w-sm mx-auto mb-4">
                No items match your selected filters. Try removing some filters or searching for something else.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-primary text-xs py-1.5 px-4 inline-flex"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default BrowseItems;
