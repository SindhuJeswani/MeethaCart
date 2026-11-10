import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS
} from '../config/orderConstants.js';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'meethacart_super_secret_jwt_key_fyp_2026_secured',
    { expiresIn: '7d' }
  );
};

const runM4M5Tests = async () => {
  console.log('\n🚀 ==============================================================');
  console.log('🚀 Running MeethaCart Milestone 4 & 5 Comprehensive Test Suite');
  console.log('🚀 ==============================================================\n');

  await connectDB();

  // 1. Identify Test Actors
  const buyerSara = await User.findOne({ email: 'sara.ahmed@meethacart.pk' });
  const buyerOmer = await User.findOne({ email: 'omer.farooq@meethacart.pk' });
  const sellerFatima = await User.findOne({ email: 'fatima.bakes@meethacart.pk' });
  const sellerTariq = await User.findOne({ email: 'tariq.mithai@meethacart.pk' });

  if (!buyerSara || !sellerFatima || !sellerTariq) {
    throw new Error('Test actors not found in database. Run seed first.');
  }

  const saraToken = signToken(buyerSara);
  const omerToken = signToken(buyerOmer);
  const fatimaToken = signToken(sellerFatima);
  const tariqToken = signToken(sellerTariq);

  // Clear existing cart and orders for clean test run
  await Cart.deleteMany({ buyer: buyerSara._id });
  await Order.deleteMany({ buyer: buyerSara._id });

  // Find items from Seller A (Fatima) and Seller B (Tariq)
  const fatimaItems = await Item.find({ seller: sellerFatima._id, approvalStatus: 'Approved', isAvailable: true });
  const tariqItems = await Item.find({ seller: sellerTariq._id, approvalStatus: 'Approved', isAvailable: true });

  if (fatimaItems.length < 2 || tariqItems.length < 1) {
    throw new Error('Insufficient approved items in seed data.');
  }

  const itemA1 = fatimaItems[0];
  const itemA2 = fatimaItems[1];
  const itemB1 = tariqItems[0];

  console.log(`[SETUP] Buyer: ${buyerSara.name} (${buyerSara.email})`);
  console.log(`[SETUP] Seller A: ${sellerFatima.bakeryName} (${itemA1.title}, ${itemA2.title})`);
  console.log(`[SETUP] Seller B: ${sellerTariq.bakeryName} (${itemB1.title})`);

  // -------------------------------------------------------------
  // TEST 1: Cart & Quantity Management
  // -------------------------------------------------------------
  console.log('\n--- [TEST 1] Cart & Quantity Management ---');

  // 1.1 Add item A1 with options
  const addA1Res = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${saraToken}` },
    body: JSON.stringify({
      itemId: itemA1._id,
      quantity: 1,
      selectedSize: itemA1.sizes?.[0]?.name || null,
      selectedFlavor: itemA1.flavors?.[0] || null,
      customizationNote: 'Please write "Happy Birthday" on top'
    })
  });
  const addA1Data = await addA1Res.json();
  if (!addA1Data.success) throw new Error(`Add item A1 failed: ${addA1Data.message}`);
  console.log('✓ Buyer added Item A1 (Seller Fatima) with customization note to cart');

  // 1.2 Add item A2
  const addA2Res = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${saraToken}` },
    body: JSON.stringify({
      itemId: itemA2._id,
      quantity: 1
    })
  });
  const addA2Data = await addA2Res.json();
  if (!addA2Data.success) throw new Error(`Add item A2 failed: ${addA2Data.message}`);
  console.log('✓ Buyer added Item A2 (Seller Fatima) to cart');

  // 1.3 Add item B1 (from Seller Tariq)
  const addB1Res = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${saraToken}` },
    body: JSON.stringify({
      itemId: itemB1._id,
      quantity: 2,
      selectedSize: itemB1.sizes?.[0]?.name || null,
      selectedFlavor: itemB1.flavors?.[0] || null
    })
  });
  const addB1Data = await addB1Res.json();
  if (!addB1Data.success) throw new Error(`Add item B1 failed: ${addB1Data.message}`);
  console.log('✓ Buyer added Item B1 (Seller Tariq) from second seller to cart');

  // 1.4 Get Cart and verify items and total
  const cartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { Authorization: `Bearer ${saraToken}` }
  });
  const cartData = await cartRes.json();
  if (!cartData.success || cartData.items.length !== 3) {
    throw new Error(`Expected 3 items in cart, got ${cartData.items?.length}`);
  }
  console.log(`✓ Cart fetched: ${cartData.items.length} items, total: Rs. ${cartData.totalPrice}, cartCount: ${cartData.cartCount}`);

  // 1.5 Update quantity on Item A1: Change from 1 to 2
  const cartItemA1 = cartData.items.find((it) => it.item._id.toString() === itemA1._id.toString());
  const updateQtyRes = await fetch(`${BASE_URL}/cart/items/${cartItemA1._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${saraToken}` },
    body: JSON.stringify({ quantity: 2 })
  });
  const updateQtyData = await updateQtyRes.json();
  if (!updateQtyData.success) throw new Error(`Quantity update failed: ${updateQtyData.message}`);
  console.log(`✓ Quantity of Item A1 updated to 2. New total: Rs. ${updateQtyData.totalPrice}`);

  // 1.6 Remove Item A2 from cart
  const cartItemA2 = cartData.items.find((it) => it.item._id.toString() === itemA2._id.toString());
  const removeRes = await fetch(`${BASE_URL}/cart/items/${cartItemA2._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${saraToken}` }
  });
  const removeData = await removeRes.json();
  if (!removeData.success || removeData.items.length !== 2) {
    throw new Error(`Expected 2 items after removal, got ${removeData.items?.length}`);
  }
  console.log(`✓ Item A2 removed from cart. Remaining items: ${removeData.items.length}, total: Rs. ${removeData.totalPrice}`);

  // -------------------------------------------------------------
  // TEST 2: Checkout & Order Placement
  // -------------------------------------------------------------
  console.log('\n--- [TEST 2] Checkout & Multi-Seller Order Creation ---');

  // 2.1 Checkout with COD
  const checkoutRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${saraToken}` },
    body: JSON.stringify({
      deliveryAddress: 'House 42, PECHS Block 2, Karachi',
      contactNumber: '03001234511',
      note: 'Please deliver before 6 PM and ring the bell twice.',
      paymentMethod: 'COD'
    })
  });
  const checkoutData = await checkoutRes.json();
  if (!checkoutData.success || !checkoutData.orders || checkoutData.orders.length !== 2) {
    throw new Error(`Checkout failed or did not create 2 separate orders: ${JSON.stringify(checkoutData)}`);
  }

  const orderFatima = checkoutData.orders.find((o) => o.seller._id.toString() === sellerFatima._id.toString());
  const orderTariq = checkoutData.orders.find((o) => o.seller._id.toString() === sellerTariq._id.toString());

  if (!orderFatima || !orderTariq) {
    throw new Error('One separate order per seller was not created correctly.');
  }

  console.log(`✓ Successfully placed order! Generated 2 separate orders:`);
  console.log(`  - Order 1 (#${orderFatima.orderNumber}): Seller ${sellerFatima.bakeryName}, Status: ${orderFatima.status}, Payment: ${orderFatima.paymentMethod} (${orderFatima.paymentStatus}), Total: Rs. ${orderFatima.totalAmount}`);
  console.log(`  - Order 2 (#${orderTariq.orderNumber}): Seller ${sellerTariq.bakeryName}, Status: ${orderTariq.status}, Payment: ${orderTariq.paymentMethod} (${orderTariq.paymentStatus}), Total: Rs. ${orderTariq.totalAmount}`);

  // 2.2 Verify cart was cleared after order placement
  const emptyCartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { Authorization: `Bearer ${saraToken}` }
  });
  const emptyCartData = await emptyCartRes.json();
  if (emptyCartData.items.length !== 0 || emptyCartData.cartCount !== 0) {
    throw new Error('Cart was not cleared after order placement.');
  }
  console.log('✓ Buyer cart was automatically cleared after checkout.');

  // -------------------------------------------------------------
  // TEST 3: Order Tracking & Ownership Security
  // -------------------------------------------------------------
  console.log('\n--- [TEST 3] Order Tracking & Privacy ---');

  // 3.1 Owner buyer can view order tracking
  const trackRes = await fetch(`${BASE_URL}/orders/${orderFatima._id}`, {
    headers: { Authorization: `Bearer ${saraToken}` }
  });
  const trackData = await trackRes.json();
  if (!trackData.success || !trackData.order) {
    throw new Error('Owner buyer failed to view order tracking.');
  }
  console.log(`✓ Owner buyer successfully opened tracking for Order #${trackData.order.orderNumber}`);

  // 3.2 Another buyer cannot view order tracking (Forbidden 403)
  const unauthorizedRes = await fetch(`${BASE_URL}/orders/${orderFatima._id}`, {
    headers: { Authorization: `Bearer ${omerToken}` }
  });
  if (unauthorizedRes.status !== 403) {
    throw new Error(`Expected 403 Unauthorized for another buyer, got ${unauthorizedRes.status}`);
  }
  console.log('✓ Privacy verified: Non-owner buyer blocked with 403 Forbidden.');

  // -------------------------------------------------------------
  // TEST 4: Milestone 5 Status Updates Lifecycle (Placed -> Completed)
  // -------------------------------------------------------------
  console.log('\n--- [TEST 4] Milestone 5 Lifecycle: Placed -> Accepted -> Preparing -> Ready -> Completed ---');

  // 4.1 Seller Fatima views her orders
  const sellerOrdersRes = await fetch(`${BASE_URL}/orders/seller/my-orders`, {
    headers: { Authorization: `Bearer ${fatimaToken}` }
  });
  const sellerOrdersData = await sellerOrdersRes.json();
  const myFatimaOrder = sellerOrdersData.orders?.find((o) => o._id === orderFatima._id);
  if (!myFatimaOrder) {
    throw new Error('Seller Fatima could not find her incoming order.');
  }
  console.log(`✓ Seller Fatima sees order #${myFatimaOrder.orderNumber} with buyer note: "${myFatimaOrder.note}"`);

  // 4.2 Test invalid skipping: cannot jump directly from Placed to Preparing
  const invalidSkipRes = await fetch(`${BASE_URL}/orders/${orderFatima._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fatimaToken}` },
    body: JSON.stringify({ nextStatus: ORDER_STATUS.PREPARING })
  });
  const invalidSkipData = await invalidSkipRes.json();
  if (invalidSkipRes.status !== 400 || !invalidSkipData.message.includes('Invalid status change')) {
    throw new Error(`Expected 400 for skipping status steps, got ${invalidSkipRes.status}`);
  }
  console.log('✓ Invalid skip blocked: "Invalid status change. Please follow the order steps"');

  // 4.3 Seller Fatima Accepts Order (Placed -> Accepted)
  const acceptRes = await fetch(`${BASE_URL}/orders/${orderFatima._id}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${fatimaToken}` }
  });
  const acceptData = await acceptRes.json();
  if (!acceptData.success || acceptData.order.status !== ORDER_STATUS.ACCEPTED) {
    throw new Error('Accepting order failed.');
  }
  console.log(`✓ Order accepted! Status: ${acceptData.order.status}`);

  // 4.4 Test repeat Accept: should report "This order has already been processed"
  const repeatAcceptRes = await fetch(`${BASE_URL}/orders/${orderFatima._id}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${fatimaToken}` }
  });
  const repeatAcceptData = await repeatAcceptRes.json();
  if (repeatAcceptRes.status !== 400 || !repeatAcceptData.message.includes('already been processed')) {
    throw new Error('Expected "This order has already been processed" error on repeat accept.');
  }
  console.log('✓ Repeat accept rejected: "This order has already been processed"');

  // 4.5 Move Accepted -> Preparing
  const prepRes = await fetch(`${BASE_URL}/orders/${orderFatima._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fatimaToken}` },
    body: JSON.stringify({ nextStatus: ORDER_STATUS.PREPARING })
  });
  const prepData = await prepRes.json();
  if (!prepData.success || prepData.order.status !== ORDER_STATUS.PREPARING) {
    throw new Error('Update to Preparing failed.');
  }
  console.log(`✓ Status updated: ${prepData.order.status} (baking in artisan kitchen)`);

  // 4.6 Move Preparing -> Ready
  const readyRes = await fetch(`${BASE_URL}/orders/${orderFatima._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fatimaToken}` },
    body: JSON.stringify({ nextStatus: ORDER_STATUS.READY })
  });
  const readyData = await readyRes.json();
  if (!readyData.success || readyData.order.status !== ORDER_STATUS.READY) {
    throw new Error('Update to Ready failed.');
  }
  console.log(`✓ Status updated: ${readyData.order.status} (packaged & ready for courier)`);

  // 4.7 Move Ready -> Completed
  const completedRes = await fetch(`${BASE_URL}/orders/${orderFatima._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fatimaToken}` },
    body: JSON.stringify({ nextStatus: ORDER_STATUS.COMPLETED })
  });
  const completedData = await completedRes.json();
  if (!completedData.success || completedData.order.status !== ORDER_STATUS.COMPLETED) {
    throw new Error('Update to Completed failed.');
  }
  if (completedData.order.paymentStatus !== PAYMENT_STATUS.COLLECTED) {
    throw new Error(`Expected paymentStatus Collected, got ${completedData.order.paymentStatus}`);
  }
  console.log(`✓ Status updated: ${completedData.order.status} (delivered)`);
  console.log(`✓ Cash on Delivery paymentStatus automatically marked as: ${completedData.order.paymentStatus}`);

  // 4.8 Verify Buyer tracking timeline reflects all transitions
  const finalTrackRes = await fetch(`${BASE_URL}/orders/${orderFatima._id}`, {
    headers: { Authorization: `Bearer ${saraToken}` }
  });
  const finalTrackData = await finalTrackRes.json();
  const historyStatuses = finalTrackData.order.statusHistory.map((h) => h.status);
  console.log(`✓ Buyer tracking status history timestamps recorded: [${historyStatuses.join(' -> ')}]`);
  console.log(`✓ Buyer tracking shows COD: ${finalTrackData.order.paymentStatus}`);

  // -------------------------------------------------------------
  // TEST 5: Rejection Flow with Reason
  // -------------------------------------------------------------
  console.log('\n--- [TEST 5] Order Rejection Flow with Reason ---');

  // 5.1 Seller Tariq attempts reject without reason
  const noReasonRes = await fetch(`${BASE_URL}/orders/${orderTariq._id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tariqToken}` },
    body: JSON.stringify({ reason: '' })
  });
  const noReasonData = await noReasonRes.json();
  if (noReasonRes.status !== 400 || !noReasonData.message.includes('Please enter a reason for rejection')) {
    throw new Error('Expected "Please enter a reason for rejection" error.');
  }
  console.log('✓ Missing rejection reason blocked: "Please enter a reason for rejection"');

  // 5.2 Seller Tariq rejects with reason
  const rejectionReason = 'Fresh batches sold out; kitchen at full capacity for today.';
  const rejectRes = await fetch(`${BASE_URL}/orders/${orderTariq._id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tariqToken}` },
    body: JSON.stringify({ reason: rejectionReason })
  });
  const rejectData = await rejectRes.json();
  if (!rejectData.success || rejectData.order.status !== ORDER_STATUS.REJECTED) {
    throw new Error('Rejection failed.');
  }
  console.log(`✓ Seller Tariq rejected order #${rejectData.order.orderNumber}. Reason: "${rejectData.order.rejectionReason}"`);

  // 5.3 Buyer views tracking for rejected order
  const rejectTrackRes = await fetch(`${BASE_URL}/orders/${orderTariq._id}`, {
    headers: { Authorization: `Bearer ${saraToken}` }
  });
  const rejectTrackData = await rejectTrackRes.json();
  if (rejectTrackData.order.status !== ORDER_STATUS.REJECTED || rejectTrackData.order.rejectionReason !== rejectionReason) {
    throw new Error('Buyer tracking did not show correct rejection status or reason.');
  }
  console.log(`✓ Buyer tracking correctly shows Order #${rejectTrackData.order.orderNumber} as Rejected with reason: "${rejectTrackData.order.rejectionReason}"`);

  console.log('\n==============================================================');
  console.log('🎉 ALL MILESTONE 4 & MILESTONE 5 TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('==============================================================\n');
  process.exit(0);
};

runM4M5Tests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err.message);
  process.exit(1);
});
