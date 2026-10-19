import React from 'react';
import { Filter, RotateCcw, Sparkles } from 'lucide-react';

const ItemFilterSidebar = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  maxPrice,
  onChangeMaxPrice,
  isEggless,
  onToggleEggless,
  onResetFilters
}) => {
  return (
    <aside className="w-full lg:w-64 space-y-6 shrink-0">
      <div className="card-bakery p-5 space-y-6 border-bakery-200">
        
        {/* Title & Reset */}
        <div className="flex items-center justify-between pb-3 border-b border-bakery-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-caramel" />
            <h3 className="font-serif font-bold text-chocolate text-base">Filters</h3>
          </div>
          <button
            onClick={onResetFilters}
            className="text-xs font-semibold text-caramel hover:text-caramel-dark flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Categories Section */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-bakery-700">
            Category
          </label>
          <div className="space-y-1">
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                selectedCategory === 'all'
                  ? 'bg-caramel/10 text-caramel border border-caramel/20'
                  : 'text-bakery-700 hover:bg-bakery-200/50'
              }`}
            >
              <span>All Items</span>
              {selectedCategory === 'all' && (
                <span className="w-1.5 h-1.5 rounded-full bg-caramel"></span>
              )}
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onSelectCategory(cat.slug || cat._id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                  selectedCategory === cat.slug || selectedCategory === cat._id
                    ? 'bg-caramel/10 text-caramel border border-caramel/20'
                    : 'text-bakery-700 hover:bg-bakery-200/50'
                }`}
              >
                <span>{cat.name}</span>
                {(selectedCategory === cat.slug || selectedCategory === cat._id) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-caramel"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Slider */}
        <div className="space-y-3 pt-3 border-t border-bakery-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-bakery-700">
              Max Price
            </label>
            <span className="text-xs font-bold text-chocolate bg-caramel/10 px-2 py-0.5 rounded-md border border-caramel/20">
              PKR {Number(maxPrice).toLocaleString()}
            </span>
          </div>

          <input
            type="range"
            min="300"
            max="6000"
            step="100"
            value={maxPrice}
            onChange={(e) => onChangeMaxPrice(e.target.value)}
            className="w-full accent-caramel cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-bakery-500 font-medium">
            <span>PKR 300</span>
            <span>PKR 6,000+</span>
          </div>
        </div>

        {/* Dietary Filter (Eggless) */}
        <div className="pt-3 border-t border-bakery-200/80">
          <label className="text-xs font-bold uppercase tracking-wider text-bakery-700 block mb-2">
            Dietary Preferences
          </label>
          <label className="flex items-center gap-2.5 p-2 rounded-xl bg-bakery-50 hover:bg-bakery-100 transition-colors cursor-pointer border border-bakery-200/60">
            <input
              type="checkbox"
              checked={isEggless}
              onChange={(e) => onToggleEggless(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-bakery-300"
            />
            <span className="text-xs font-semibold text-bakery-800">
              Eggless Only 🍃
            </span>
          </label>
        </div>

      </div>
    </aside>
  );
};

export default ItemFilterSidebar;
