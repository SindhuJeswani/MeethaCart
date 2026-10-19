import React from 'react';
import Logo from './Logo';

/**
 * BrandLogo adapter wrapping the unified Logo component.
 * Maps legacy `isLight` prop to the proper `variant` ('light' | 'dark').
 */
const BrandLogo = ({
  className = '',
  size = 'md',
  isLight = false,
  variant,
  to = '/',
  showSubtitle = false
}) => {
  // If variant is explicitly provided, use it. Otherwise, if isLight is true -> 'dark' text for light bg.
  // If isLight is false -> 'light' text for dark bg (or default to 'dark' if on cream).
  const resolvedVariant = variant || (isLight ? 'dark' : 'light');

  return (
    <Logo
      variant={resolvedVariant}
      size={size}
      to={to}
      showSubtitle={showSubtitle}
      className={className}
    />
  );
};

export default BrandLogo;
