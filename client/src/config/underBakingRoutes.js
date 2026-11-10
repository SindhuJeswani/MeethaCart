/**
 * Configuration registry for under-construction features.
 * When a feature is implemented, simply remove it from this list
 * and register its real component in App.jsx.
 */

export const UNDER_BAKING_ROUTES = [
  // ── 1. Commerce & Orders ──
  {
    path: '/wishlist',
    title: 'Wishlist & Saved Items',
    description: 'Keep track of your favorite bakeries and treats you want to order later.',
    allowedRoles: null
  },

  // ── 2. Communication & Requests ──
  {
    path: '/messages',
    title: 'Baker Chat & Messages',
    description: 'Chat directly with home bakers regarding customizations, delivery time, and ingredients.',
    allowedRoles: ['buyer', 'seller', 'admin']
  },

  // ── 3. Community & Education ──
  {
    path: '/classes',
    title: 'Baking Classes & Workshops',
    description: 'Live interactive masterclasses and recipe workshops hosted by home bakers.',
    allowedRoles: null
  },
  {
    path: '/reviews',
    title: 'Reviews & Seller Badges',
    description: 'Community ratings, verified customer feedback, and baker skill badges.',
    allowedRoles: null
  },

  // ── 4. Seller Specific Features ──
  {
    path: '/seller/analytics',
    title: 'Seller Sales Analytics',
    description: 'Revenue graphs, popular item breakdowns, and monthly storefront performance.',
    allowedRoles: ['seller', 'admin']
  },
  {
    path: '/seller/demand-forecasting',
    title: 'AI Demand Forecasting',
    description: 'Smart ingredient estimation and seasonal celebration demand projections.',
    allowedRoles: ['seller', 'admin']
  },

  // ── 5. Admin Specific Features ──
  {
    path: '/admin/analytics',
    title: 'Platform Sales Analytics',
    description: 'Comprehensive platform gross merchandise value and city-wide performance metrics.',
    allowedRoles: ['admin']
  },
  {
    path: '/admin/demand-forecasting',
    title: 'Platform Demand Forecasting',
    description: 'City-wide order volume predictions and festive rush planning tools.',
    allowedRoles: ['admin']
  }
];
