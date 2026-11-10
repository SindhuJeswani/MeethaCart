import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Container from './Container';
import Logo from './Logo';
import { Mail } from 'lucide-react';
import api from '../../services/api';

const Footer = () => {
  const location = useLocation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.get('/categories')
      .then((res) => {
        if (isMounted && res.data?.success) {
          setCategories((res.data.categories || []).slice(0, 4));
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const isAuthPage = [
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/reset-password'
  ].includes(location.pathname);

  // Minimal footer on auth pages
  if (isAuthPage) {
    return (
      <footer className="border-t py-3.5 mt-auto" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <Container className="flex flex-col sm:flex-row items-center justify-between text-xs text-bakery-600 gap-2">
          <p>© {new Date().getFullYear()} MeethaCart. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:underline font-medium transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:underline font-medium transition-colors">
              Privacy
            </Link>
          </div>
        </Container>
      </footer>
    );
  }

  // Full 4-column structured footer
  return (
    <>
      <div className="ajrak-pattern-band-top" />
      <footer
        className="text-white/80 mt-auto"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderTopColor: 'var(--color-primary)'
        }}
      >
      <Container className="py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Col 1: Brand */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="light" size="md" showSubtitle={true} to="/" />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-sm">
              An online marketplace connecting local home bakers across Pakistan with people who love fresh, homemade baked goods.
            </p>
          </div>

          {/* Col 2: Shop */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white text-sm font-semibold font-serif tracking-wide">
              Shop
            </h4>
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

            </ul>
          </div>

          {/* Col 3: Sell */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white text-sm font-semibold font-serif tracking-wide">
              Sell
            </h4>
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

            </ul>
          </div>

          {/* Col 4: Help & Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white text-sm font-semibold font-serif tracking-wide">
              Help
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="mailto:contact@meethacart.pk"
                  className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-300" />
                  <span>contact@meethacart.pk</span>
                </a>
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

        {/* Divider line & bottom copyright */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-white/55 gap-3">
          <p>© {new Date().getFullYear()} MeethaCart. All rights reserved.</p>
          <p className="text-white/50 text-center md:text-left">
            Available in Karachi, Lahore, Islamabad & across Pakistan.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-white/80 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white/80 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
    </>
  );
};

export default Footer;
