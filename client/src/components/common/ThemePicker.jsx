import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { Palette, Check, Sparkles } from 'lucide-react';
import { buttonTap, TIMING, EASING } from '../../animations/motion';

const ThemePicker = ({ variant = 'dropdown', className = '' }) => {
  const { theme, setTheme, themes } = useTheme();
  const { isUrdu } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Inline / Setting card variant (e.g., inside Profile / Settings)
  if (variant === 'settings') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-caramel" />
          <h4 className="font-bold text-chocolate text-sm">
            {isUrdu ? 'تھیم کا انتخاب' : 'Select Theme Appearance'}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <motion.div
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={buttonTap}
                onClick={() => setTheme(t.id)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-caramel bg-amber-50/70 shadow-xs'
                    : 'border-bakery-200 hover:border-bakery-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Swatches preview */}
                  <div className="flex items-center gap-1.5 p-1 rounded-full bg-bakery-100/80 border border-bakery-200">
                    {t.swatches.map((color, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-caramel text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-chocolate text-xs">
                      {isUrdu && t.nameUrdu ? t.nameUrdu : t.name}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-bakery-200 text-bakery-800">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-bakery-500 mt-0.5 line-clamp-2">
                    {t.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Floating button variant (e.g., on Login, Register, Welcome)
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-5 right-5 z-50 ${className}`} ref={containerRef}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: TIMING.normal, ease: EASING.out }}
              className="absolute bottom-14 right-0 w-64 bg-white rounded-2xl border border-bakery-200 shadow-2xl p-3 space-y-2 mb-2"
            >
              <div className="px-2 py-1 border-b border-bakery-100 flex items-center justify-between text-xs font-bold text-chocolate">
                <span>{isUrdu ? 'تھیم منتخب کریں' : 'Theme Switcher'}</span>
                <span className="text-[10px] text-bakery-500 font-normal">3 Styles</span>
              </div>

              <div className="space-y-1">
                {themes.map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        setIsOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-amber-50 text-chocolate font-bold' : 'hover:bg-bakery-50 text-bakery-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center -space-x-1.5">
                          {t.swatches.map((c, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full border border-white shadow-xs"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <span className="text-xs">
                          {isUrdu && t.nameUrdu ? t.nameUrdu : t.name}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-caramel stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={buttonTap}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-11 h-11 rounded-full bg-white text-chocolate border border-bakery-300 shadow-lg flex items-center justify-center hover:bg-bakery-50 transition-colors"
          title="Switch Theme"
          aria-label="Theme Switcher"
        >
          <Palette className="w-5 h-5 text-caramel" />
        </motion.button>
      </div>
    );
  }

  // Standard Navbar Dropdown Variant
  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={buttonTap}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors relative"
        title="Switch Theme"
        aria-label="Choose Theme"
      >
        <Palette className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: TIMING.normal, ease: EASING.out }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-bakery-200 shadow-2xl p-3 z-50 text-chocolate space-y-2"
          >
            <div className="px-2 py-1 border-b border-bakery-100 flex items-center justify-between text-xs font-bold">
              <span>{isUrdu ? 'تھیم منتخب کریں' : 'Marketplace Theme'}</span>
              <span className="text-[10px] text-bakery-500 font-normal">Instant preview</span>
            </div>

            <div className="space-y-1">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-amber-50 text-chocolate font-bold ring-1 ring-caramel/30'
                        : 'hover:bg-bakery-50 text-bakery-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 3 color swatches */}
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        {t.swatches.map((color, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-none">
                            {isUrdu && t.nameUrdu ? t.nameUrdu : t.name}
                          </span>
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-bakery-200/80 text-bakery-700 font-semibold">
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-bakery-500 mt-1 line-clamp-1">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-caramel shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemePicker;
