import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable MeethaCart Brand Logo Component
 * 
 * @param {'dark' | 'light'} variant
 *   - 'dark': For cream/light backgrounds (e.g. Welcome screen, Auth card, Splash). Text is dark chocolate (#3D240E).
 *   - 'light': For dark backgrounds (e.g. Navbar, Footer, Auth brand sidebar). Text is crisp white (#FFFFFF).
 * @param {'sm' | 'md' | 'lg'} size
 * @param {string|null} to Link target. Defaults to '/' (homepage). Pass null to render a non-link container.
 * @param {boolean} showSubtitle Whether to display the tagline.
 */
const Logo = ({
  variant = 'dark',
  size = 'md',
  to = '/',
  showSubtitle = false,
  className = ''
}) => {
  // Sizing definitions ensuring desktop >= 22px, mobile >= 18px
  const sizeConfig = {
    sm: {
      emblem: 'w-8 h-8 rounded-lg',
      iconSvg: 'w-5 h-5',
      titleText: 'text-lg sm:text-xl', // >=18px mobile, >=20px desktop
      subtitleText: 'text-[9px] tracking-wider'
    },
    md: {
      emblem: 'w-10 h-10 rounded-xl',
      iconSvg: 'w-6 h-6',
      titleText: 'text-xl sm:text-2xl', // >=20px mobile, >=24px desktop
      subtitleText: 'text-[10px] tracking-widest'
    },
    lg: {
      emblem: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl',
      iconSvg: 'w-7 h-7 sm:w-8 sm:h-8',
      titleText: 'text-2xl sm:text-3xl', // >=24px mobile, >=30px desktop
      subtitleText: 'text-xs tracking-widest'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  // High-contrast color assignments (>= 4.5:1 WCAG AA compliance guaranteed)
  const isDarkVariant = variant === 'dark';
  const textColor = isDarkVariant ? 'text-chocolate' : 'text-white';
  const accentColor = isDarkVariant ? 'text-caramel-dark' : 'text-amber-300';
  const subtextColor = isDarkVariant ? 'text-bakery-600' : 'text-amber-200/80';

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* ── Bakery Crest Emblem ── */}
      <div
        className={`${currentSize.emblem} shrink-0 bg-gradient-to-br from-amber-400 via-caramel to-amber-700 p-[2px] shadow-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
      >
        <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-chocolate to-[#2A150A] flex items-center justify-center relative overflow-hidden">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${currentSize.iconSvg} text-amber-300 relative z-10`}
            aria-hidden="true"
          >
            {/* Chef Toque / Swirl */}
            <path
              d="M24 8C25.5 8 26.8 9.2 26.8 10.7C27.6 10.3 28.5 10.1 29.5 10.1C32 10.1 34 12.1 34 14.6C34 15.3 33.8 16 33.5 16.6C35.5 17.5 37 19.6 37 22C37 24.8 35 27 32.2 27.4C32.4 28 32.5 28.6 32.5 29.3C32.5 31.9 30.4 34 27.8 34H20.2C17.6 34 15.5 31.9 15.5 29.3C15.5 28.6 15.6 28 15.8 27.4C13 27 11 24.8 11 22C11 19.6 12.5 17.5 14.5 16.6C14.2 16 14 15.3 14 14.6C14 12.1 16 10.1 18.5 10.1C19.5 10.1 20.4 10.3 21.2 10.7C21.2 9.2 22.5 8 24 8Z"
              fill="#FFFBF3"
            />
            {/* Cupcake / Patisserie Base */}
            <path
              d="M17 28L18.8 38.5C19 39.4 19.8 40 20.7 40H27.3C28.2 40 29 39.4 29.2 38.5L31 28"
              fill="#FBBF24"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Base pleats */}
            <path d="M21 28.5L22 39" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <path d="M24 28.5V39.5" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <path d="M27 28.5L26 39" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            {/* Star Sparkle */}
            <path
              d="M24 4L24.8 6.5L27.3 7.3L24.8 8.1L24 10.6L23.2 8.1L20.7 7.3L23.2 6.5L24 4Z"
              fill="#FDE68A"
            />
          </svg>
        </div>
      </div>

      {/* ── Brand Wordmark ── */}
      <div className="flex flex-col leading-none">
        <span className={`font-serif ${currentSize.titleText} font-bold tracking-tight ${textColor} whitespace-nowrap`}>
          Meetha<span className={`${accentColor} font-serif font-extrabold`}>Cart</span>
        </span>
        {showSubtitle && (
          <span className={`block ${currentSize.subtitleText} uppercase font-semibold mt-1 ${subtextColor}`}>
            Homemade Bakery · Pakistan
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} aria-label="MeethaCart - Home" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel rounded-lg">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
