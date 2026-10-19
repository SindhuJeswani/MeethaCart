import { User } from '../models/User.js';

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/users/me
 * @access  Protected
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile & language preference
 * @route   PUT /api/users/profile
 * @access  Protected
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, bakeryName, address, avatar, preferredLanguage } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (address !== undefined) user.address = address.trim();
    if (avatar !== undefined) user.avatar = avatar;

    if (preferredLanguage && ['en', 'ur'].includes(preferredLanguage)) {
      user.preferredLanguage = preferredLanguage;
    }

    // Sellers can update their bakery brand name
    if (user.role === 'seller' && bakeryName) {
      user.bakeryName = bakeryName.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get public seller profile by ID (shareable storefront link)
 * @route   GET /api/users/seller/:id
 * @access  Public
 */
export const getPublicSellerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findOne({
      _id: id,
      role: 'seller'
    }).select('name bakeryName bio avatar address createdAt sellerStatus isVerified');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller / Bakery not found.'
      });
    }

    // Dynamic import to prevent circular dependency if Item model is loaded later
    let items = [];
    try {
      const { Item } = await import('../models/Item.js');
      items = await Item.find({ seller: id, isAvailable: true }).populate('category', 'name slug');
    } catch (e) {
      // Items collection may not have any docs yet
      items = [];
    }

    return res.status(200).json({
      success: true,
      seller: {
        id: seller._id,
        name: seller.name,
        bakeryName: seller.bakeryName || `${seller.name}'s Bakery`,
        bio: seller.bio || 'Passionate homemade baker crafting delicious treats.',
        avatar: seller.avatar || '',
        joinedDate: seller.createdAt,
        status: seller.sellerStatus
      },
      items
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
