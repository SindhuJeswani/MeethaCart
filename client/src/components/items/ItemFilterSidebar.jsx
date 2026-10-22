import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

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
  const { t, translateCategory } = useTranslation();

  return (
    <aside className="w-full lg:w-60 space-y-5 shrink-0">
      <div className="card-bakery p-4 space-y-5">
        
        {/* Title & Reset */}
        <div className="flex items-center justify-between pb-3 border-b border-bakery-200">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-caramel" />
            <h3 className="font-semibold text-chocolate text-sm">
              {t('items.filters') || 'Filters'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-caramel hover:text-chocolate flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('items.reset') || 'Reset'}</span>
          </button>
        </div>

        {/* Categories Section */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-bakery-700">
            {t('items.category') || 'Category'}
          </label>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory === 'all'
                  ? 'bg-caramel/15 text-chocolate font-semibold'
                  : 'text-bakery-700 hover:bg-bakery-100'
              }`}
            >
              <span>{t('items.allItems') || 'All items'}</span>
              {selectedCategory === 'all' && (
                <span className="w-1.5 h-1.5 rounded-full bg-caramel"></span>
              )}
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => onSelectCategory(cat.slug || cat._id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === cat.slug || selectedCategory === cat._id
                    ? 'bg-caramel/15 text-chocolate font-semibold'
                    : 'text-bakery-700 hover:bg-bakery-100'
                }`}
              >
                <span>{translateCategory(cat.name || cat.slug)}</span>
                {(selectedCategory === cat.slug || selectedCategory === cat._id) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-caramel"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Slider */}
        <div className="space-y-2.5 pt-3 border-t border-bakery-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-bakery-700">
              {t('items.maxPrice') || 'Max price'}
            </label>
            <span className="text-xs font-bold text-chocolate bg-bakery-100 px-2 py-0.5 rounded">
              Rs. {Number(maxPrice).toLocaleString()}
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

          <div className="flex justify-between text-[11px] text-bakery-500">
            <span>Rs. 300</span>
            <span>Rs. 6,000+</span>
          </div>
        </div>

        {/* Dietary Filter (Eggless) */}
        <div className="pt-3 border-t border-bakery-200">
          <label className="text-xs font-semibold text-bakery-700 block mb-2">
            {t('items.dietaryPreference') || 'Dietary preference'}
          </label>
          <label className="flex items-center gap-2 p-2 rounded-md hover:bg-bakery-100 transition-colors cursor-pointer border border-bakery-200">
            <input
              type="checkbox"
              checked={isEggless}
              onChange={(e) => onToggleEggless(e.target.checked)}
              className="w-4 h-4 rounded text-caramel focus:ring-caramel border-bakery-300"
            />
            <span className="text-xs font-medium text-bakery-800">
              {t('items.egglessOnly') || 'Eggless only'}
            </span>
          </label>
        </div>

      </div>
    </aside>
  );
};

export default ItemFilterSidebar;
