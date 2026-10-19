import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import BrandLogo from './BrandLogo';

const Footer = () => {
  const { t, lang, toggleLanguage } = useTranslation();

  return (
    <footer className="bg-chocolate text-white/80">

      {/* Top wave */}
      <div className="bg-bakery-50">
        <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 0L1440 0L1440 30C1200 50 960 10 720 30C480 50 240 10 0 30L0 0Z" fill="#4A2C1A" />
        </svg>
      </div>

      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand & About */}
          <div className="md:col-span-2 space-y-5">
            <Link to="/" className="inline-block w-fit">
              <BrandLogo size="md" />
            </Link>
            <p className="text-white/70 text-sm max-w-sm leading-relaxed">
              Pakistan's premier marketplace celebrating homemade sweets, artisanal breads, and bespoke bakery creations. Connecting conscious food lovers with passionate local home bakers.
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-amber-200 border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-caramel" />
                Verified Bakers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-200 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Fresh on Order
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-amber-100 border border-white/15">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                Hygiene Inspected
              </span>
            </div>
            
            {/* Language toggle in footer */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all w-fit"
            >
              <Globe className="w-4 h-4 text-caramel" />
              {lang === 'en' ? 'Switch to اردو' : 'Switch to English'}
            </button>
          </div>

          {/* Marketplace links */}
          <div>
            <h4 className="font-serif text-white text-base font-semibold mb-5">Explore Bakery</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/items" className="text-white/65 hover:text-caramel transition-colors flex items-center gap-1.5">
                  Artisanal Catalog
                </Link>
              </li>
              <li>
                <Link to="/items?category=traditional-mithai" className="text-white/65 hover:text-caramel transition-colors">
                  Traditional Mithai
                </Link>
              </li>
              <li>
                <Link to="/register?role=seller" className="text-white/65 hover:text-caramel transition-colors">
                  Partner with MeethaCart
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/65 hover:text-caramel transition-colors">
                  Baker Studio Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Quality & Trust */}
          <div>
            <h4 className="font-serif text-white text-base font-semibold mb-5">Our Quality Standards</h4>
            <ul className="space-y-2.5 text-sm text-white/65 leading-relaxed">
              <li>Authentic Family Recipes</li>
              <li>Pure Butter & Desi Ghee</li>
              <li>Safe Eco-Friendly Packaging</li>
              <li>Strict Hygiene Guidelines</li>
              <li>Direct Baker Communication</li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-3">
          <p>© 2026 MeethaCart. All rights reserved. Handcrafted for homemade bakery lovers.</p>
          <p className="flex items-center gap-1.5">
            Baking with <Heart className="w-3.5 h-3.5 text-strawberry fill-strawberry" /> for local artisan bakeries
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
