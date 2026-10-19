/**
 * Configuration registry for under-construction features.
 * When a feature is implemented, simply remove it from this list
 * and register its real component in App.jsx.
 */

export const UNDER_BAKING_ROUTES = [
  // ── 1. Commerce & Orders ──
  {
    path: '/cart',
    title: 'Shopping Cart',
    titleUrdu: 'خریداری کی ٹوکری',
    description: 'Save and review your selected cakes and bakery treats before checkout.',
    descUrdu: 'چیک آؤٹ سے قبل اپنی منتخب کردہ بیکری اشیاء کا جائزہ لیں۔',
    allowedRoles: null // public / all
  },
  {
    path: '/wishlist',
    title: 'Wishlist & Saved Items',
    titleUrdu: 'پسندیدہ اشیاء',
    description: 'Keep track of your favorite bakeries and treats you want to order later.',
    descUrdu: 'اپنی پسندیدہ بیکری اشیاء کو بعد میں آرڈر کرنے کے لیے محفوظ رکھیں۔',
    allowedRoles: null
  },
  {
    path: '/checkout',
    title: 'Secure Checkout',
    titleUrdu: 'ادائیگی کا محفوظ عمل',
    description: 'Direct order placement with delivery scheduling and payment methods.',
    descUrdu: 'ڈیلیوری وقت کے تعین اور ادائیگی کے محفوظ طریقے کے ساتھ آرڈر مکمل کریں۔',
    allowedRoles: ['buyer', 'seller', 'admin']
  },
  {
    path: '/orders',
    title: 'Orders & Order Tracking',
    titleUrdu: 'آرڈرز اور ٹریکنگ',
    description: 'Track ongoing bakery orders, delivery status, and your full order history.',
    descUrdu: 'اپنے جاری آرڈرز، ڈیلیوری کی صورتحال اور آرڈرز کی تاریخ دیکھیں۔',
    allowedRoles: ['buyer', 'seller', 'admin']
  },
  {
    path: '/wallet',
    title: 'Wallet & Payments',
    titleUrdu: 'والٹ اور ادائیگیاں',
    description: 'Manage store credits, payment methods, and instant refunds.',
    descUrdu: 'اسٹور بیلنس، ادائیگی کے طریقے اور فوری ریفنڈز کا انتظام کریں۔',
    allowedRoles: ['buyer', 'seller', 'admin']
  },

  // ── 2. Communication & Requests ──
  {
    path: '/notifications',
    title: 'Notifications & Alerts',
    titleUrdu: 'اطلاعات اور پیغامات',
    description: 'Real-time updates on orders, custom bake status, and baker messages.',
    descUrdu: 'آرڈرز کی صورتحال اور بیکرز کے پیغامات کی فوری اطلاعات۔',
    allowedRoles: null
  },
  {
    path: '/custom-requests',
    title: 'Custom Requests & Bidding',
    titleUrdu: 'خصوصی کیک آرڈرز اور بولیاں',
    description: 'Post custom event requests, specify flavors and budget, and get bids from bakers.',
    descUrdu: 'اپنے من پسند ڈیزائن اور وزن کے کیک کی فرمائش پوسٹ کریں اور بیکرز سے آفرز حاصل کریں۔',
    allowedRoles: null
  },
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
