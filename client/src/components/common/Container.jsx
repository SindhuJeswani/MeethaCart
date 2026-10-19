import React from 'react';

/**
 * Shared Container Component
 * - max-width: 1200px
 * - centered: mx-auto
 * - horizontal padding: 24px on desktop (md:px-6 = 1.5rem = 24px), 16px on mobile (px-4 = 1rem = 16px)
 * - consistent edge alignment across all pages, navbars, and footers
 */
const Container = ({ children, className = '', as: Component = 'div', ...props }) => {
  return (
    <Component
      className={`w-full max-w-[1200px] mx-auto px-4 md:px-6 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
