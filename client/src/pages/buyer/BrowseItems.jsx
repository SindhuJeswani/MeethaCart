import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ItemCard from '../../components/items/ItemCard';
import ItemFilterSidebar from '../../components/items/ItemFilterSidebar';
import { Search, ShoppingBag, SlidersHorizontal, X, RefreshCw, Cake } from 'lucide-react';

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

  // Fetch Categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.categories);
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
        setItems(res.data.items);
        setTotalCount(res.data.total || res.data.count);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 p-6 sm:p-10 text-white shadow-warm-lg flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-caramel/20 text-caramel flex items-center justify-center border border-caramel/30">
          <Cake className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
          Explore the Bakery Catalog
        </h1>
        <p className="text-sm text-amber-200/90 max-w-xl">
          Browse handcrafted cakes, traditional mithai, artisan breads, and more — made by home bakers near you.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl relative pt-2">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-bakery-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cakes, gulab jamun, sourdough, cookies..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-chocolate placeholder-bakery-400 focus:outline-none focus:ring-4 focus:ring-amber-500/30 text-sm shadow-md font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchItems();
                }}
                className="absolute right-24 text-bakery-400 hover:text-bakery-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Catalog Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden w-full flex items-center justify-between pb-2 border-b border-bakery-200">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="btn-secondary text-xs py-2 px-4"
          >
            <SlidersHorizontal className="w-4 h-4 text-caramel" />
            <span>{showMobileFilter ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          <span className="text-xs font-semibold text-bakery-600">
            {totalCount} Items Found
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
        <div className="flex-1 space-y-6 w-full">
          
          {/* Top Bar: Count & Sort */}
          <div className="card-bakery p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-bakery-200">
            <div className="text-sm font-semibold text-chocolate flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>
                Showing <strong className="text-amber-800">{items.length}</strong> of{' '}
                <strong className="text-amber-800">{totalCount}</strong> freshly baked items
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold uppercase tracking-wider text-bakery-600 whitespace-nowrap">
                Sort By:
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-bakery text-xs py-1.5 px-3 bg-bakery-50 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {(selectedCategory !== 'all' || Number(maxPrice) < 6000 || isEggless || search) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-bakery-500 font-medium">Active filters:</span>

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold">
                  <span>"{search}"</span>
                  <button onClick={() => setSearch('')} className="hover:text-red-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold">
                  <span>Category: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-red-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {Number(maxPrice) < 6000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold">
                  <span>Under PKR {Number(maxPrice).toLocaleString()}</span>
                  <button onClick={() => setMaxPrice('6000')} className="hover:text-red-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {isEggless && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-semibold">
                  <span>Eggless Only 🍃</span>
                  <button onClick={() => setIsEggless(false)} className="hover:text-red-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs text-amber-700 hover:text-amber-900 underline font-medium ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Item Grid */}
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="text-sm font-medium text-bakery-700">Loading bakery delights...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="card-bakery text-center py-20 px-4">
              <ShoppingBag className="w-12 h-12 text-bakery-300 mx-auto mb-3" />
              <h3 className="text-xl font-serif font-bold text-chocolate mb-1">
                No Items Matched
              </h3>
              <p className="text-xs text-bakery-600 max-w-md mx-auto mb-6">
                Try searching for something else or adjusting your price and category filters.
              </p>
              <button onClick={handleResetFilters} className="btn-primary text-xs py-2 px-5 inline-flex">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
