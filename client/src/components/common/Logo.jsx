import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

/**
 * MeethaCart Official "SL" Monogram Logo
 * 
 * Exact SVG geometry:
 * A squared 'S' whose left side is half drawn in an accent color.
 * That accent bar, together with the S's top-left stroke and bottom bar,
 * forms a hidden 'L' monogram.
 */
const Logo = ({
  size = 40,
  showWordmark = true,
  variant = 'default',
  to,
  wordmarkText,
  showSubtitle = false,
  className = ''
}) => {
  const { lang } = useTranslation();
  const isUr = lang === 'ur';

  // Safely resolve user for role-aware home linking
  let authContext = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // Outside AuthProvider fallback
  }
  const user = authContext?.user;

  // Resolve numerical pixel size
  const numSize = (() => {
    if (typeof size === 'number') return size;
    if (size === 'sm') return 28;
    if (size === 'md') return 36;
    if (size === 'lg') return 48;
    const parsed = parseInt(size, 10);
    return isNaN(parsed) ? 40 : parsed;
  })();

  // Thicken stroke slightly at small sizes (<= 24px) for crisp readability
  const strokeWidth = numSize <= 24 ? 14 : 12;

  // Variant styling resolution
  const isLightVariant = variant === 'light';
  const isDarkVariant = variant === 'dark';
  const isMarkOnly = variant === 'mark-only' || !showWordmark;

  // Text colors
  const textColor = isLightVariant ? 'text-[#F7F2EA]' : isDarkVariant ? 'text-[#1A1A1A]' : 'text-chocolate';
  const accentColorClass = isLightVariant ? 'text-[#E0604F]' : 'text-caramel-dark';
  const subtextColor = isLightVariant ? 'text-[#F7F2EA]/75' : 'text-bakery-600';

  // Accent stroke for SVG: Light variant uses #E0604F, dark/default uses --logo-accent with #B5372A fallback
  const accentStroke = isLightVariant
    ? 'var(--logo-accent-light, #E0604F)'
    : 'var(--logo-accent, #B5372A)';

  // Main stroke uses currentColor so it inherits from parent text color
  const mainStrokeColor = isLightVariant ? '#F7F2EA' : isDarkVariant ? '#1A1A1A' : 'currentColor';

  // Dynamic destination link:
  // Visitors -> "/"
  // Logged-in buyer -> "/"
  // Logged-in seller -> "/seller/dashboard"
  // Logged-in admin -> "/admin/dashboard"
  const defaultTo = (() => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'seller') return '/seller/dashboard';
    return '/';
  })();

  const targetLink = to !== undefined ? to : defaultTo;

  // Font size scaling corresponding to mark size
  const titleClass = numSize <= 30
    ? 'text-lg sm:text-xl'
    : numSize <= 40
    ? 'text-xl sm:text-2xl'
    : 'text-2xl sm:text-3xl';

  const subtitleClass = numSize <= 30
    ? 'text-[9px] tracking-wider'
    : 'text-[10px] tracking-widest';

  const logoContent = (
    <div
      className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}
      style={{ color: isLightVariant ? '#F7F2EA' : isDarkVariant ? '#1A1A1A' : undefined }}
    >
      {/* ── Monogram Mark (Always LTR to prevent geometric inversion in RTL) ── */}
      <div
        dir="ltr"
        className="shrink-0 flex items-center justify-center transition-transform duration-250 ease-out group-hover:scale-105"
        style={{ width: numSize, height: numSize }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 120"
          width={numSize}
          height={numSize}
          role="img"
          aria-label="MeethaCart logo"
          className="overflow-visible"
        >
          {/* Base 'S' stroke in currentColor */}
          <path
            d="M100 14 L14 14 L14 60 L100 60 L100 106 L14 106"
            fill="none"
            stroke={mainStrokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
          />

          {/* Accent vertical bar forming the 'L' */}
          <path
            d="M14 60 L14 106"
            fill="none"
            stroke={accentStroke}
            strokeWidth={strokeWidth}
            className="transition-all duration-250 ease-out group-hover:opacity-90 group-hover:stroke-[14px]"
            style={{
              transition: 'stroke 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease-out, stroke-width 250ms ease-out'
            }}
          />
        </svg>
      </div>

      {/* ── Brand Wordmark ── */}
      {!isMarkOnly && (
        <div className="flex flex-col leading-none">
          {wordmarkText ? (
            <span className={`font-serif ${titleClass} font-bold tracking-tight ${textColor} whitespace-nowrap`}>
              {wordmarkText}
            </span>
          ) : isUr ? (
            <span className={`font-serif ${titleClass} font-bold tracking-tight ${textColor} whitespace-nowrap`}>
              میٹھا <span className={`${accentColorClass} font-serif font-extrabold`}>کارٹ</span>
            </span>
          ) : (
            <span className={`font-serif ${titleClass} font-bold tracking-tight ${textColor} whitespace-nowrap`}>
              Meetha<span className={`${accentColorClass} font-serif font-extrabold`}>Cart</span>
            </span>
          )}

          {showSubtitle && (
            <span className={`block ${subtitleClass} uppercase font-semibold mt-1 ${subtextColor}`}>
              {isUr ? 'گھریلو اور روایتی بیکری · پاکستان' : 'Homemade Bakery · Pakistan'}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (targetLink) {
    return (
      <Link
        to={targetLink}
        aria-label="MeethaCart - Home"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel rounded-lg transition-opacity hover:opacity-95"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
