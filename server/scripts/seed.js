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
  console.log('🌱 Starting MeethaCart Milestone 3 Seeder (Karachi Dataset)...');
  console.log('🌱 =======================================================\n');

  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@meethacart.pk').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Password123!';
  const defaultPassword = 'Password123!';

  // 1. Clear previous collections
  await User.deleteMany({});
  await Category.deleteMany({});
  await Item.deleteMany({});
  await Order.deleteMany({});
  console.log('✓ Cleared database collections.');

  // 2. Create Single Admin User
  const admin = await User.create({
    name: 'Sindhu Jeswani',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isVerified: true,
    sellerStatus: 'approved',
    preferredLanguage: 'en',
    phone: '03001234500',
    address: 'Clifton Block 2, Karachi'
  });
  console.log(`✓ Admin created: ${admin.name} (${admin.email})`);

  // 3. Create 5 Karachi Sellers (3 Approved, 1 Pending, 1 Blocked)
  const sellerFatima = await User.create({
    name: 'Fatima Noor',
    email: 'fatima.bakes@meethacart.pk',
    password: defaultPassword,
    role: 'seller',
    bakeryName: "Fatima's Oven Art",
    bio: 'Artisan home baker specializing in customized Belgian chocolate ganache cakes, celebration tiers, and lotus dream jars.',
    phone: '03001234501',
    address: 'Clifton Block 4, Karachi',
    isVerified: true,
    sellerStatus: 'approved',
    preferredLanguage: 'en'
  });

  const sellerTariq = await User.create({
    name: 'Muhammad Tariq',
    email: 'tariq.mithai@meethacart.pk',
    password: defaultPassword,
    role: 'seller',
    bakeryName: 'Tariq Traditional Sweets & Mithai',
    bio: 'Generations-old family recipes for pure desi ghee gulab jamun, motichoor ladoo, khoya pistachio barfi, and saffron jalebi.',
    phone: '03001234502',
    address: 'Burns Road, Saddar, Karachi',
    isVerified: true,
    sellerStatus: 'approved',
    preferredLanguage: 'ur'
  });

  const sellerZainab = await User.create({
    name: 'Zainab Farooq',
    email: 'zainab.pastry@meethacart.pk',
    password: defaultPassword,
    role: 'seller',
    bakeryName: 'The Pastry Studio Karachi',
    bio: 'French-trained home pastry chef baking flaky golden almond croissants, fruit tarts, tiramisu cupcakes, and dark fudge brownies.',
    phone: '03001234503',
    address: 'Gulshan-e-Iqbal Block 13-D, Karachi',
    isVerified: true,
    sellerStatus: 'approved',
    preferredLanguage: 'en'
  });

  const sellerBilal = await User.create({
    name: 'Bilal Siddiqui',
    email: 'bilal.breads@meethacart.pk',
    password: defaultPassword,
    role: 'seller',
    bakeryName: 'Crust & Crumb Artisan Bakes',
    bio: 'Naturally fermented wild sourdough boules, butter brioche loaves, and rosemary focaccia baked fresh on demand.',
    phone: '03001234504',
    address: 'DHA Phase 6, Karachi',
    isVerified: true,
    sellerStatus: 'pending',
    preferredLanguage: 'en'
  });

  const sellerHamza = await User.create({
    name: 'Hamza Raza',
    email: 'hamza.bakes@meethacart.pk',
    password: defaultPassword,
    role: 'seller',
    bakeryName: 'Karachi Sugar Crafters',
    bio: 'Decorated sugar cookies and cartoon character fondant cakes for children birthday celebrations.',
    phone: '03001234505',
    address: 'Bahadurabad, Karachi',
    isVerified: true,
    sellerStatus: 'blocked',
    preferredLanguage: 'ur'
  });

  console.log('✓ Created 5 Karachi sellers (3 Approved, 1 Pending, 1 Blocked)');

  // 4. Create 5 Karachi Buyers
  const buyersData = [
    {
      name: 'Sara Ahmed',
      email: 'sara.ahmed@meethacart.pk',
      phone: '03001234511',
      address: 'House 42, PECHS Block 2, Karachi',
      preferredLanguage: 'en'
    },
    {
      name: 'Omer Farooq',
      email: 'omer.farooq@meethacart.pk',
      phone: '03001234512',
      address: 'Flat 3B, North Nazimabad Block H, Karachi',
      preferredLanguage: 'ur'
    },
    {
      name: 'Hira Mani',
      email: 'hira.mani@meethacart.pk',
      phone: '03001234513',
      address: 'Bungalow 12, Clifton Block 8, Karachi',
      preferredLanguage: 'en'
    },
    {
      name: 'Usman Qureshi',
      email: 'usman.qureshi@meethacart.pk',
      phone: '03001234514',
      address: 'Plot 7, Bahadurabad Main Roundabout, Karachi',
      preferredLanguage: 'ur'
    },
    {
      name: 'Mahnoor Baloch',
      email: 'mahnoor.baloch@meethacart.pk',
      phone: '03001234515',
      address: 'Falcon Complex, Malir Cantt, Karachi',
      preferredLanguage: 'en'
    }
  ];

  for (const b of buyersData) {
    await User.create({
      ...b,
      password: defaultPassword,
      role: 'buyer',
      isVerified: true,
      sellerStatus: 'approved'
    });
  }
  console.log('✓ Created 5 realistic Karachi buyers');

  // 5. Create 7 Bakery Categories
  const categoriesData = [
    {
      name: 'Custom Cakes',
      description: 'Handcrafted celebration cakes, bespoke wedding tiers, and customized anniversary bakes.',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      isActive: true
    },
    {
      name: 'Traditional Mithai',
      description: 'Pure desi ghee sweets, slow-cooked khoya barfi, motichoor ladoos, and warm gulab jamuns.',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop',
      isActive: true
    },
    {
      name: 'Pastries & Cupcakes',
      description: 'Delicate cream pastries, French fruit tarts, chocolate mousse cups, and frosted cupcakes.',
      image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&auto=format&fit=crop',
      isActive: true
    },
    {
      name: 'Cookies & Biscuits',
      description: 'Traditional Lahori nan khatai, Belgian chocolate chunk cookies, and pistachio shortbread.',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop',
      isActive: true
    },
    {
      name: 'Artisanal Breads & Buns',
      description: 'Naturally fermented wild sourdough, French butter brioche, and fragrant rosemary focaccia.',
      image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop',
      isActive: true
    },
    {
      name: 'Brownies & Desserts',
      description: 'Fudgy triple chocolate brownies, lotus biscoff dream jars, and salted caramel pots.',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop',
      isActive: true
    },
    {
      name: 'Savory Bakes & Patties',
      description: 'Flaky bakery chicken patties, spiced vegetable turnovers, and mini quiches.',
      image: 'https://images.unsplash.com/photo-1621236378699-8597faf6a173?w=600&auto=format&fit=crop',
      isActive: true
    }
  ];

  const createdCategories = {};
  for (const cat of categoriesData) {
    const c = await Category.create(cat);
    createdCategories[c.name] = c;
  }
  console.log(`✓ Created ${Object.keys(createdCategories).length} Bakery Categories`);

  // 6. Create 24 Realistic Bakery Items with PKR Prices & Images
  const sampleItems = [
    // ── Category: Custom Cakes (Fatima) ──
    {
      title: 'Belgian Dark Chocolate Fudge Cake (2 Lbs)',
      description: 'Rich three-layer sponge filled with 70% Belgian chocolate ganache, draped in silky cocoa glaze.',
      seller: sellerFatima._id,
      category: createdCategories['Custom Cakes']._id,
      price: 2800,
      stock: 8,
      preparationTimeHours: 12,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop']
    },
    {
      title: 'Lotus Biscoff Salted Caramel Drip Cake (2.5 Lbs)',
      description: 'Fluffy brown sugar sponge layered with crunchy Biscoff buttercream, salted caramel drip, and caramelized biscuits.',
      seller: sellerFatima._id,
      category: createdCategories['Custom Cakes']._id,
      price: 3400,
      stock: 6,
      preparationTimeHours: 16,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop']
    },
    {
      title: 'Classic Red Velvet Cream Cheese Cake (2 Lbs)',
      description: 'Vibrant crimson buttermilk sponge with subtle cocoa undertones, frosted with velvety cream cheese frosting.',
      seller: sellerFatima._id,
      category: createdCategories['Custom Cakes']._id,
      price: 2600,
      stock: 7,
      preparationTimeHours: 10,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop']
    },
    {
      title: 'Royal Pistachio & Saffron Milk Cake (1.5 Lbs)',
      description: 'Cardamom infused eggless sponge soaked in evaporated saffron-pistachio milk (Tres Leches style).',
      seller: sellerFatima._id,
      category: createdCategories['Custom Cakes']._id,
      price: 2200,
      stock: 10,
      preparationTimeHours: 8,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop']
    },

    // ── Category: Traditional Mithai (Tariq) ──
    {
      title: 'Desi Ghee Gulab Jamun (1 Kg Heritage Box)',
      description: 'Warm, melt-in-mouth milk solid dumplings fried in pure desi ghee and soaked in cardamom syrup.',
      seller: sellerTariq._id,
      category: createdCategories['Traditional Mithai']._id,
      price: 1450,
      stock: 25,
      preparationTimeHours: 4,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop']
    },
    {
      title: 'Shahi Khoya & Pistachio Barfi (1 Kg)',
      description: 'Slow-cooked condensed buffalo milk fudge topped with edible silver leaf and roasted Iranian pistachios.',
      seller: sellerTariq._id,
      category: createdCategories['Traditional Mithai']._id,
      price: 1850,
      stock: 20,
      preparationTimeHours: 6,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop']
    },
    {
      title: 'Crispy Saffron Jalebi (1 Kg Box)',
      description: 'Thin crispy golden swirls made from naturally fermented batter and infused with Kashmir saffron sugar syrup.',
      seller: sellerTariq._id,
      category: createdCategories['Traditional Mithai']._id,
      price: 950,
      stock: 30,
      preparationTimeHours: 2,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop']
    },
    {
      title: 'Motichoor Ladoo (Pure Desi Ghee 1 Kg)',
      description: 'Tiny gram-flour pearls fried in pure desi ghee, steeped in aromatic cardamom syrup and slivered almonds.',
      seller: sellerTariq._id,
      category: createdCategories['Traditional Mithai']._id,
      price: 1350,
      stock: 18,
      preparationTimeHours: 5,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop']
    },

    // ── Category: Pastries & Cupcakes (Zainab) ──
    {
      title: 'Classic Tiramisu Cupcakes (Box of 6)',
      description: 'Espresso-soaked sponge topped with mascarpone swirl and dusted with French Valrhona cocoa.',
      seller: sellerZainab._id,
      category: createdCategories['Pastries & Cupcakes']._id,
      price: 1200,
      stock: 14,
      preparationTimeHours: 6,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&auto=format&fit=crop']
    },
    {
      title: 'French Butter Croissants (Pack of 4)',
      description: 'Hand-laminated croissants baked fresh each morning using 82% European cultured butter.',
      seller: sellerZainab._id,
      category: createdCategories['Pastries & Cupcakes']._id,
      price: 1100,
      stock: 16,
      preparationTimeHours: 8,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop']
    },
    {
      title: 'Lemon Meringue Tartlets (Pack of 4)',
      description: 'Crisp sweet pastry shells filled with zesty lemon curd and topped with toasted Swiss meringue.',
      seller: sellerZainab._id,
      category: createdCategories['Pastries & Cupcakes']._id,
      price: 1050,
      stock: 12,
      preparationTimeHours: 6,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop']
    },
    {
      title: 'Belgian Chocolate Eclairs (Box of 4)',
      description: 'Crispy choux pastry tubes filled with vanilla diplomat cream and dipped in glossy chocolate fondant.',
      seller: sellerZainab._id,
      category: createdCategories['Pastries & Cupcakes']._id,
      price: 980,
      stock: 15,
      preparationTimeHours: 4,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop']
    },

    // ── Category: Cookies & Biscuits (Tariq & Fatima) ──
    {
      title: 'Traditional Lahori Almond Nan Khatai (Box of 12)',
      description: 'Crumbly cardamom shortbread cookies enriched with roasted chickpea flour and crowned with almonds.',
      seller: sellerTariq._id,
      category: createdCategories['Cookies & Biscuits']._id,
      price: 850,
      stock: 35,
      preparationTimeHours: 4,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop']
    },
    {
      title: 'Chunky Belgian Dark Chocolate Cookies (Pack of 6)',
      description: 'Gooey centers packed with Callebaut chocolate chunks and sprinkled with Maldon flaky sea salt.',
      seller: sellerFatima._id,
      category: createdCategories['Cookies & Biscuits']._id,
      price: 750,
      stock: 24,
      preparationTimeHours: 3,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop']
    },
    {
      title: 'Pistachio Butter Shortbread (Tin of 16)',
      description: 'Melt-in-mouth Scottish shortbread infused with crushed green cardamom and roasted pistachios.',
      seller: sellerTariq._id,
      category: createdCategories['Cookies & Biscuits']._id,
      price: 1150,
      stock: 15,
      preparationTimeHours: 5,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop']
    },
    {
      title: 'Red Velvet Crinkle Cookies with Cream Cheese (8 Pcs)',
      description: 'Soft-baked red cocoa cookies rolled in powdered sugar and sandwiched with cream cheese.',
      seller: sellerFatima._id,
      category: createdCategories['Cookies & Biscuits']._id,
      price: 820,
      stock: 20,
      preparationTimeHours: 4,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1618923850107-d1a234d7a73a?w=600&auto=format&fit=crop']
    },

    // ── Category: Artisanal Breads & Buns (Fatima & Zainab) ──
    {
      title: 'Rustic Country Sourdough Loaf (800g)',
      description: '36-hour slow-fermented wild yeast artisan bread with a blistery crust and open, chewy crumb.',
      seller: sellerFatima._id,
      category: createdCategories['Artisanal Breads & Buns']._id,
      price: 680,
      stock: 10,
      preparationTimeHours: 36,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop']
    },
    {
      title: 'French Butter Brioche Loaf (600g)',
      description: 'Golden, feather-light enriched bread made with 82% European butter and farm-fresh eggs.',
      seller: sellerZainab._id,
      category: createdCategories['Artisanal Breads & Buns']._id,
      price: 780,
      stock: 8,
      preparationTimeHours: 12,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop']
    },
    {
      title: 'Garlic & Rosemary Sea Salt Focaccia',
      description: 'Italian sheet bread generously dimpled with extra virgin olive oil, fresh rosemary, and flaky sea salt.',
      seller: sellerFatima._id,
      category: createdCategories['Artisanal Breads & Buns']._id,
      price: 580,
      stock: 12,
      preparationTimeHours: 8,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop']
    },

    // ── Category: Brownies & Desserts (Fatima & Zainab) ──
    {
      title: 'Salted Caramel Fudge Brownie Bites (Box of 9)',
      description: 'Chewy dark chocolate brownies drizzled with homemade salted caramel and fleur de sel.',
      seller: sellerFatima._id,
      category: createdCategories['Brownies & Desserts']._id,
      price: 980,
      stock: 22,
      preparationTimeHours: 4,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop']
    },
    {
      title: 'Lotus Biscoff Cheesecake Dream Jar (Set of 2)',
      description: 'Individual glass jars layered with buttery biscuit crumb, smooth cream cheese mousse, and melted Lotus spread.',
      seller: sellerZainab._id,
      category: createdCategories['Brownies & Desserts']._id,
      price: 1100,
      stock: 14,
      preparationTimeHours: 5,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop']
    },
    {
      title: 'Nutella Stuffed Deep Dish Cookie Pie',
      description: 'Warm skillet-style chocolate chip cookie pie filled with a molten pocket of hazelnut Nutella.',
      seller: sellerFatima._id,
      category: createdCategories['Brownies & Desserts']._id,
      price: 1300,
      stock: 9,
      preparationTimeHours: 6,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop']
    },

    // ── Category: Savory Bakes & Patties (Zainab) ──
    {
      title: 'Traditional Karachi Bakery Chicken Patties (Box of 6)',
      description: 'Flaky puff pastry stuffed with shredded chicken, black pepper, and creamy savory white sauce.',
      seller: sellerZainab._id,
      category: createdCategories['Savory Bakes & Patties']._id,
      price: 750,
      stock: 25,
      preparationTimeHours: 3,
      isEggless: false,
      images: ['https://images.unsplash.com/photo-1621236378699-8597faf6a173?w=600&auto=format&fit=crop']
    },
    {
      title: 'Spinach & Feta Mediterranean Pastry Turnovers (Pack of 4)',
      description: 'Golden puff parcels filled with sautéed baby spinach, Greek feta cheese, and toasted pine nuts.',
      seller: sellerZainab._id,
      category: createdCategories['Savory Bakes & Patties']._id,
      price: 850,
      stock: 16,
      preparationTimeHours: 4,
      isEggless: true,
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop']
    }
  ];

  await Item.insertMany(sampleItems);
  console.log(`✓ Seeded ${sampleItems.length} Realistic Karachi Bakery Items.`);

  console.log('\n🎉 =======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('🎉 Admin: Sindhu Jeswani (admin@meethacart.pk / Password123!)');
  console.log('🎉 5 Sellers (Fatima, Tariq, Zainab, Bilal [Pending], Hamza [Blocked])');
  console.log('🎉 5 Buyers (Sara, Omer, Hira, Usman, Mahnoor)');
  console.log(`🎉 ${Object.keys(createdCategories).length} Categories | ${sampleItems.length} Bakery Items`);
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
