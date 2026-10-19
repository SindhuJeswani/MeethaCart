import React from 'react';
import { Link } from 'react-router-dom';
import { Cake, Heart, Globe, Instagram, Twitter } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

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

          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-caramel flex items-center justify-center text-white shadow-md">
                <Cake className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Meetha<span className="text-caramel">Cart</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              An AI-powered bilingual marketplace connecting buyers with talented home bakers. Supporting local craft, one order at a time.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge badge-caramel text-[11px]">Final Year Project</span>
              <span className="badge badge-warm text-[11px]">MERN Stack</span>
              <span className="badge badge-green text-[11px]">Bilingual EN/اردو</span>
            </div>
            {/* Language toggle in footer */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all w-fit"
            >
              <Globe className="w-4 h-4 text-caramel" />
              {lang === 'en' ? 'Switch to اردو' : 'Switch to English'}
            </button>
          </div>

          {/* Marketplace links */}
          <div>
            <h4 className="font-serif text-white text-base font-semibold mb-5">Marketplace</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/items" className="text-white/60 hover:text-caramel transition-colors flex items-center gap-1.5">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link to="/register?role=seller" className="text-white/60 hover:text-caramel transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/60 hover:text-caramel transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-white/60 hover:text-caramel transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech stack */}
          <div>
            <h4 className="font-serif text-white text-base font-semibold mb-5">FYP Architecture</h4>
            <ul className="space-y-2 text-sm text-white/55 leading-relaxed">
              <li>React + Vite (Frontend)</li>
              <li>Node.js + Express (Backend)</li>
              <li>MongoDB + Mongoose (DB)</li>
              <li>JWT + OTP 2FA Auth</li>
              <li>Role-Based Access Control</li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-3">
          <p>© 2026 MeethaCart. All rights reserved. Built as a Final Year Project.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart className="w-3.5 h-3.5 text-strawberry fill-strawberry" /> by the MeethaCart team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
