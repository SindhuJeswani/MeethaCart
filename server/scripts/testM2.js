import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'meethacart_jwt_secret',
    { expiresIn: '1h' }
  );
};

const runM2Tests = async () => {
  console.log('\n🧪 ==============================================================');
  console.log('🧪 Starting MeethaCart M2 (Admin Panel) Automated Test Suite');
  console.log('🧪 ==============================================================\n');

  // Step 1: Run seed script to ensure fresh, consistent state
  await seedDatabase();

  const adminUser = await User.findOne({ role: 'admin' });
  const buyerUser = await User.findOne({ email: 'hamza.buyer@meethacart.com' });
  const pendingSeller = await User.findOne({ email: 'zainab.oven@meethacart.com' });

  const adminToken = signToken(adminUser);
  const buyerToken = signToken(buyerUser);

  const baseUrl = 'http://localhost:5000/api';

  try {
    // -------------------------------------------------------------
    // Test 1: Role-Based Authorization on Admin Routes
    // -------------------------------------------------------------
    console.log('[TEST 1] Testing Role-Based Protection on Admin Endpoints...');
    
    // Unauthenticated
    const unauthRes = await fetch(`${baseUrl}/admin/metrics`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got: ${unauthRes.status}`);
    }
    console.log('✓ Passed: Unauthenticated request rejected with HTTP 401');

    // Authenticated as Buyer (Insufficient permissions)
    const buyerRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    if (buyerRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for buyer, got: ${buyerRes.status}`);
    }
    console.log('✓ Passed: Non-admin buyer rejected with HTTP 403 Forbidden');

    // Authenticated as Admin
    const adminRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (adminRes.status !== 200) {
      throw new Error(`Expected 200 OK for admin, got: ${adminRes.status}`);
    }
    const metricsData = await adminRes.json();
    console.log('✓ Passed: Admin access granted (HTTP 200). Metrics loaded:');
    console.log(`  - Total Users: ${metricsData.metrics.totalUsers}`);
    console.log(`  - Approved Sellers: ${metricsData.metrics.approvedSellers}`);
    console.log(`  - Pending Sellers: ${metricsData.metrics.pendingSellers}`);
    console.log(`  - Categories: ${metricsData.metrics.totalCategories}`);
    console.log(`  - Items: ${metricsData.metrics.totalItems}`);

    // -------------------------------------------------------------
    // Test 2: Seller Approvals & Blocking Flow
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing Seller Approval & Blocking Workflow...');
    if (pendingSeller.sellerStatus !== 'pending') {
      throw new Error('Expected initial seller status to be pending!');
    }
    console.log(`- Initial Status of '${pendingSeller.bakeryName}': ${pendingSeller.sellerStatus}`);

    // Admin approves seller
    const approveRes = await fetch(`${baseUrl}/admin/sellers/${pendingSeller._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const approveData = await approveRes.json();
    if (!approveData.success || approveData.seller.sellerStatus !== 'approved') {
      throw new Error('Failed to approve seller!');
    }
    console.log('✓ Passed: Seller approved successfully by Admin');

    // Admin suspends seller
    const blockRes = await fetch(`${baseUrl}/admin/sellers/${pendingSeller._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'blocked' })
    });
    const blockData = await blockRes.json();
    if (!blockData.success || blockData.seller.sellerStatus !== 'blocked') {
      throw new Error('Failed to block seller!');
    }
    console.log('✓ Passed: Seller suspended successfully by Admin');

    // Reset back to pending for UI demonstration
    await fetch(`${baseUrl}/admin/sellers/${pendingSeller._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'pending' })
    });
    console.log('✓ Reset seller status to pending for UI evaluation');

    // -------------------------------------------------------------
    // Test 3: Category Management CRUD & Integrity Check
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Category Management CRUD & Referential Integrity...');
    
    // Create new Category
    const createCatRes = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Donuts & Bagels',
        description: 'Glazed artisan donuts and fresh kettle-boiled bagels.'
      })
    });
    const createCatData = await createCatRes.json();
    if (!createCatData.success) {
      throw new Error(`Failed to create category: ${createCatData.message}`);
    }
    const newCatId = createCatData.category._id;
    console.log(`✓ Passed: Category created: '${createCatData.category.name}' (Slug: ${createCatData.category.slug})`);

    // Update Category
    const updateCatRes = await fetch(`${baseUrl}/categories/${newCatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        description: 'Updated description for artisanal donuts and bagels.'
      })
    });
    const updateCatData = await updateCatRes.json();
    if (!updateCatData.success) throw new Error('Failed to update category!');
    console.log('✓ Passed: Category updated successfully');

    // Integrity check: Try deleting category with attached items (e.g. Custom Cakes)
    const cakeCat = await Category.findOne({ slug: 'custom-cakes' });
    const deleteBlockedRes = await fetch(`${baseUrl}/categories/${cakeCat._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const deleteBlockedData = await deleteBlockedRes.json();
    if (deleteBlockedRes.status !== 400 || !deleteBlockedData.message.includes('attached to it')) {
      throw new Error('Integrity check failed: Category with items was deleted or incorrect response!');
    }
    console.log(`✓ Passed: Referential integrity protected: (${deleteBlockedData.message})`);

    // Delete empty category (Should succeed)
    const deleteEmptyRes = await fetch(`${baseUrl}/categories/${newCatId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const deleteEmptyData = await deleteEmptyRes.json();
    if (!deleteEmptyData.success) throw new Error('Failed to delete empty category!');
    console.log('✓ Passed: Empty category deleted successfully');

    // -------------------------------------------------------------
    // Test 4: Orders Endpoint Empty State
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Admin Orders Audit Endpoint...');
    const ordersRes = await fetch(`${baseUrl}/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const ordersData = await ordersRes.json();
    if (ordersRes.status !== 200 || !Array.isArray(ordersData.orders)) {
      throw new Error('Orders endpoint failed!');
    }
    console.log(`✓ Passed: Orders endpoint returned HTTP 200 with structured empty array. Note: '${ordersData.note}'`);

    console.log('\n🎉 ==============================================================');
    console.log('🎉 ALL M2 ADMIN PANEL TESTS PASSED 100% SUCCESSFULLY!');
    console.log('🎉 ==============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ M2 Test Suite Failed:', err.message);
    process.exit(1);
  }
};

runM2Tests();
