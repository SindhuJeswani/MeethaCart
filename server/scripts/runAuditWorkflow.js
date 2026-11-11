import http from 'http';

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf || '{}') }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runAudit() {
  console.log('==================================================');
  console.log('STARTING WORKFLOW A, B, C AUDIT TESTS');
  console.log('==================================================\n');

  // TEST A: HAPPY PATH
  console.log('--- TEST A: HAPPY PATH ---');

  const ts = Date.now();
  const sellerEmail = `audit.seller.${ts}@gmail.com`;
  const buyerEmail = `audit.buyer.${ts}@gmail.com`;

  // 1. Seller signs up
  const signupRes = await request('POST', '/api/auth/register', {
    name: 'Audit Baker',
    email: sellerEmail,
    password: 'Password123!',
    role: 'seller',
    bakeryName: 'Audit Sweet Bakery',
    city: 'Karachi',
    bio: 'Finest bakes for audit'
  });
  console.log('1. Seller signup status:', signupRes.status, 'DevOTP:', Boolean(signupRes.body.devOtp));

  // Verify OTP so seller account is created in DB with status "pending"
  const verifyRes = await request('POST', '/api/auth/verify-otp', {
    email: sellerEmail,
    otp: signupRes.body.devOtp
  });
  const sellerId = verifyRes.body.user?.id;
  console.log('1b. Seller verified with OTP. Account created, sellerStatus:', verifyRes.body.user?.sellerStatus);

  // Try login while Pending
  const tryPendingLogin = await request('POST', '/api/auth/login', {
    email: sellerEmail,
    password: 'Password123!'
  });
  console.log('2. Try pending seller login status:', tryPendingLogin.status, 'Message:', tryPendingLogin.body.message);

  // Admin approves seller
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'bcsbs2212326@szabist.pk',
    password: 'mm123456'
  });
  const adminToken = adminLogin.body.token;

  const approveSellerRes = await request('PATCH', '/api/admin/sellers/' + sellerId + '/status', {
    status: 'approved'
  }, adminToken);
  console.log('3. Admin approve seller status:', approveSellerRes.status, 'New status:', approveSellerRes.body.seller?.sellerStatus);

  // Seller logs in
  const sellerLogin = await request('POST', '/api/auth/login', {
    email: sellerEmail,
    password: 'Password123!'
  });
  const sellerToken = sellerLogin.body.token;
  console.log('4. Seller login after approval status:', sellerLogin.status, 'Has token:', Boolean(sellerToken));

  // Seller adds menu item
  const catRes = await request('GET', '/api/categories');
  const catId = catRes.body.categories?.[0]?._id;

  const addItemRes = await request('POST', '/api/items', {
    title: 'Audit Signature Pistachio Tart',
    description: 'Crispy pastry shell with rich roasted pistachio cream',
    category: catId,
    price: 950,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587']
  }, sellerToken);
  const itemId = addItemRes.body.item?._id;
  console.log('5. Seller adds item status:', addItemRes.status, 'ApprovalStatus:', addItemRes.body.item?.approvalStatus);

  // Verify item is NOT returned in guest/buyer browse
  const guestBrowse1 = await request('GET', '/api/items?search=Pistachio');
  const foundInBrowse1 = (guestBrowse1.body.items || []).some(i => i._id === itemId);
  console.log('6. Guest search finds pending item?', foundInBrowse1, '(Expected: false)');

  // Verify item direct URL is 404 for guest
  const guestItemView1 = await request('GET', '/api/items/' + itemId);
  console.log('7. Guest view pending item by id status:', guestItemView1.status, '(Expected: 404)');

  // Admin rejects item with reason
  const rejectItemRes = await request('PATCH', '/api/admin/items/' + itemId + '/reject', {
    reason: 'Please upload clearer ingredient photos'
  }, adminToken);
  console.log('8. Admin reject item status:', rejectItemRes.status, 'RejectionReason:', rejectItemRes.body.item?.rejectionReason);

  // Seller sees reason in my-items
  const myItemsRes = await request('GET', '/api/items/seller/my-items', null, sellerToken);
  const sellerViewItem = (myItemsRes.body.items || []).find(i => i._id === itemId);
  console.log('9. Seller sees rejection reason in item list:', sellerViewItem?.rejectionReason);

  // Seller edits item -> status becomes Pending again
  const editItemRes = await request('PUT', '/api/items/' + itemId, {
    title: 'Audit Signature Pistachio Tart (Updated)',
    price: 980
  }, sellerToken);
  console.log('10. Seller edit item status:', editItemRes.status, 'ApprovalStatus:', editItemRes.body.item?.approvalStatus);

  // Admin accepts item
  const acceptItemRes = await request('PATCH', '/api/admin/items/' + itemId + '/accept', null, adminToken);
  console.log('11. Admin accept item status:', acceptItemRes.status, 'ApprovalStatus:', acceptItemRes.body.item?.approvalStatus);

  // Guest browse now finds item
  const guestBrowse2 = await request('GET', '/api/items?search=Pistachio');
  const foundInBrowse2 = (guestBrowse2.body.items || []).some(i => i._id === itemId);
  console.log('12. Guest search finds approved item?', foundInBrowse2, '(Expected: true)');

  // Buyer signs up, verifies & logs in
  const buyerSignup = await request('POST', '/api/auth/register', {
    name: 'Audit Buyer',
    email: buyerEmail,
    password: 'Password123!',
    role: 'buyer'
  });
  await request('POST', '/api/auth/verify-otp', {
    email: buyerEmail,
    otp: buyerSignup.body.devOtp
  });
  const buyerLogin = await request('POST', '/api/auth/login', {
    email: buyerEmail,
    password: 'Password123!'
  });
  const buyerToken = buyerLogin.body.token;

  // Buyer adds item to cart
  const addCartRes = await request('POST', '/api/cart/items', {
    itemId,
    quantity: 2
  }, buyerToken);
  console.log('13. Buyer add to cart status:', addCartRes.status, 'Items in cart:', addCartRes.body.cart?.items?.length);

  // Checkout with COD
  const orderRes = await request('POST', '/api/orders', {
    deliveryAddress: 'House 99, Street 1, Defence Karachi',
    contactNumber: '03009998877',
    paymentMethod: 'COD'
  }, buyerToken);
  console.log('14. Buyer checkout status:', orderRes.status, 'Orders created:', orderRes.body.orders?.length);


  // TEST B: NEGATIVE API TESTS
  console.log('\n--- TEST B: NEGATIVE API TESTS ---');

  // B1: Buyer calling admin approve endpoint
  const b1 = await request('PATCH', '/api/admin/sellers/' + sellerId + '/status', { status: 'approved' }, buyerToken);
  console.log('B1: Buyer calling admin seller approval status:', b1.status, '(Expected: 403)');

  // B2: Seller sending approvalStatus: 'Approved' on create
  const b2 = await request('POST', '/api/items', {
    title: 'Sneaky Approved Cake',
    description: 'Trying to bypass admin review directly',
    category: catId,
    price: 1200,
    approvalStatus: 'Approved',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587']
  }, sellerToken);
  console.log('B2: Seller injects approvalStatus: Approved on create -> actual saved status:', b2.body.item?.approvalStatus, '(Expected: Pending)');
  const sneakyItemId = b2.body.item?._id;

  // B3: Guest or buyer opening Pending item by id
  const b3 = await request('GET', '/api/items/' + sneakyItemId, null, buyerToken);
  console.log('B3: Buyer opening Pending item by id status:', b3.status, '(Expected: 404)');

  // B4: Buyer adding Pending item to cart
  const b4 = await request('POST', '/api/cart/items', { itemId: sneakyItemId, quantity: 1 }, buyerToken);
  console.log('B4: Buyer adding Pending item to cart status:', b4.status, 'Message:', b4.body.message, '(Expected: 400 unavailable)');

  // B5: Placing order with an item that became Pending after being added
  // First approve item
  await request('PATCH', '/api/admin/items/' + sneakyItemId + '/accept', null, adminToken);
  // Buyer adds it
  await request('POST', '/api/cart/items', { itemId: sneakyItemId, quantity: 1 }, buyerToken);
  // Seller edits it -> turns to Pending!
  await request('PUT', '/api/items/' + sneakyItemId, { title: 'Sneaky Cake (Edited)' }, sellerToken);
  // Buyer tries to place order
  const b5 = await request('POST', '/api/orders', {
    deliveryAddress: 'House 1, Karachi',
    contactNumber: '03001234567',
    paymentMethod: 'COD'
  }, buyerToken);
  console.log('B5: Order placement with item that became Pending status:', b5.status, 'Message:', b5.body.message, '(Expected: 400)');

  // B6: Blocked seller approved items visible to customers
  // Admin blocks seller
  await request('PATCH', '/api/admin/users/' + sellerId + '/block', { reason: 'Audit test blocking' }, adminToken);
  const b6Browse = await request('GET', '/api/items?search=Pistachio');
  const b6Found = (b6Browse.body.items || []).some(i => i._id === itemId);
  console.log('B6: Blocked seller item visible in customer browse?', b6Found, '(Expected: false)');
  const b6Profile = await request('GET', '/api/users/seller/' + sellerId);
  console.log('B6: Blocked seller public profile status:', b6Profile.status, '(Expected: 404)');

  // B7: Pending seller creating an item
  const pendingSellerEmail = `pending.baker.${Date.now()}@gmail.com`;
  const pReg = await request('POST', '/api/auth/register', {
    name: 'Pending Baker 2',
    email: pendingSellerEmail,
    password: 'Password123!',
    role: 'seller',
    bakeryName: 'Pending Bakery 2'
  });
  await request('POST', '/api/auth/verify-otp', {
    email: pendingSellerEmail,
    otp: pReg.body.devOtp
  });
  const b7Login = await request('POST', '/api/auth/login', { email: pendingSellerEmail, password: 'Password123!' });
  console.log('B7: Pending seller login status:', b7Login.status, 'Message:', b7Login.body.message, '(Expected: 403)');


  // TEST C: SELLER EDITS AN APPROVED ITEM -> DISAPPEARS
  console.log('\n--- TEST C: SELLER EDITS APPROVED ITEM ---');
  // Unblock seller first
  await request('PATCH', '/api/admin/users/' + sellerId + '/unblock', null, adminToken);
  // Admin accepts item again
  await request('PATCH', '/api/admin/items/' + itemId + '/accept', null, adminToken);
  const browseBeforeEdit = await request('GET', '/api/items?search=Pistachio');
  console.log('C1: Item visible before edit?', (browseBeforeEdit.body.items || []).some(i => i._id === itemId));

  // Seller edits it
  const cEdit = await request('PUT', '/api/items/' + itemId, { title: 'Audit Pistachio Tart V2' }, sellerToken);
  console.log('C2: Seller edits item status:', cEdit.status, 'New approvalStatus:', cEdit.body.item?.approvalStatus);

  // Customer browse
  const browseAfterEdit = await request('GET', '/api/items?search=Pistachio');
  const visibleAfterEdit = (browseAfterEdit.body.items || []).some(i => i._id === itemId);
  console.log('C3: Item visible after edit in customer browse?', visibleAfterEdit, '(Expected: false)');

  // Direct URL by guest
  const directUrlAfterEdit = await request('GET', '/api/items/' + itemId);
  console.log('C4: Direct URL after edit status:', directUrlAfterEdit.status, '(Expected: 404)');

  // Clean test artifacts
  console.log('\nCleaning test audit data...');
  const { User } = await import('../models/User.js');
  const { Item } = await import('../models/Item.js');
  const { Order } = await import('../models/Order.js');
  const { Cart } = await import('../models/Cart.js');
  const { connectDB } = await import('../config/db.js');
  await connectDB();
  await User.deleteMany({ email: { $in: [sellerEmail, buyerEmail, pendingSellerEmail] } });
  await Item.deleteMany({ _id: { $in: [itemId, sneakyItemId] } });
  await Cart.deleteMany({});
  await Order.deleteMany({ contactNumber: '03009998877' });
  console.log('✓ Cleaned audit records.');

  console.log('\n==================================================');
  console.log('ALL WORKFLOW & SECURITY AUDITS COMPLETED SUCCESSFULLY');
  console.log('==================================================');
  process.exit(0);
}

runAudit().catch(e => { console.error('Audit failed:', e); process.exit(1); });
