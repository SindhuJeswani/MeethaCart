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
    titleUrdu: 'پسندیدہ اشیاء',
    description: 'Keep track of your favorite bakeries and treats you want to order later.',
    descUrdu: 'اپنی پسندیدہ بیکری اشیاء کو بعد میں آرڈر کرنے کے لیے محفوظ رکھیں۔',
    allowedRoles: null
  },

  // ── 2. Communication & Requests ──
  {
    path: '/messages',
    title: 'Baker Chat & Messages',
    titleUrdu: 'بیکر سے بات چیت اور پیغامات',
    description: 'Chat directly with home bakers regarding customizations, delivery time, and ingredients.',
    descUrdu: 'بیکرز سے کیک کی تیاری، اجزاء اور ڈیلیوری کے وقت پر براہ راست بات چیت کریں۔',
    allowedRoles: ['buyer', 'seller', 'admin']
  },

  // ── 3. Community & Education ──
  {
    path: '/classes',
    title: 'Baking Classes & Workshops',
    titleUrdu: 'بیکنگ کلاسز اور ورکشاپس',
    description: 'Live interactive masterclasses and recipe workshops hosted by home bakers.',
    descUrdu: 'ماہر ہوم بیکرز سے بیکنگ کے طریقے سیکھیں اور کلاسز بک کریں۔',
    allowedRoles: null
  },
  {
    path: '/reviews',
    title: 'Reviews & Seller Badges',
    titleUrdu: 'کسٹمر ریویوز اور بیکر بیجز',
    description: 'Community ratings, verified customer feedback, and baker skill badges.',
    descUrdu: 'خریداروں کی آراء، ریٹنگز اور مستند بیکر بیجز کا نظام۔',
    allowedRoles: null
  },

  // ── 4. Seller Specific Features ──
  {
    path: '/seller/analytics',
    title: 'Seller Sales Analytics',
    titleUrdu: 'سیلز اینالیٹکس',
    description: 'Revenue graphs, popular item breakdowns, and monthly storefront performance.',
    descUrdu: 'اپنی بیکری کی فروخت، مقبول ترین اشیاء اور ماہانہ آمدنی کا جائزہ لیں۔',
    allowedRoles: ['seller', 'admin']
  },
  {
    path: '/seller/demand-forecasting',
    title: 'AI Demand Forecasting',
    titleUrdu: 'ڈیمانڈ تخمینہ (AI)',
    description: 'Smart ingredient estimation and seasonal celebration demand projections.',
    descUrdu: 'تہواروں اور خاص ایونٹس کے لیے آرڈرز اور اجزاء کی ضرورت کا پیشگی تخمینہ۔',
    allowedRoles: ['seller', 'admin']
  },

  // ── 5. Admin Specific Features ──
  {
    path: '/admin/analytics',
    title: 'Platform Sales Analytics',
    titleUrdu: 'پلیٹ فارم سیلز اینالیٹکس',
    description: 'Comprehensive platform gross merchandise value and city-wide performance metrics.',
    descUrdu: 'پورے پلیٹ فارم کی مجموعی سیلز اور شہروں کے لحاظ سے کارکردگی۔',
    allowedRoles: ['admin']
  },
  {
    path: '/admin/demand-forecasting',
    title: 'Platform Demand Forecasting',
    titleUrdu: 'پلیٹ فارم ڈیمانڈ فورکاسٹنگ',
    description: 'City-wide order volume predictions and festive rush planning tools.',
    descUrdu: 'شہر کے لحاظ سے مجموعی آرڈرز کا تخمینہ اور تیاری۔',
    allowedRoles: ['admin']
  }
];
