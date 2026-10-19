import React from 'react';

/**
 * Realistic Artisan Bakery Brand Logo for MeethaCart
 * Features a handcrafted patisserie crest with wheat & whisk flourishes,
 * golden caramel gradient, and luxury serif typography.
 */
const BrandLogo = ({ className = '', size = 'md', isLight = false }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const subSizes = {
    sm: 'text-[9px] tracking-[0.18em]',
    md: 'text-[10px] tracking-[0.22em]',
    lg: 'text-xs tracking-[0.25em]'
  };

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* ── Artisan Bakery Crest Emblem ── */}
      <div
        className={`${iconSizes[size]} relative rounded-2xl bg-gradient-to-br from-amber-400 via-caramel to-amber-700 p-[2px] shadow-warm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1`}
      >
        {/* Inner dark chocolate canvas */}
        <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-chocolate to-[#2A150A] flex items-center justify-center relative overflow-hidden">
          {/* Subtle inner radial glow */}
          <div className="absolute inset-0 bg-radial from-amber-400/20 via-transparent to-transparent pointer-events-none" />

          {/* Handcrafted Bakery SVG Insignia */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-amber-300 relative z-10"
          >
            {/* Crown / Chef Toque / Swirl Top */}
            <path
              d="M24 8C25.5 8 26.8 9.2 26.8 10.7C27.6 10.3 28.5 10.1 29.5 10.1C32 10.1 34 12.1 34 14.6C34 15.3 33.8 16 33.5 16.6C35.5 17.5 37 19.6 37 22C37 24.8 35 27 32.2 27.4C32.4 28 32.5 28.6 32.5 29.3C32.5 31.9 30.4 34 27.8 34H20.2C17.6 34 15.5 31.9 15.5 29.3C15.5 28.6 15.6 28 15.8 27.4C13 27 11 24.8 11 22C11 19.6 12.5 17.5 14.5 16.6C14.2 16 14 15.3 14 14.6C14 12.1 16 10.1 18.5 10.1C19.5 10.1 20.4 10.3 21.2 10.7C21.2 9.2 22.5 8 24 8Z"
              fill="url(#creamGradient)"
              opacity="0.95"
            />
            {/* Cupcake Base / Patisserie Base with artisan ridges */}
            <path
              d="M17 28L18.8 38.5C19 39.4 19.8 40 20.7 40H27.3C28.2 40 29 39.4 29.2 38.5L31 28"
              fill="url(#goldGradient)"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Base Pleat Ribs */}
            <path d="M21 28.5L22 39" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <path d="M24 28.5V39.5" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <path d="M27 28.5L26 39" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            {/* Sparkle Cherry / Star */}
            <path
              d="M24 4L24.8 6.5L27.3 7.3L24.8 8.1L24 10.6L23.2 8.1L20.7 7.3L23.2 6.5L24 4Z"
              fill="#FDE68A"
            />
            {/* Gradients */}
            <defs>
              <linearGradient id="creamGradient" x1="11" y1="8" x2="37" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFBF3" />
                <stop offset="0.6" stopColor="#FDE68A" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="goldGradient" x1="17" y1="28" x2="31" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── Brand Typography ── */}
      <div className="leading-tight">
        <div className="flex items-baseline">
          <span
            className={`font-serif ${textSizes[size]} font-extrabold tracking-tight ${
              isLight ? 'text-chocolate' : 'text-white'
            }`}
          >
            Meetha<span className="text-caramel font-serif">Cart</span>
          </span>
          <span className="text-strawberry ml-1 font-serif text-sm">✦</span>
        </div>
        <span
          className={`block ${subSizes[size]} uppercase font-semibold ${
            isLight ? 'text-bakery-600' : 'text-amber-200/60'
          }`}
        >
          Artisanal Bakery Market
        </span>
      </div>
    </div>
  );
};

export default BrandLogo;
