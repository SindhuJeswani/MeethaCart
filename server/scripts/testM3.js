import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';

dotenv.config();

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'meethacart_jwt_secret',
    { expiresIn: '1h' }
  );
};

const runM3Tests = async () => {
  console.log('\n🧪 ==============================================================');
  console.log('🧪 Starting MeethaCart M3 (Bakery Catalog & Items) Test Suite');
  console.log('🧪 ==============================================================\n');

  await connectDB();

  const baseUrl = 'http://localhost:5000/api';

  // Load test actors from seeded database
  const approvedSellerAyesha = await User.findOne({ email: 'ayesha.baker@meethacart.com' });
  const approvedSellerTariq = await User.findOne({ email: 'tariq.mithai@meethacart.com' });
  const pendingSellerZainab = await User.findOne({ email: 'zainab.oven@meethacart.com' });
  const cakeCategory = await Category.findOne({ slug: 'custom-cakes' });

  const ayeshaToken = signToken(approvedSellerAyesha);
  const tariqToken = signToken(approvedSellerTariq);
  const zainabToken = signToken(pendingSellerZainab);

  try {
    // -------------------------------------------------------------
    // Test 1: Public Catalog, Live Search & Multi-Criteria Filters
    // -------------------------------------------------------------
    console.log('[TEST 1] Testing Public Marketplace Catalog & Multi-Filters...');

    // 1.1 All Items
    const allRes = await fetch(`${baseUrl}/items`);
    const allData = await allRes.json();
    if (allRes.status !== 200 || allData.items.length === 0) {
      throw new Error('Failed to fetch public catalog items!');
    }
    console.log(`✓ Passed: Catalog returns ${allData.items.length} active bakery listings`);

    // 1.2 Keyword Search ("Chocolate")
    const searchRes = await fetch(`${baseUrl}/items?search=Chocolate`);
    const searchData = await searchRes.json();
    if (searchData.items.length === 0) {
      throw new Error('Search for "Chocolate" returned 0 results!');
    }
    const allContainKeyword = searchData.items.every(
      (it) =>
        it.title.toLowerCase().includes('chocolate') ||
        it.description.toLowerCase().includes('chocolate')
    );
    if (!allContainKeyword) {
      throw new Error('Search returned items that do not contain keyword!');
    }
    console.log(`✓ Passed: Keyword search for 'Chocolate' returned ${searchData.items.length} matching items`);

    // 1.3 Category Filter ("traditional-mithai")
    const mithaiRes = await fetch(`${baseUrl}/items?category=traditional-mithai`);
    const mithaiData = await mithaiRes.json();
    if (mithaiData.items.length === 0) {
      throw new Error('Category filter for traditional-mithai returned 0 results!');
    }
    console.log(`✓ Passed: Category filter for 'traditional-mithai' returned ${mithaiData.items.length} items`);

    // 1.4 Price Range Filter (1000 <= price <= 2000)
    const priceRes = await fetch(`${baseUrl}/items?minPrice=1000&maxPrice=2000`);
    const priceData = await priceRes.json();
    const allWithinPrice = priceData.items.every((it) => it.price >= 1000 && it.price <= 2000);
    if (!allWithinPrice || priceData.items.length === 0) {
      throw new Error('Price range filter failed!');
    }
    console.log(`✓ Passed: Price range filter (PKR 1000 - 2000) returned ${priceData.items.length} items in exact range`);

    // 1.5 Dietary Filter (isEggless = true)
    const egglessRes = await fetch(`${baseUrl}/items?isEggless=true`);
    const egglessData = await egglessRes.json();
    const allEggless = egglessData.items.every((it) => it.isEggless === true);
    if (!allEggless || egglessData.items.length === 0) {
      throw new Error('Eggless filter failed!');
    }
    console.log(`✓ Passed: Dietary filter (Eggless only) returned ${egglessData.items.length} vegetarian items`);

    // 1.6 Single Item Details
    const firstItem = allData.items[0];
    const detailsRes = await fetch(`${baseUrl}/items/${firstItem._id}`);
    const detailsData = await detailsRes.json();
    if (detailsRes.status !== 200 || !detailsData.item.seller?.name) {
      throw new Error('Item details page failed to populate seller info!');
    }
    console.log(`✓ Passed: Item details retrieved with seller info: '${detailsData.item.title}' crafted by '${detailsData.item.seller.bakeryName}'`);

    // -------------------------------------------------------------
    // Test 2: Security Gatekeeper — Pending Seller Item Blocking
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing Pending Seller Item Creation Blocking (HTTP 403)...');
    const pendingCreateRes = await fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${zainabToken}`
      },
      body: JSON.stringify({
        title: 'Unapproved Seller Test Cake',
        description: 'Should be rejected because seller is pending',
        category: cakeCategory._id,
        price: 2500
      })
    });
    const pendingCreateData = await pendingCreateRes.json();
    if (pendingCreateRes.status !== 403) {
      throw new Error(`SECURITY VIOLATION: Pending seller was not blocked! HTTP: ${pendingCreateRes.status}`);
    }
    console.log(`✓ Passed: Pending seller correctly blocked with HTTP 403 (${pendingCreateData.message})`);

    // -------------------------------------------------------------
    // Test 3: Approved Seller Item Creation & Input Validation
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Approved Seller Item Creation & Validation...');
    
    // 3.1 Invalid Negative Price Check
    const invalidPriceRes = await fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ayeshaToken}`
      },
      body: JSON.stringify({
        title: 'Negative Price Cake',
        description: 'Testing validation defense',
        category: cakeCategory._id,
        price: -500
      })
    });
    if (invalidPriceRes.status !== 400) {
      throw new Error('Server trusted client negative price!');
    }
    console.log('✓ Passed: Negative price rejected with HTTP 400');

    // 3.2 Valid Item Creation by Approved Seller
    const validCreateRes = await fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ayeshaToken}`
      },
      body: JSON.stringify({
        title: 'Gourmet Pistachio & Saffron Mousse Cake',
        description: 'Handcrafted sponge soaked in cardamom milk, layered with crushed pistachio praline and saffron mousse.',
        category: cakeCategory._id,
        price: 3400,
        stock: 4,
        isEggless: false,
        preparationTimeHours: 18,
        images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop']
      })
    });
    const validCreateData = await validCreateRes.json();
    if (validCreateRes.status !== 201 || !validCreateData.item?._id) {
      throw new Error(`Item creation failed: ${validCreateData.message}`);
    }
    const createdItemId = validCreateData.item._id;
    console.log(`✓ Passed: Approved seller successfully created item: '${validCreateData.item.title}' (ID: ${createdItemId})`);

    // -------------------------------------------------------------
    // Test 4: Ownership Security — Cross-Seller Access Prevention
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Ownership Security (Cross-Seller Modification Block)...');
    
    // Seller Tariq attempts to edit Seller Ayesha's item
    const crossEditRes = await fetch(`${baseUrl}/items/${createdItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tariqToken}`
      },
      body: JSON.stringify({ title: 'Hacked Title By Competitor' })
    });
    if (crossEditRes.status !== 403) {
      throw new Error('SECURITY VIOLATION: Seller was allowed to edit another seller item!');
    }
    console.log('✓ Passed: Unauthorized cross-seller edit blocked with HTTP 403 Forbidden');

    // Seller Tariq attempts to delete Seller Ayesha's item
    const crossDeleteRes = await fetch(`${baseUrl}/items/${createdItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tariqToken}` }
    });
    if (crossDeleteRes.status !== 403) {
      throw new Error('SECURITY VIOLATION: Seller was allowed to delete another seller item!');
    }
    console.log('✓ Passed: Unauthorized cross-seller delete blocked with HTTP 403 Forbidden');

    // Owner (Ayesha) updates her item
    const legitUpdateRes = await fetch(`${baseUrl}/items/${createdItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ayeshaToken}`
      },
      body: JSON.stringify({ price: 3600, stock: 8 })
    });
    const legitUpdateData = await legitUpdateRes.json();
    if (legitUpdateRes.status !== 200 || legitUpdateData.item.price !== 3600) {
      throw new Error('Legitimate owner update failed!');
    }
    console.log('✓ Passed: Legitimate owner successfully updated item price to PKR 3,600');

    // Owner (Ayesha) deletes her item
    const legitDeleteRes = await fetch(`${baseUrl}/items/${createdItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ayeshaToken}` }
    });
    if (legitDeleteRes.status !== 200) {
      throw new Error('Legitimate owner delete failed!');
    }
    console.log('✓ Passed: Legitimate owner successfully deleted item');

    console.log('\n🎉 ==============================================================');
    console.log('🎉 ALL M3 BAKERY CATALOG & ITEM TESTS PASSED 100% SUCCESSFULLY!');
    console.log('🎉 ==============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ M3 Test Suite Failed:', err.message);
    process.exit(1);
  }
};

runM3Tests();
