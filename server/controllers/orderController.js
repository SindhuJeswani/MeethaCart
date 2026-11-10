import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Item } from '../models/Item.js';
import {
  ORDER_STATUS,
  ORDER_LIFECYCLE,
  NEXT_ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS
} from '../config/orderConstants.js';

/**
 * Generate unique human-readable order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MC-${timestamp}-${random}`;
};

/**
 * @desc    Place order from current buyer's cart (One separate order per seller)
 * @route   POST /api/orders
 * @access  Protected (Buyer)
 */
export const createOrder = async (req, res) => {
  try {
    const { deliveryAddress, contactNumber, note, paymentMethod } = req.body;

    // Validate delivery details
    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a delivery address'
      });
    }

    if (!contactNumber || !contactNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a contact number'
      });
    }

    // Payment method validation: COD only
    if (paymentMethod && paymentMethod !== PAYMENT_METHOD.COD && paymentMethod.toLowerCase() !== 'cod') {
      return res.status(400).json({
        success: false,
        message: 'Only Cash on Delivery (COD) is supported'
      });
    }

    // Retrieve buyer's cart
    const cart = await Cart.findOne({ buyer: req.user._id }).populate({
      path: 'items.item',
      populate: { path: 'seller', select: 'name bakeryName sellerStatus' }
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    const requestedByItem = new Map();
    for (const entry of cart.items) {
      const itemId = entry.item?._id?.toString();
      if (itemId) {
        requestedByItem.set(itemId, (requestedByItem.get(itemId) || 0) + entry.quantity);
      }
    }

    // Re-check live item, stock, approval and seller status before checkout.
    for (const entry of cart.items) {
      const liveItem = entry.item
        ? await Item.findById(entry.item._id).populate('seller')
        : null;
      let unavailableReason = '';

      if (!liveItem) {
        unavailableReason = 'no longer exists';
      } else if (liveItem.approvalStatus !== 'Approved') {
        unavailableReason = 'is not approved';
      } else if (liveItem.seller?.sellerStatus !== 'approved') {
        unavailableReason = 'is from a seller who is not approved';
      } else if (!liveItem.isAvailable) {
        unavailableReason = 'is marked unavailable';
      } else if (!Number.isFinite(liveItem.stock) || liveItem.stock < requestedByItem.get(liveItem._id.toString())) {
        unavailableReason = 'does not have enough stock';
      }

      if (unavailableReason) {
        return res.status(400).json({
          success: false,
          message: `${entry.item?.title || entry.itemTitle || 'An item in your cart'} ${unavailableReason}. Please remove it and try again.`
        });
      }
    }

    // Group cart items by seller: ONE SEPARATE ORDER PER SELLER
    const itemsBySeller = new Map();

    for (const entry of cart.items) {
      const sellerId = entry.item.seller?._id
        ? entry.item.seller._id.toString()
        : entry.item.seller.toString();

      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, []);
      }

      itemsBySeller.get(sellerId).push({
        item: entry.item._id,
        name: entry.item.title,
        selectedSize: entry.selectedSize || null,
        selectedFlavor: entry.selectedFlavor || null,
        quantity: entry.quantity,
        price: entry.price,
        customizationNote: entry.customizationNote || ''
      });
    }

    const createdOrders = [];

    // Create separate order per seller
    for (const [sellerId, sellerItems] of itemsBySeller.entries()) {
      const totalAmount = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const orderNumber = generateOrderNumber();

      const order = await Order.create({
        orderNumber,
        buyer: req.user._id,
        seller: sellerId,
        items: sellerItems,
        totalAmount,
        deliveryAddress: deliveryAddress.trim(),
        contactNumber: contactNumber.trim(),
        note: note ? note.trim() : '',
        paymentMethod: PAYMENT_METHOD.COD,
        paymentStatus: PAYMENT_STATUS.PENDING,
        status: ORDER_STATUS.PLACED,
        statusHistory: [
          {
            status: ORDER_STATUS.PLACED,
            timestamp: new Date(),
            note: 'Order placed by buyer'
          }
        ],
        rejectionReason: null
      });

      // Decrement item stock in DB
      for (const it of sellerItems) {
        await Item.findByIdAndUpdate(it.item, {
          $inc: { stock: -it.quantity }
        });
      }

      createdOrders.push(order);
    }

    // Clear buyer's cart after successful order creation
    cart.items = [];
    await cart.save();

    // Populate seller info for immediate confirmation view
    const populatedOrders = await Order.find({
      _id: { $in: createdOrders.map((o) => o._id) }
    })
      .populate('seller', 'name bakeryName phone address')
      .populate('buyer', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Order(s) placed successfully.',
      orders: populatedOrders,
      orderCount: populatedOrders.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error. Order was not placed.'
    });
  }
};

/**
 * @desc    Get order details / tracking by ID (Owner buyer only)
 * @route   GET /api/orders/:id
 * @access  Protected
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = {};
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = id;
    } else {
      query.orderNumber = id;
    }

    const order = await Order.findOne(query)
      .populate('seller', 'name bakeryName phone address')
      .populate('buyer', 'name email phone address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Order tracking is private to the buyer who placed the order.
    const isOwnerBuyer = order.buyer?._id?.toString() === req.user._id.toString();

    if (!isOwnerBuyer) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access. You do not have permission to view this order.'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error. Unable to load order.'
    });
  }
};

/**
 * @desc    Get seller's own incoming orders
 * @route   GET /api/orders/seller/my-orders
 * @access  Protected (Seller, Admin)
 */
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId =
      req.user.role === 'admin' && req.query.sellerId
        ? req.query.sellerId
        : req.user._id;

    const orders = await Order.find({ seller: sellerId })
      .populate('buyer', 'name email phone')
      .populate('seller', 'name bakeryName phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error. Unable to load seller orders.'
    });
  }
};

/**
 * @desc    Accept order with status 'Placed' (Placed -> Accepted)
 * @route   PATCH /api/orders/:id/accept
 * @access  Protected (Seller, Admin)
 */
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only manage orders for your own bakery.'
      });
    }

    // If order was already processed
    if (order.status !== ORDER_STATUS.PLACED) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been processed'
      });
    }

    order.status = ORDER_STATUS.ACCEPTED;
    order.statusHistory.push({
      status: ORDER_STATUS.ACCEPTED,
      timestamp: new Date(),
      note: 'Order accepted by baker'
    });

    await order.save();

    await order.populate('buyer', 'name email phone');
    await order.populate('seller', 'name bakeryName phone');

    return res.status(200).json({
      success: true,
      message: 'Order accepted successfully.',
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error. Status was not updated.'
    });
  }
};

/**
 * @desc    Reject order with status 'Placed' (Placed -> Rejected, reason required)
 * @route   PATCH /api/orders/:id/reject
 * @access  Protected (Seller, Admin)
 */
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a reason for rejection'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only manage orders for your own bakery.'
      });
    }

    // If order was already processed
    if (order.status !== ORDER_STATUS.PLACED) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been processed'
      });
    }

    order.status = ORDER_STATUS.REJECTED;
    order.rejectionReason = reason.trim();
    order.statusHistory.push({
      status: ORDER_STATUS.REJECTED,
      timestamp: new Date(),
      note: reason.trim()
    });

    // Restore stock of items since order is rejected
    for (const it of order.items) {
      if (it.item) {
        await Item.findByIdAndUpdate(it.item, {
          $inc: { stock: it.quantity }
        });
      }
    }

    await order.save();

    await order.populate('buyer', 'name email phone');
    await order.populate('seller', 'name bakeryName phone');

    return res.status(200).json({
      success: true,
      message: 'Order rejected.',
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error. Status was not updated.'
    });
  }
};

/**
 * @desc    Advance order status to next sequential step only
 *          Placed -> Accepted -> Preparing -> Ready -> Completed
 * @route   PATCH /api/orders/:id/status
 * @access  Protected (Seller, Admin)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { nextStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only manage orders for your own bakery.'
      });
    }

    // If order is completed or rejected, no further transitions
    if (order.status === ORDER_STATUS.COMPLETED || order.status === ORDER_STATUS.REJECTED) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status change. Please follow the order steps'
      });
    }

    // The allowed next status according to strict lifecycle
    const expectedNext = NEXT_ORDER_STATUS[order.status];

    // Determine target next status (use explicit nextStatus or default to expected next)
    const targetStatus = nextStatus || expectedNext;

    if (!expectedNext || targetStatus !== expectedNext) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status change. Please follow the order steps'
      });
    }

    order.status = targetStatus;
    order.statusHistory.push({
      status: targetStatus,
      timestamp: new Date(),
      note: `Status updated to ${targetStatus}`
    });

    // M5-3: When the seller marks the order "Completed", paymentStatus automatically becomes "Collected"
    if (targetStatus === ORDER_STATUS.COMPLETED) {
      order.paymentStatus = PAYMENT_STATUS.COLLECTED;
    }

    await order.save();

    await order.populate('buyer', 'name email phone');
    await order.populate('seller', 'name bakeryName phone');

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${targetStatus}.`,
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error. Status was not updated.'
    });
  }
};
