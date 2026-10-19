import React, { useEffect, useState } from 'react';
import Logo from './Logo';

const SplashScreen = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadySeen = sessionStorage.getItem('meethacart_splash_seen');

    if (prefersReducedMotion || alreadySeen) {
      onFinish();
      return;
    }

    // Run 1.5s splash
    const timer = setTimeout(() => {
      setFading(true);
      const closeTimer = setTimeout(() => {
        sessionStorage.setItem('meethacart_splash_seen', 'true');
        onFinish();
      }, 300);
      return () => clearTimeout(closeTimer);
    }, 1200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-bakery-50 transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <Logo variant="dark" size="lg" to={null} showSubtitle={true} />
        <span className="sr-only">Loading MeethaCart</span>
      </div>
    </div>
  );
};

export default SplashScreen;
