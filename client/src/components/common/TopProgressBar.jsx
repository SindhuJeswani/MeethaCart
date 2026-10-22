import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Top Progress Bar
 * Displays a thin, elegant progress bar at the very top of the window on every route change.
 */
const TopProgressBar = () => {
  const location = useLocation();
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <AnimatePresence>
      {animating && (
        <motion.div
          key="top-progress-bar"
          initial={{ scaleX: 0, opacity: 1, originX: 0 }}
          animate={{ scaleX: 1, opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="top-loader-bar"
        />
      )}
    </AnimatePresence>
  );
};

export default TopProgressBar;
