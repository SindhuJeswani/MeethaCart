import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';
import { Order } from '../models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const seedDatabase = async () => {
  console.log('\n🌱 =======================================================');
  console.log('🌱 Starting MeethaCart Database Seeding...');
  console.log('🌱 =======================================================\n');

  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in server/.env');
  }

  // 1. Clear existing non-admin users, remove any old/stale admins, and clear related collections
  await User.deleteMany({
    $or: [
      { email: 'admin@meethacart.com' },
      { role: 'admin', email: { $ne: adminEmail } },
      { role: { $ne: 'admin' } }
    ]
  });
  await Category.deleteMany({});
  await Item.deleteMany({});
  await Order.deleteMany({});
  console.log('✓ Cleared non-admin collections and removed old/stale admin accounts.');

  // 2. Upsert the single dedicated Admin
  let admin = await User.findOne({ email: adminEmail });
  if (admin) {
    admin.name = 'Sindhu Jeswani';
    admin.password = adminPassword; // Triggers pre-save bcrypt hash
    admin.role = 'admin';
    admin.isVerified = true;
    admin.sellerStatus = 'approved';
    admin.preferredLanguage = 'en';
    await admin.save();
    console.log('✓ Updated existing Admin account.');
  } else {
    admin = await User.create({
      name: 'Sindhu Jeswani',
      email: adminEmail,
      password: adminPassword, // Triggers pre-save bcrypt hash
      role: 'admin',
      isVerified: true,
      sellerStatus: 'approved',
      preferredLanguage: 'en',
      phone: '03000000001'
    });
    console.log('✓ Created dedicated Admin account.');
  }

  // Verify exactly one admin exists in the database
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount !== 1) {
    throw new Error(`Integrity check failed: Expected exactly 1 admin, found ${adminCount}`);
  }
  console.log(`✓ Admin integrity confirmed: Exactly ${adminCount} admin user exists.`);

  // 3. Create 3 Sellers (2 Approved, 1 Pending)
  const sellerAyesha = await User.create({
    name: 'Ayesha Khan',
    email: 'ayesha.baker@meethacart.com',
    password: 'Password123!',
    role: 'seller',
    bakeryName: "Ayesha's Sweet Delights",
    bio: 'Specializing in customized Belgian chocolate cakes, wedding tier cakes, and gourmet brownies.',
    phone: '03001234561',
    address: 'DHA Phase 5, Lahore',
    isVerified: true,
    sellerStatus: 'approved',
    preferredLanguage: 'en'
  });

  const sellerTariq = await User.create({
    name: 'Tariq Mehmood',
    email: 'tariq.mithai@meethacart.com',
    password: 'Password123!',
    role: 'seller',
    bakeryName: 'Tariq Traditional Sweets & Mithai',
    bio: 'Authentic 3rd-generation traditional Pakistani mithai made with pure desi ghee and fresh khoya.',
    phone: '03001234562',
    address: 'Anarkali Bazaar, Lahore',
    isVerified: true,
    sellerStatus: 'approved',
    preferredLanguage: 'ur'
  });

  const sellerZainab = await User.create({
    name: 'Zainab Fatima',
    email: 'zainab.oven@meethacart.com',
    password: 'Password123!',
    role: 'seller',
    bakeryName: "Zainab's Artisanal Oven",
    bio: 'Passionate home baker crafting organic sourdough loaves, French brioche, and butter croissants.',
    phone: '03001234563',
    address: 'Gulberg III, Lahore',
    isVerified: true,
    sellerStatus: 'pending', // PENDING SELLER FOR ADMIN APPROVAL TESTING
    preferredLanguage: 'en'
  });
  console.log('✓ Seeded 3 Sellers:');
  console.log('  - Ayesha Khan (Approved)');
  console.log('  - Tariq Mehmood (Approved)');
  console.log('  - Zainab Fatima (PENDING - Ready for M2 admin approval test)');

  // 4. Create 3 Buyers
  const buyerHamza = await User.create({
    name: 'Hamza Tariq',
    email: 'hamza.buyer@meethacart.com',
    password: 'Password123!',
    role: 'buyer',
    phone: '03211112233',
    address: 'F-7/2, Islamabad',
    isVerified: true,
    preferredLanguage: 'en'
  });

  const buyerSara = await User.create({
    name: 'Sara Ahmed',
    email: 'sara.buyer@meethacart.com',
    password: 'Password123!',
    role: 'buyer',
    phone: '03214445566',
    address: 'Clifton Block 4, Karachi',
    isVerified: true,
    preferredLanguage: 'ur'
  });

  const buyerBilal = await User.create({
    name: 'Bilal Raza',
    email: 'bilal.buyer@meethacart.com',
    password: 'Password123!',
    role: 'buyer',
    phone: '03217778899',
    address: 'Model Town, Lahore',
    isVerified: true,
    preferredLanguage: 'en'
  });
  console.log('✓ Seeded 3 Buyers (Hamza, Sara, Bilal).');

  // 5. Create 5 Categories
  const catCakes = await Category.create({
    name: 'Custom Cakes',
    slug: 'custom-cakes',
    description: 'Customized fondant, buttercream, and multi-tier celebratory cakes.'
  });

  const catMithai = await Category.create({
    name: 'Traditional Mithai',
    slug: 'traditional-mithai',
    description: 'Authentic Pakistani sweets crafted with pure desi ghee and dry fruits.'
  });

  const catBreads = await Category.create({
    name: 'Artisanal Breads',
    slug: 'artisanal-breads',
    description: 'Naturally fermented sourdough, French baguettes, and soft brioche.'
  });

  const catCookies = await Category.create({
    name: 'Cookies & Biscuits',
    slug: 'cookies-biscuits',
    description: 'Traditional Lahori nan khatai, chunky chocolate cookies, and shortbreads.'
  });

  const catPastries = await Category.create({
    name: 'Pastries & Cupcakes',
    slug: 'pastries-cupcakes',
    description: 'Gourmet dessert cups, cream puffs, fruit tarts, and frosted cupcakes.'
  });
  console.log('✓ Seeded 5 Bakery Categories.');

  // 6. Create 20 Bakery Items
  const sampleItems = [
    // Cakes (Ayesha)
    {
      title: 'Belgian Dark Chocolate Fudge Cake (2 Lbs)',
      description: 'Rich, moist layers of Belgian chocolate sponge smothered with velvety chocolate ganache.',
      seller: sellerAyesha._id,
      category: catCakes._id,
      price: 2800,
      stock: 5,
      preparationTimeHours: 12,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop']
    },
    {
      title: 'Red Velvet Cream Cheese Tier Cake (3 Lbs)',
      description: 'Classic crimson cocoa layers with silky cream cheese frosting and white chocolate pearls.',
      seller: sellerAyesha._id,
      category: catCakes._id,
      price: 3800,
      stock: 3,
      preparationTimeHours: 24,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop']
    },
    {
      title: 'Lotus Biscoff Caramel Drip Cake (2 Lbs)',
      description: 'Spiced Biscoff cookie crumb base layered with caramelized sponge and luscious Biscoff spread.',
      seller: sellerAyesha._id,
      category: catCakes._id,
      price: 3200,
      stock: 4,
      preparationTimeHours: 18,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop']
    },
    {
      title: 'Fresh Mango Gateau (Seasonal 2.5 Lbs)',
      description: 'Light vanilla chiffon infused with Chaunsa mango mousse and crowned with fresh diced mangoes.',
      seller: sellerAyesha._id,
      category: catCakes._id,
      price: 3000,
      stock: 6,
      preparationTimeHours: 12,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop']
    },

    // Mithai (Tariq)
    {
      title: 'Desi Ghee Gulab Jamun (1 Kg Gift Tin)',
      description: 'Warm, melt-in-mouth milk-solid dumplings soaked in cardamom and saffron infused sugar syrup.',
      seller: sellerTariq._id,
      category: catMithai._id,
      price: 1400,
      stock: 20,
      preparationTimeHours: 4,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop']
    },
    {
      title: 'Shahi Khoya & Pistachio Barfi (1 Kg)',
      description: 'Traditional slow-cooked condensed milk fudge generously topped with silver leaf and roasted pistachios.',
      seller: sellerTariq._id,
      category: catMithai._id,
      price: 1800,
      stock: 15,
      preparationTimeHours: 6,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop']
    },
    {
      title: 'Crispy Saffron Jalebi (1 Kg Box)',
      description: 'Crispy golden spirals prepared with fermented batter, dipped in pure saffron syrup.',
      seller: sellerTariq._id,
      category: catMithai._id,
      price: 950,
      stock: 25,
      preparationTimeHours: 2,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop']
    },
    {
      title: 'Motichoor Ladoo (Pure Desi Ghee 1 Kg)',
      description: 'Fine gram flour pearls fried in desi ghee, steeped in aromatic cardamom syrup and garnished with almonds.',
      seller: sellerTariq._id,
      category: catMithai._id,
      price: 1300,
      stock: 18,
      preparationTimeHours: 5,
      isEggless: true,
      images: ['/uploads/motichoor-ladoo.png']
    },

    // Breads (Ayesha & Tariq)
    {
      title: 'Rustic Country Sourdough Loaf (800g)',
      description: 'Wild yeast naturally fermented for 36 hours. Blistery crunchy crust with an airy, tangy crumb.',
      seller: sellerAyesha._id,
      category: catBreads._id,
      price: 650,
      stock: 10,
      preparationTimeHours: 36,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop']
    },
    {
      title: 'French Butter Brioche Loaf (600g)',
      description: 'Golden, feather-light enriched bread made with 82% European butter and farm-fresh eggs.',
      seller: sellerAyesha._id,
      category: catBreads._id,
      price: 750,
      stock: 8,
      preparationTimeHours: 12,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop']
    },
    {
      title: 'Garlic & Rosemary Sea Salt Focaccia',
      description: 'Italian sheet bread dimpled with extra virgin olive oil, fresh rosemary needles, and flaky Maldon salt.',
      seller: sellerAyesha._id,
      category: catBreads._id,
      price: 550,
      stock: 12,
      preparationTimeHours: 8,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop']
    },
    {
      title: 'Multigrain Flax & Chia Health Bread (750g)',
      description: 'Wholesome whole wheat loaf packed with toasted sunflower seeds, chia, and roasted flaxseeds.',
      seller: sellerAyesha._id,
      category: catBreads._id,
      price: 480,
      stock: 15,
      preparationTimeHours: 10,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop']
    },

    // Cookies & Biscuits
    {
      title: 'Traditional Lahori Almond Nan Khatai (Box of 12)',
      description: 'Legendary crumbly shortbread biscuits enriched with cardamom, roasted chickpea flour, and whole almonds.',
      seller: sellerTariq._id,
      category: catCookies._id,
      price: 850,
      stock: 30,
      preparationTimeHours: 6,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop']
    },
    {
      title: 'Chunky Belgian Chocolate Chip Cookies (Pack of 6)',
      description: 'Crispy edges with gooey, melted chocolate centers made with Callebaut 54% dark chocolate chunks.',
      seller: sellerAyesha._id,
      category: catCookies._id,
      price: 720,
      stock: 25,
      preparationTimeHours: 4,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop']
    },
    {
      title: 'Pistachio Cardamom Butter Shortbread (Tin of 16)',
      description: 'Scottish style pure butter shortbread scented with freshly crushed green cardamom and Iranian pistachios.',
      seller: sellerTariq._id,
      category: catCookies._id,
      price: 1100,
      stock: 16,
      preparationTimeHours: 6,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop']
    },
    {
      title: 'Red Velvet Crinkle Cookies with Cream Filling (8 Pcs)',
      description: 'Soft-baked red cocoa cookies rolled in powdered sugar and sandwiched with cream cheese.',
      seller: sellerAyesha._id,
      category: catCookies._id,
      price: 800,
      stock: 14,
      preparationTimeHours: 6,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1618923850107-d1a234d7a73a?w=600&auto=format&fit=crop']
    },

    // Pastries & Cupcakes
    {
      title: 'Classic Tiramisu Cupcakes (Box of 6)',
      description: 'Espresso-soaked sponge topped with mascarpone swirl and dusted with French Valrhona cocoa.',
      seller: sellerAyesha._id,
      category: catPastries._id,
      price: 1200,
      stock: 12,
      preparationTimeHours: 8,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&auto=format&fit=crop']
    },
    {
      title: 'Salted Caramel Fudge Brownie Bites (Box of 9)',
      description: 'Dense, chewy dark chocolate brownies drizzled with homemade salted caramel and Maldon salt.',
      seller: sellerAyesha._id,
      category: catPastries._id,
      price: 950,
      stock: 20,
      preparationTimeHours: 4,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop']
    },
    {
      title: 'Lemon Meringue Butter Tartlets (Pack of 4)',
      description: 'Crisp butter pastry shells filled with tangy lemon curd and topped with toasted Swiss meringue.',
      seller: sellerAyesha._id,
      category: catPastries._id,
      price: 1100,
      stock: 10,
      preparationTimeHours: 8,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop']
    },
    {
      title: 'Flaky Golden Almond Croissants (Pack of 4)',
      description: 'Twice-baked laminated French pastry filled with rich almond frangipane and coated with toasted sliced almonds.',
      seller: sellerAyesha._id,
      category: catPastries._id,
      price: 1350,
      stock: 8,
      preparationTimeHours: 14,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop']
    }
  ];

  await Item.insertMany(sampleItems);
  console.log(`✓ Seeded ${sampleItems.length} Sample Bakery Items.`);

  console.log('\n🎉 =======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('🎉 Database initialized with single verified admin and sample catalog.');
  console.log('🎉 =======================================================\n');
};

// Auto-run if executed directly via node scripts/seed.js
if (process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
