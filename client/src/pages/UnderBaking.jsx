import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { fadeUp, buttonTap, TIMING, EASING } from '../animations/motion';

const UnderBaking = ({
  title = 'This Feature',
  titleUrdu,
  description = '',
  descUrdu = ''
}) => {
  const { isUrdu } = useTranslation();

  const activeTitle = isUrdu && titleUrdu ? titleUrdu : title;
  const activeDesc = isUrdu && descUrdu ? descUrdu : description;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-bakery-50">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-white rounded-2xl border border-bakery-200 p-8 sm:p-10 text-center shadow-warm space-y-6"
      >
        {/* Animated Oven / Baking Illustration with subtle floating & steam */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-chocolate shadow-xs"
        >
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
            aria-hidden="true"
          >
            {/* Oven Body */}
            <rect x="10" y="14" width="44" height="40" rx="6" fill="#FFF6E9" stroke="#4A2C1A" strokeWidth="2.5" />
            {/* Oven Window */}
            <rect x="16" y="24" width="32" height="20" rx="3" fill="#4A2C1A" opacity="0.1" stroke="#4A2C1A" strokeWidth="2" />
            {/* Oven Handle */}
            <line x1="20" y1="19" x2="44" y2="19" stroke="#C77B30" strokeWidth="3" strokeLinecap="round" />
            {/* Heat waves / Steam with subtle pulse */}
            <path d="M26 36C26 33 28 32 28 29" stroke="#C77B30" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 36C32 33 34 32 34 29" stroke="#C77B30" strokeWidth="2" strokeLinecap="round" />
            <path d="M38 36C38 33 40 32 40 29" stroke="#C77B30" strokeWidth="2" strokeLinecap="round" />
            {/* Oven Feet */}
            <rect x="14" y="54" width="6" height="3" rx="1" fill="#4A2C1A" />
            <rect x="44" y="54" width="6" height="3" rx="1" fill="#4A2C1A" />
          </svg>
        </motion.div>

        {/* Content */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            {isUrdu ? 'زیرِ تیاری' : 'Coming Soon'}
          </span>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate">
            {isUrdu ? 'ابھی اوون میں ہے' : 'Under Baking'}
          </h1>

          <p className="text-sm font-medium text-chocolate/90 leading-relaxed">
            {isUrdu
              ? activeTitle + ' ابھی اوون میں ہے اور اگلی اپڈیٹ میں دستیاب ہوگا۔'
              : activeTitle + ' is still in the oven. It will be ready in an upcoming milestone.'}
          </p>

          {activeDesc && (
            <p className="text-xs text-bakery-600 mt-1 leading-relaxed">
              {activeDesc}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto btn-secondary text-xs py-2.5 px-4 rounded-lg font-medium inline-flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'ہوم پیج پر جائیں' : 'Back to home'}</span>
          </Link>
          <Link
            to="/items"
            className="w-full sm:w-auto btn-primary text-xs py-2.5 px-4 rounded-lg font-medium inline-flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'اشیاء دیکھیں' : 'Browse items'}</span>
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default UnderBaking;
