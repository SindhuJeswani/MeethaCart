import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Mail } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import Logo from './Logo';
import Container from './Container';
import api from '../../services/api';

const AUTH_ROUTES = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];

const Footer = () => {
  const { lang, toggleLanguage } = useTranslation();
  const location = useLocation();
  const [categories, setCategories] = useState([]);

  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  // Fetch real categories for Shop column
  useEffect(() => {
    if (isAuthPage) return;
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success && Array.isArray(res.data.categories)) {
          setCategories(res.data.categories.slice(0, 4));
        }
      } catch {
        // Fallback gracefully to default top categories
        setCategories([
          { _id: '1', name: 'Cakes & Cupcakes', slug: 'cakes' },
          { _id: '2', name: 'Traditional Mithai', slug: 'mithai' },
          { _id: '3', name: 'Cookies & Biscuits', slug: 'cookies' },
          { _id: '4', name: 'Breads & Buns', slug: 'breads' }
        ]);
      }
    };
    fetchCats();
  }, [isAuthPage]);

  // ── 1. MINIMAL FOOTER FOR AUTH PAGES ──────────────────────────────
  if (isAuthPage) {
    return (
      <footer className="border-t border-bakery-200 bg-surface py-3.5 mt-auto">
        <Container className="flex flex-col sm:flex-row items-center justify-between text-xs text-bakery-600 gap-2">
          <p>© {new Date().getFullYear()} MeethaCart. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-chocolate font-medium transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-chocolate font-medium transition-colors">
              Privacy
            </Link>
          </div>
        </Container>
      </footer>
    );
  }

  // ── 2. FULL 4-COLUMN FOOTER FOR ALL OTHER PAGES ───────────────────
  return (
    <footer className="bg-[#4A2C1A] text-white/80 border-t-2 border-caramel/25 mt-auto">
      <Container className="py-12">
        {/* 4-column structured grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Col 1: Brand (Wider, 4 of 12 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="light" size="md" showSubtitle={true} to="/" />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-sm">
              An online marketplace connecting local home bakers across Pakistan with people who love fresh, homemade baked goods.
            </p>
            <div>
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/20 text-xs font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-caramel-light" />
                <span>{lang === 'en' ? 'اردو میں دیکھیں' : 'Switch to English'}</span>
              </button>
            </div>
          </div>

          {/* Col 2: Shop (3 of 12 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white text-sm font-semibold font-serif tracking-wide">Shop</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/items" className="text-white/70 hover:text-white transition-colors block">
                  All items
                </Link>
              </li>
              <li>
                <Link to="/items?sort=newest" className="text-white/70 hover:text-white transition-colors block">
                  New arrivals
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    to={`/items?category=${encodeURIComponent(cat.slug || cat.name)}`}
                    className="text-white/70 hover:text-white transition-colors block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/custom-requests"
                  className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Custom requests</span>
                  <span className="text-[10px] bg-amber-400/25 text-amber-200 border border-amber-400/30 px-1.5 py-0.5 rounded font-semibold">
                    Soon
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Sell (2 of 12 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white text-sm font-semibold font-serif tracking-wide">Sell</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/register?role=seller" className="text-white/70 hover:text-white transition-colors block">
                  Become a seller
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/70 hover:text-white transition-colors block">
                  Seller sign in
                </Link>
              </li>
              <li>
                <Link
                  to="/seller-guidelines"
                  className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Seller guidelines</span>
                  <span className="text-[10px] bg-amber-400/25 text-amber-200 border border-amber-400/30 px-1.5 py-0.5 rounded font-semibold">
                    Soon
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Help & Contact (3 of 12 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white text-sm font-semibold font-serif tracking-wide">Help</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="mailto:contact@meethacart.pk"
                  className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-caramel-light" />
                  <span>contact@meethacart.pk</span>
                </a>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Help centre</span>
                  <span className="text-[10px] bg-amber-400/25 text-amber-200 border border-amber-400/30 px-1.5 py-0.5 rounded font-semibold">
                    Soon
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/70 hover:text-white transition-colors block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/70 hover:text-white transition-colors block">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Full container width divider line */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-white/55 gap-3">
          <p>© {new Date().getFullYear()} MeethaCart. All rights reserved.</p>
          <p className="text-white/50 text-center md:text-left">
            Available in Karachi, Lahore, Islamabad & across Pakistan.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-white/80 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white/80 transition-colors">Privacy</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
