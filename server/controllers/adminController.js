import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';
import { Order } from '../models/Order.js';

/**
 * @desc    Get platform KPI metrics for Admin Dashboard
 * @route   GET /api/admin/metrics
 * @access  Protected (Admin)
 */
export const getMetrics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      pendingSellers,
      approvedSellers,
      blockedSellers,
      totalCategories,
      totalItems,
      totalOrders
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'seller', sellerStatus: 'pending' }),
      User.countDocuments({ role: 'seller', sellerStatus: 'approved' }),
      User.countDocuments({ role: 'seller', sellerStatus: 'blocked' }),
      Category.countDocuments(),
      Item.countDocuments(),
      Order.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalBuyers,
        totalSellers,
        pendingSellers,
        approvedSellers,
        blockedSellers,
        totalCategories,
        totalItems,
        totalOrders
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get sellers with optional status & keyword filters
 * @route   GET /api/admin/sellers
 * @access  Protected (Admin)
 */
export const getSellers = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = { role: 'seller' };

    if (status && ['pending', 'approved', 'blocked'].includes(status)) {
      query.sellerStatus = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { bakeryName: { $regex: term, $options: 'i' } }
      ];
    }

    const sellers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Append item count for each seller
    const enrichedSellers = await Promise.all(
      sellers.map(async (s) => {
        const itemCount = await Item.countDocuments({ seller: s._id });
        return {
          ...s.toObject(),
          itemCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enrichedSellers.length,
      sellers: enrichedSellers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Approve, block, or reset a seller's approval status
 * @route   PATCH /api/admin/sellers/:id/status
 * @access  Protected (Admin)
 */
export const updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: [${validStatuses.join(', ')}]`
      });
    }

    const seller = await User.findOne({ _id: id, role: 'seller' });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found.'
      });
    }

    seller.sellerStatus = status;
    await seller.save();

    return res.status(200).json({
      success: true,
      message: `Seller '${seller.bakeryName || seller.name}' status changed to '${status}'.`,
      seller: {
        id: seller._id,
        name: seller.name,
        bakeryName: seller.bakeryName,
        email: seller.email,
        sellerStatus: seller.sellerStatus
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user directory (buyers, sellers, admins)
 * @route   GET /api/admin/users
 * @access  Protected (Admin)
 */
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role && ['buyer', 'seller', 'admin'].includes(role)) {
      query.role = role;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Orders monitoring endpoint (M2 empty state & structure for M4)
 * @route   GET /api/admin/orders
 * @access  Protected (Admin)
 */
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'name email')
      .populate('seller', 'name bakeryName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
      note: 'Orders module will be fully populated in Milestone 4.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
