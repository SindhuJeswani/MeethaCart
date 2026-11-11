import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'meethacart_jwt_secret',
    { expiresIn: '1d' }
  );
};

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('\n======================================================');
  console.log('MeethaCart M1-M5 + M6 (Order History) Verification Suite');
  console.log('======================================================\n');

  await connectDB();

  const results = [];
  function assert(testName, passed, detail = '') {
    results.push({ testName, passed, detail });
    if (passed) {
      console.log(`  [PASS] ${testName}`);
    } else {
      console.log(`  [FAIL] ${testName} -> ${detail}`);
    }
  }

  // ----------------------------------------------------------------------
  // STEP 0: Prepare Baseline Data
  // ----------------------------------------------------------------------
  console.log('\n--- Setup Baseline Users & Categories ---');
  
  // Admin user
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin Test',
      email: 'admin.verify@meethacart.pk',
      password: 'AdminPassword123!',
      role: 'admin',
      isVerified: true
    });
  }
  const adminToken = signToken(admin);

  // Clean test-specific users
  await User.deleteMany({ email: { $regex: /@verify\.test$/ } });
  await Item.deleteMany({ title: { $regex: /\[Verify\]/ } });
  await Cart.deleteMany({});
  await Order.deleteMany({ note: { $regex: /\[Verify\]/ } });

  // Baseline Category
  let category = await Category.findOne({ name: 'Verification Sweets' });
  if (!category) {
    category = await Category.create({
      name: 'Verification Sweets',
      description: 'Test category'
    });
  }

  // Baseline Approved Seller
  const sellerApproved = await User.create({
    name: 'Approved Baker',
    email: 'seller.approved@verify.test',
    password: 'Password123!',
    role: 'seller',
    bakeryName: 'The Verification Bakehouse',
    isVerified: true,
    sellerStatus: 'approved'
  });
  const sellerToken = signToken(sellerApproved);

  // Baseline Buyer
  const buyerUser = await User.create({
    name: 'Buyer User',
    email: 'buyer.main@verify.test',
    password: 'Password123!',
    role: 'buyer',
    isVerified: true,
    address: 'Clifton Block 5, Karachi',
    preferredLanguage: 'English'
  });
  const buyerToken = signToken(buyerUser);

  // ----------------------------------------------------------------------
  // M1: AUTH & PROFILE
  // ----------------------------------------------------------------------
  console.log('\n--- M1: Role-Based Authentication & Profile Management ---');

  // 1. Password min 8 chars
  const resPw = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Short Pw',
      email: 'shortpw@verify.test',
      password: '123',
      role: 'buyer'
    })
  });
  const dataPw = await resPw.json();
  assert('M1-01: Password < 8 characters validation message',
    resPw.status === 400 && dataPw.message === 'The password must be at least 8 characters',
    `Got: ${dataPw.message}`);

  // 2. Passwords do not match
  const resMismatch = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Mismatch Pw',
      email: 'mismatch@verify.test',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
      role: 'buyer'
    })
  });
  const dataMismatch = await resMismatch.json();
  assert('M1-02: Passwords do not match validation message',
    resMismatch.status === 400 && dataMismatch.message === 'Passwords do not match',
    `Got: ${dataMismatch.message}`);

  // 3. Email already registered
  const resDup = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Buyer',
      email: buyerUser.email,
      password: 'Password123!',
      role: 'buyer'
    })
  });
  const dataDup = await resDup.json();
  assert('M1-03: Email already registered validation message',
    resDup.status === 400 && (dataDup.message === 'An account with this email already exists. Please sign in.' || dataDup.message === 'Email already registered'),
    `Got: ${dataDup.message}`);

  // 4. Seller signup: Store name is required
  const resStoreReq = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Seller No Store',
      email: 'seller.nostore@verify.test',
      password: 'Password123!',
      role: 'seller',
      bakeryName: ''
    })
  });
  const dataStoreReq = await resStoreReq.json();
  assert('M1-04: Seller sign up requires store name',
    resStoreReq.status === 400 && dataStoreReq.message === 'Store name is required',
    `Got: ${dataStoreReq.message}`);

  // 5. Sign in: Invalid email or password
  const resWrongPw = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: buyerUser.email,
      password: 'WrongPassword123!'
    })
  });
  const dataWrongPw = await resWrongPw.json();
  assert('M1-05: Invalid email or password message on wrong password',
    resWrongPw.status === 401 && dataWrongPw.message === 'Invalid email or password',
    `Got: ${dataWrongPw.message}`);

  // 6. Sign in: Pending seller denied
  const pendingSeller = await User.create({
    name: 'Pending Baker',
    email: 'pending.seller@verify.test',
    password: 'Password123!',
    role: 'seller',
    bakeryName: 'Pending Bakery',
    isVerified: true,
    sellerStatus: 'pending'
  });
  const resPendingLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: pendingSeller.email,
      password: 'Password123!'
    })
  });
  const dataPendingLogin = await resPendingLogin.json();
  assert('M1-06: Pending seller login denied with awaiting approval message',
    resPendingLogin.status === 403 && dataPendingLogin.message === 'Your seller account is awaiting admin approval',
    `Got: ${dataPendingLogin.message}`);

  // 7. Sign in: Rejected seller denied
  const rejectedSeller = await User.create({
    name: 'Rejected Baker',
    email: 'rejected.seller@verify.test',
    password: 'Password123!',
    role: 'seller',
    bakeryName: 'Rejected Bakery',
    isVerified: true,
    sellerStatus: 'rejected',
    rejectionReason: 'Invalid hygiene certificate'
  });
  const resRejectedLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: rejectedSeller.email,
      password: 'Password123!'
    })
  });
  const dataRejectedLogin = await resRejectedLogin.json();
  assert('M1-07: Rejected seller login denied with exact message',
    resRejectedLogin.status === 403 && dataRejectedLogin.message === 'Your seller registration was rejected',
    `Got: ${dataRejectedLogin.message}`);

  // 8. Sign in: Blocked user denied
  const blockedUser = await User.create({
    name: 'Blocked User',
    email: 'blocked.user@verify.test',
    password: 'Password123!',
    role: 'buyer',
    isVerified: true,
    isBlocked: true,
    blockReason: 'Terms violation'
  });
  const resBlockedLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: blockedUser.email,
      password: 'Password123!'
    })
  });
  const dataBlockedLogin = await resBlockedLogin.json();
  assert('M1-08: Blocked user login denied with exact message',
    resBlockedLogin.status === 403 && dataBlockedLogin.message === 'Your account has been blocked. Please contact the admin',
    `Got: ${dataBlockedLogin.message}`);

  // 9. Profile update: Name cannot be empty
  const resEmptyName = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`
    },
    body: JSON.stringify({ name: '   ' })
  });
  const dataEmptyName = await resEmptyName.json();
  assert('M1-09: Profile update validates Name cannot be empty',
    resEmptyName.status === 400 && dataEmptyName.message === 'Name cannot be empty',
    `Got: ${dataEmptyName.message}`);

  // 10. Profile update: Invalid phone number
  const resBadPhone = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`
    },
    body: JSON.stringify({ phone: '123' })
  });
  const dataBadPhone = await resBadPhone.json();
  assert('M1-10: Profile update validates Invalid phone number',
    resBadPhone.status === 400 && dataBadPhone.message === 'Invalid phone number',
    `Got: ${dataBadPhone.message}`);

  // 11. Profile update: Save preferredLanguage (Urdu)
  const resLang = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`
    },
    body: JSON.stringify({ preferredLanguage: 'Urdu', address: 'PECHS Block 2, Karachi' })
  });
  const dataLang = await resLang.json();
  assert('M1-11: Profile saves preferredLanguage preference',
    resLang.status === 200 && dataLang.user?.preferredLanguage === 'Urdu',
    `Got: ${dataLang.user?.preferredLanguage}`);

  // ----------------------------------------------------------------------
  // M2: ADMIN PANEL
  // ----------------------------------------------------------------------
  console.log('\n--- M2: Admin Panel ---');

  // 12. Admin approve pending seller
  const resApprove = await fetch(`${BASE_URL}/admin/sellers/${pendingSeller._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'approved' })
  });
  const dataApprove = await resApprove.json();
  assert('M2-01: Admin approves seller and records approvedAt',
    resApprove.status === 200 && dataApprove.seller?.sellerStatus === 'approved' && Boolean(dataApprove.seller?.approvedAt),
    `Got status: ${dataApprove.seller?.sellerStatus}`);

  // 13. Already processed seller request check
  const resAlreadyProcessed = await fetch(`${BASE_URL}/admin/sellers/${pendingSeller._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'approved' })
  });
  const dataAlreadyProcessed = await resAlreadyProcessed.json();
  assert('M2-02: Approving already-processed seller returns exact message',
    resAlreadyProcessed.status === 400 && dataAlreadyProcessed.message === 'This request has already been processed',
    `Got: ${dataAlreadyProcessed.message}`);

  // 14. Admin reject pending seller requires reason
  const freshPendingSeller = await User.create({
    name: 'Fresh Pending',
    email: 'fresh.pending@verify.test',
    password: 'Password123!',
    role: 'seller',
    bakeryName: 'Fresh Bakery',
    isVerified: true,
    sellerStatus: 'pending'
  });
  const resRejectNoReason = await fetch(`${BASE_URL}/admin/sellers/${freshPendingSeller._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'rejected', reason: '' })
  });
  const dataRejectNoReason = await resRejectNoReason.json();
  assert('M2-03: Rejecting seller without reason returns exact error message',
    resRejectNoReason.status === 400 && dataRejectNoReason.message === 'Please enter a reason for rejection',
    `Got: ${dataRejectNoReason.message}`);

  // 15. Admin reject with reason
  const resRejectWithReason = await fetch(`${BASE_URL}/admin/sellers/${freshPendingSeller._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'rejected', reason: 'Bakery address unverifiable' })
  });
  const dataRejectWithReason = await resRejectWithReason.json();
  assert('M2-04: Rejecting seller stores rejectionReason',
    resRejectWithReason.status === 200 && dataRejectWithReason.seller?.rejectionReason === 'Bakery address unverifiable',
    `Got: ${dataRejectWithReason.seller?.rejectionReason}`);

  // 16. Admin block user with reason
  const resBlockUser = await fetch(`${BASE_URL}/admin/users/${sellerApproved._id}/block`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ reason: 'Compliance investigation' })
  });
  const dataBlockUser = await resBlockUser.json();
  assert('M2-05: Admin blocks user with reason stored',
    resBlockUser.status === 200 && dataBlockUser.user?.isBlocked === true && dataBlockUser.user?.blockReason === 'Compliance investigation',
    `Got isBlocked: ${dataBlockUser.user?.isBlocked}`);

  // 17. Admin unblock user
  const resUnblockUser = await fetch(`${BASE_URL}/admin/users/${sellerApproved._id}/unblock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    }
  });
  const dataUnblockUser = await resUnblockUser.json();
  assert('M2-06: Admin unblocks user restoring active status',
    resUnblockUser.status === 200 && dataUnblockUser.user?.isBlocked === false && dataUnblockUser.user?.sellerStatus === 'approved',
    `Got: isBlocked=${dataUnblockUser.user?.isBlocked}`);

  // 18. Category creation validation: Category name is required
  const resCatNoName = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ name: '   ' })
  });
  const dataCatNoName = await resCatNoName.json();
  assert('M2-07: Category creation validates Category name is required',
    resCatNoName.status === 400 && dataCatNoName.message === 'Category name is required',
    `Got: ${dataCatNoName.message}`);

  // 19. Category deletion validation: This category is in use and cannot be deleted
  const testItemForCat = await Item.create({
    title: '[Verify] Brownie',
    description: 'Delicious chocolate brownie',
    price: 350,
    category: category._id,
    seller: sellerApproved._id,
    images: ['/uploads/brownie.jpg'],
    stock: 10,
    isAvailable: true,
    approvalStatus: 'Approved'
  });
  const resDeleteCatInUse = await fetch(`${BASE_URL}/categories/${category._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const dataDeleteCatInUse = await resDeleteCatInUse.json();
  assert('M2-08: Deleting category in use returns exact message',
    resDeleteCatInUse.status === 400 && dataDeleteCatInUse.message === 'This category is in use and cannot be deleted',
    `Got: ${dataDeleteCatInUse.message}`);

  // 20. Admin View All Orders summary count
  const resAdminOrders = await fetch(`${BASE_URL}/admin/orders`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const dataAdminOrders = await resAdminOrders.json();
  assert('M2-09: Admin View All Orders returns summary counts',
    resAdminOrders.status === 200 && dataAdminOrders.summary && typeof dataAdminOrders.summary.totalUsers === 'number',
    `Got summary: ${JSON.stringify(dataAdminOrders.summary)}`);

  // ----------------------------------------------------------------------
  // M3: ITEMS, BROWSING & FILTERING
  // ----------------------------------------------------------------------
  console.log('\n--- M3: Bakery Item Management, Browsing & Filtering ---');

  // 21. Seller Add Item: Item name is required
  const resItemNoName = await fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sellerToken}`
    },
    body: JSON.stringify({
      title: '',
      description: 'Test Description',
      category: category._id,
      price: 500
    })
  });
  const dataItemNoName = await resItemNoName.json();
  assert('M3-01: Add item validates Item name is required',
    resItemNoName.status === 400 && dataItemNoName.message === 'Item name is required',
    `Got: ${dataItemNoName.message}`);

  // 22. Seller Add Item: Price must be a positive number
  const resItemBadPrice = await fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sellerToken}`
    },
    body: JSON.stringify({
      title: '[Verify] Cake',
      description: 'Test Description',
      category: category._id,
      price: -50
    })
  });
  const dataItemBadPrice = await resItemBadPrice.json();
  assert('M3-02: Add item validates Price must be a positive number',
    resItemBadPrice.status === 400 && dataItemBadPrice.message === 'Price must be a positive number',
    `Got: ${dataItemBadPrice.message}`);

  // 23. Keyword search by seller name
  const resSearchSeller = await fetch(`${BASE_URL}/items?search=Verification%20Bakehouse`);
  const dataSearchSeller = await resSearchSeller.json();
  assert('M3-03: Keyword search finds items by seller bakery name',
    resSearchSeller.status === 200 && dataSearchSeller.items?.some(i => i.title.includes('[Verify]')),
    `Count: ${dataSearchSeller.count}`);

  // 24. Delete item removes from active carts
  const cartWithItem = await Cart.create({
    buyer: buyerUser._id,
    items: [{
      item: testItemForCat._id,
      quantity: 1,
      price: testItemForCat.price,
      itemTitle: testItemForCat.title
    }]
  });
  const resDeleteItem = await fetch(`${BASE_URL}/items/${testItemForCat._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sellerToken}` }
  });
  const cartAfterDelete = await Cart.findOne({ buyer: buyerUser._id });
  assert('M3-04: Item deletion cleanses item from active buyer carts',
    resDeleteItem.status === 200 && cartAfterDelete.items.length === 0,
    `Cart items count: ${cartAfterDelete.items.length}`);

  // ----------------------------------------------------------------------
  // M4: SHOPPING CART & ORDER PLACEMENT
  // ----------------------------------------------------------------------
  console.log('\n--- M4: Shopping Cart & Order Placement ---');

  // Fresh Item for Cart & Order tests
  const liveItem = await Item.create({
    title: '[Verify] Royal Gulab Jamun Jar',
    description: 'Fresh artisanal sweets in a glass jar',
    category: category._id,
    seller: sellerApproved._id,
    images: ['/uploads/gulab.jpg'],
    price: 750,
    stock: 5,
    isAvailable: true,
    approvalStatus: 'Approved',
    sizes: [{ name: '500g', price: 750 }, { name: '1kg', price: 1400 }]
  });

  // 25. Add to cart invalid quantity
  const resCartBadQty = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`
    },
    body: JSON.stringify({
      itemId: liveItem._id,
      quantity: 0
    })
  });
  const dataCartBadQty = await resCartBadQty.json();
  assert('M4-01: Add to cart validates Please enter a valid quantity',
    resCartBadQty.status === 400 && dataCartBadQty.message === 'Please enter a valid quantity',
    `Got: ${dataCartBadQty.message}`);

  // 26. Add to cart quantity exceeding stock
  const resCartExceedStock = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`
    },
    body: JSON.stringify({
      itemId: liveItem._id,
      quantity: 99
    })
  });
  const dataCartExceedStock = await resCartExceedStock.json();
  assert('M4-02: Add to cart validates Requested quantity is not available',
    resCartExceedStock.status === 400 && dataCartExceedStock.message === 'Requested quantity is not available',
    `Got: ${dataCartExceedStock.message}`);

  // 27. Add valid item to cart
  const resCartValid = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`
    },
    body: JSON.stringify({
      itemId: liveItem._id,
      quantity: 2,
      selectedSize: '500g'
    })
  });
  const dataCartValid = await resCartValid.json();
  assert('M4-03: Valid item added to buyer cart successfully',
    resCartValid.status === 200 && dataCartValid.cartCount === 2,
    `Cart count: ${dataCartValid.cartCount}`);

  // 28. Checkout without address
  const resCheckoutNoAddress = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`
    },
    body: JSON.stringify({
      deliveryAddress: '   ',
      contactNumber: '03001234567'
    })
  });
  const dataCheckoutNoAddress = await resCheckoutNoAddress.json();
  assert('M4-04: Checkout validates Please enter a delivery address',
    resCheckoutNoAddress.status === 400 && dataCheckoutNoAddress.message === 'Please enter a delivery address',
    `Got: ${dataCheckoutNoAddress.message}`);

  // 29. Checkout COD only placement
  const resPlaceOrder = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`
    },
    body: JSON.stringify({
      deliveryAddress: 'PECHS Block 6, Shahrah-e-Faisal, Karachi',
      contactNumber: '03001234567',
      paymentMethod: 'COD',
      note: '[Verify] Please deliver fresh before 6 PM'
    })
  });
  const dataPlaceOrder = await resPlaceOrder.json();
  const placedOrder = dataPlaceOrder.orders?.[0];
  assert('M4-05: Place Order creates order with status Placed and COD payment',
    resPlaceOrder.status === 201 && placedOrder && placedOrder.status === 'Placed' && placedOrder.paymentMethod === 'COD',
    `Status: ${placedOrder?.status}`);

  // ----------------------------------------------------------------------
  // M5: ORDER TRACKING & COD
  // ----------------------------------------------------------------------
  console.log('\n--- M5: Order Tracking & COD ---');

  // 30. Seller view incoming orders
  const resSellerOrders = await fetch(`${BASE_URL}/orders/seller/my-orders`, {
    headers: { Authorization: `Bearer ${sellerToken}` }
  });
  const dataSellerOrders = await resSellerOrders.json();
  assert('M5-01: Seller retrieves incoming orders list',
    resSellerOrders.status === 200 && dataSellerOrders.orders?.some(o => o._id === placedOrder._id),
    `Count: ${dataSellerOrders.count}`);

  // 31. Seller Accept order (Placed -> Accepted)
  const resAccept = await fetch(`${BASE_URL}/orders/${placedOrder._id}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${sellerToken}` }
  });
  const dataAccept = await resAccept.json();
  assert('M5-02: Seller accepts order (Placed -> Accepted)',
    resAccept.status === 200 && dataAccept.order?.status === 'Accepted',
    `Status: ${dataAccept.order?.status}`);

  // 32. Accept already processed order
  const resAcceptAgain = await fetch(`${BASE_URL}/orders/${placedOrder._id}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${sellerToken}` }
  });
  const dataAcceptAgain = await resAcceptAgain.json();
  assert('M5-03: Accepting already processed order returns exact message',
    resAcceptAgain.status === 400 && dataAcceptAgain.message === 'This order has already been processed',
    `Got: ${dataAcceptAgain.message}`);

  // 33. Invalid status skip (Accepted -> Completed directly without Preparing & Ready)
  const resSkipStatus = await fetch(`${BASE_URL}/orders/${placedOrder._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sellerToken}`
    },
    body: JSON.stringify({ nextStatus: 'Completed' })
  });
  const dataSkipStatus = await resSkipStatus.json();
  assert('M5-04: Skipping status step returns Invalid status change. Please follow the order steps',
    resSkipStatus.status === 400 && dataSkipStatus.message === 'Invalid status change. Please follow the order steps',
    `Got: ${dataSkipStatus.message}`);

  // 34. Sequential status advance: Accepted -> Preparing -> Ready -> Completed
  const resPrep = await fetch(`${BASE_URL}/orders/${placedOrder._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({ nextStatus: 'Preparing' })
  });
  const resReady = await fetch(`${BASE_URL}/orders/${placedOrder._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({ nextStatus: 'Ready' })
  });
  const resCompleted = await fetch(`${BASE_URL}/orders/${placedOrder._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({ nextStatus: 'Completed' })
  });
  const dataCompleted = await resCompleted.json();
  assert('M5-05: Status step-by-step advances to Completed and paymentStatus becomes Collected',
    resCompleted.status === 200 && dataCompleted.order?.status === 'Completed' && dataCompleted.order?.paymentStatus === 'Collected',
    `Status: ${dataCompleted.order?.status}, PaymentStatus: ${dataCompleted.order?.paymentStatus}`);

  // 35. Reject order flow (Placed -> Rejected with reason required)
  const rejectedTestOrder = await Order.create({
    orderNumber: 'MC-REJECT-001',
    buyer: buyerUser._id,
    seller: sellerApproved._id,
    items: [{
      item: liveItem._id,
      name: liveItem.title,
      quantity: 1,
      price: liveItem.price
    }],
    totalAmount: liveItem.price,
    deliveryAddress: 'Clifton Block 2, Karachi',
    contactNumber: '03001234567',
    paymentMethod: 'COD',
    status: 'Placed',
    note: '[Verify] Reject Test Order'
  });

  const resRejectOrderNoReason = await fetch(`${BASE_URL}/orders/${rejectedTestOrder._id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({ reason: '' })
  });
  const dataRejectOrderNoReason = await resRejectOrderNoReason.json();
  assert('M5-06: Rejecting order requires reason (Please enter a reason for rejection)',
    resRejectOrderNoReason.status === 400 && dataRejectOrderNoReason.message === 'Please enter a reason for rejection',
    `Got: ${dataRejectOrderNoReason.message}`);

  const resRejectOrderWithReason = await fetch(`${BASE_URL}/orders/${rejectedTestOrder._id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({ reason: 'Kitchen capacity exceeded for today' })
  });
  const dataRejectOrderWithReason = await resRejectOrderWithReason.json();
  assert('M5-07: Rejecting order sets status to Rejected and stores rejectionReason',
    resRejectOrderWithReason.status === 200 && dataRejectOrderWithReason.order?.status === 'Rejected' && dataRejectOrderWithReason.order?.rejectionReason === 'Kitchen capacity exceeded for today',
    `Status: ${dataRejectOrderWithReason.order?.status}`);

  // ----------------------------------------------------------------------
  // M6: ORDER HISTORY (BUYER "MY ORDERS")
  // ----------------------------------------------------------------------
  console.log('\n--- M6: Order History Feature ONLY ---');

  // 35. Buyer My Orders endpoint
  const resMyOrders = await fetch(`${BASE_URL}/orders/my-orders`, {
    headers: { Authorization: `Bearer ${buyerToken}` }
  });
  const dataMyOrders = await resMyOrders.json();
  assert('M6-01: Buyer retrieves order history from /api/orders/my-orders',
    resMyOrders.status === 200 && dataMyOrders.orders?.length > 0 && dataMyOrders.orders.some(o => o._id === placedOrder._id),
    `Count: ${dataMyOrders.orders?.length}`);

  // 36. Empty order history for brand new buyer
  const brandNewBuyer = await User.create({
    name: 'New Empty Buyer',
    email: 'empty.buyer@verify.test',
    password: 'Password123!',
    role: 'buyer',
    isVerified: true
  });
  const emptyToken = signToken(brandNewBuyer);
  const resEmptyHistory = await fetch(`${BASE_URL}/orders/my-orders`, {
    headers: { Authorization: `Bearer ${emptyToken}` }
  });
  const dataEmptyHistory = await resEmptyHistory.json();
  assert('M6-02: New buyer retrieves empty order history ([])',
    resEmptyHistory.status === 200 && Array.isArray(dataEmptyHistory.orders) && dataEmptyHistory.orders.length === 0,
    `Orders length: ${dataEmptyHistory.orders?.length}`);

  // ----------------------------------------------------------------------
  // CLEANUP TEST ARTIFACTS
  // ----------------------------------------------------------------------
  await User.deleteMany({ email: { $regex: /@verify\.test$/ } });
  await Item.deleteMany({ title: { $regex: /\[Verify\]/ } });
  await Category.deleteMany({ name: 'Verification Sweets' });
  await Cart.deleteMany({});
  await Order.deleteMany({ note: { $regex: /\[Verify\]/ } });

  // ----------------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('Verification Suite Execution Finished');
  console.log('======================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed:      ${passedCount}`);
  console.log(`Failed:      ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification().catch(err => {
  console.error('[Verification Fatal Error]:', err);
  process.exit(1);
});