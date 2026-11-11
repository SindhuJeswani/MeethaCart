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
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Protected
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, bakeryName, address, storeAddress, avatar, role, preferredLanguage } = req.body;

    // Admin-only protection: reject any attempt to elevate role to admin
    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Modifying role to admin is strictly prohibited.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty'
        });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      const trimmedPhone = phone.trim();
      if (trimmedPhone) {
        // Must be a valid phone format (e.g. 03XXXXXXXXX or +923XXXXXXXXX, 10-14 digits)
        const cleanDigits = trimmedPhone.replace(/[\s-]/g, '');
        if (!/^(03\d{9}|\+923\d{9}|\d{10,13})$/.test(cleanDigits)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid phone number'
          });
        }
      }
      user.phone = trimmedPhone;
    }

    if (preferredLanguage !== undefined) {
      if (['English', 'Urdu'].includes(preferredLanguage)) {
        user.preferredLanguage = preferredLanguage;
      }
    }

    if (bio !== undefined) user.bio = bio.trim();
    if (address !== undefined) user.address = address.trim();
    if (storeAddress !== undefined) user.storeAddress = storeAddress.trim();
    if (avatar !== undefined) user.avatar = avatar;

    // Sellers can update their bakery brand name
    if (user.role === 'seller' && bakeryName !== undefined) {
      if (!bakeryName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Store name is required'
        });
      }
      user.bakeryName = bakeryName.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error. Profile was not updated.'
    });
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
    }).select('name bakeryName bio avatar address createdAt sellerStatus isVerified isBlocked');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller / Bakery not found.'
      });
    }

    if (seller.isBlocked || seller.sellerStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Seller / Bakery not found.'
      });
    }

    // Dynamic import to prevent circular dependency if Item model is loaded later
    let items = [];
    if (seller.sellerStatus === 'approved' && !seller.isBlocked) {
      const { Item } = await import('../models/Item.js');
      items = await Item.find({
        seller: id,
        isAvailable: true,
        stock: { $gt: 0 },
        approvalStatus: 'Approved'
      })
        .populate('category', 'name slug')
        .populate('seller', 'name bakeryName avatar address sellerStatus');
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
