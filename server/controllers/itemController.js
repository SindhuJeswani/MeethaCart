import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Category } from '../models/Category.js';

/**
 * @desc    Get all bakery items with live search & multi-filtering
 * @route   GET /api/items
 * @access  Public
 */
export const getItems = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      seller,
      isEggless,
      sort,
      page = 1,
      limit = 24
    } = req.query;

    const query = { isAvailable: true, approvalStatus: 'Approved', stock: { $gt: 0 } };

    // 1. Keyword search (matches title or description)
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ];
    }

    // 2. Category filter (supports either ObjectId or category slug)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCat = await Category.findOne({ slug: category });
        if (foundCat) {
          query.category = foundCat._id;
        }
      }
    }

    // 3. Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Filter: Milestone 3 only displays items from verified, approved home bakers
    const approvedSellers = await User.find({
      role: 'seller',
      sellerStatus: 'approved'
    }).distinct('_id');

    if (seller && seller.match(/^[0-9a-fA-F]{24}$/)) {
      if (!approvedSellers.some(id => id.toString() === seller)) {
        return res.status(200).json({
          success: true,
          total: 0,
          count: 0,
          page: 1,
          pages: 1,
          items: []
        });
      }
      query.seller = seller;
    } else {
      query.seller = { $in: approvedSellers };
    }

    // 5. Dietary filter (Eggless)
    if (isEggless !== undefined && isEggless !== '') {
      query.isEggless = isEggless === 'true' || isEggless === true;
    }

    // 6. Sorting strategy
    let sortOption = { createdAt: -1 }; // Default newest first
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const parsedLimit = limit === 'all' ? null : Math.min(Math.max(Number(limit) || 24, 1), 100);
    const parsedPage = Math.max(Number(page) || 1, 1);
    const total = await Item.countDocuments(query);
    const pageSize = parsedLimit || Math.max(total, 1);
    const skip = (parsedPage - 1) * pageSize;
    const items = await Item.find(query)
      .populate('seller', 'name bakeryName avatar phone address sellerStatus')
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      total,
      totalCount: total,
      count: items.length,
      page: parsedPage,
      pages: parsedLimit ? Math.ceil(total / pageSize) || 1 : 1,
      totalPages: parsedLimit ? Math.ceil(total / pageSize) || 1 : 1,
      items
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single bakery item details with seller card & related items
 * @route   GET /api/items/:id
 * @access  Public
 */
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Guard against malformed IDs before hitting Mongoose (prevents 500 CastError)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format.'
      });
    }

    const item = await Item.findById(id)
      .populate('seller', 'name bakeryName bio avatar phone address createdAt sellerStatus')
      .populate('category', 'name slug description');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Bakery item not found.'
      });
    }

    // Check permissions if item is not Approved or seller is not approved
    const isApprovedItemAndSeller =
      item.approvalStatus === 'Approved' && item.seller?.sellerStatus === 'approved';

    if (!isApprovedItemAndSeller) {
      // Check if viewing user is the owner seller or an admin
      let isAuthorized = false;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meethacart_jwt_secret');
          const user = await User.findById(decoded.id);
          if (user) {
            if (user.role === 'admin' || user._id.toString() === item.seller?._id?.toString()) {
              isAuthorized = true;
            }
          }
        } catch (e) {
          // Token invalid or expired
        }
      }

      if (!isAuthorized) {
        return res.status(404).json({
          success: false,
          message: 'Bakery item not found.'
        });
      }
    }

    // Related items from same category (must be Approved and from approved sellers)
    const approvedSellers = await User.find({
      role: 'seller',
      sellerStatus: 'approved'
    }).distinct('_id');

    const relatedItems = await Item.find({
      category: item.category?._id,
      _id: { $ne: item._id },
      isAvailable: true,
      approvalStatus: 'Approved',
      stock: { $gt: 0 },
      seller: { $in: approvedSellers }
    })
      .limit(4)
      .populate('seller', 'name bakeryName avatar sellerStatus')
      .populate('category', 'name slug')
      .select('title price stock isAvailable approvalStatus images isEggless preparationTimeHours sizes flavors allowsCustomization');

    return res.status(200).json({
      success: true,
      item,
      relatedItems
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get items belonging to the authenticated seller
 * @route   GET /api/items/seller/my-items
 * @access  Protected (Seller)
 */
export const getMyItems = async (req, res) => {
  try {
    // Admin bypass: allow admin to inspect any seller's inventory via query param
    const targetSellerId =
      req.user.role === 'admin' && req.query.sellerId
        ? req.query.sellerId
        : req.user._id;

    const items = await Item.find({ seller: targetSellerId })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create new bakery item (Approved sellers only)
 * @route   POST /api/items
 * @access  Protected (Approved Seller)
 */
export const createItem = async (req, res) => {
  try {
    // Milestone 3 Guard: Blocked or pending sellers cannot publish items
    if (req.user.role === 'seller' && req.user.sellerStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: req.user.sellerStatus === 'blocked'
          ? 'Your seller account has been suspended by the Admin. You cannot publish items.'
          : 'Your seller account is pending admin review. You can list items once your profile is approved.'
      });
    }
    const {
      title,
      description,
      category,
      price,
      stock,
      isEggless,
      preparationTimeHours,
      sizes,
      flavors,
      allowsCustomization,
      images: imageUrls
    } = req.body;

    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and price are required.'
      });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 1) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number.'
      });
    }

    const numericStock = stock !== undefined ? Number(stock) : 0;
    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be negative.'
      });
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not exist.'
      });
    }

    // Collect images: uploaded file paths or URL array
    const imageList = [];

    // From Multer upload files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        imageList.push(`/uploads/${file.filename}`);
      });
    }

    // From JSON URLs (if provided)
    if (imageUrls) {
      if (Array.isArray(imageUrls)) {
        imageList.push(...imageUrls);
      } else if (typeof imageUrls === 'string') {
        imageList.push(imageUrls);
      }
    }

    // Fallback placeholder image if none provided
    if (imageList.length === 0) {
      imageList.push('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop');
    }

    // Parse optional sizes & flavors
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        parsedSizes = [];
      }
    }

    let parsedFlavors = [];
    if (flavors) {
      try {
        parsedFlavors = typeof flavors === 'string' ? JSON.parse(flavors) : flavors;
      } catch (e) {
        if (typeof flavors === 'string') {
          parsedFlavors = flavors.split(',').map(f => f.trim()).filter(Boolean);
        }
      }
    }

    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      category,
      seller: req.user._id,
      price: numericPrice,
      stock: numericStock,
      isEggless: isEggless === 'true' || isEggless === true,
      preparationTimeHours: Number(preparationTimeHours) || 24,
      images: imageList,
      sizes: parsedSizes,
      flavors: parsedFlavors,
      allowsCustomization: allowsCustomization === 'true' || allowsCustomization === true,
      isAvailable: true,
      approvalStatus: 'Pending',
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null
    });

    const populatedItem = await Item.findById(item._id).populate('category', 'name slug');

    return res.status(201).json({
      success: true,
      message: 'Bakery item published successfully.',
      item: populatedItem
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update existing bakery item (Ownership enforced)
 * @route   PUT /api/items/:id
 * @access  Protected (Approved Seller)
 */
export const updateItem = async (req, res) => {
  try {
    // Milestone 3 Guard: Blocked sellers cannot edit items
    if (req.user.role === 'seller' && req.user.sellerStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: req.user.sellerStatus === 'blocked'
          ? 'Your seller account has been suspended by the Admin. You cannot modify items.'
          : 'Your seller account is pending admin review.'
      });
    }
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Bakery item not found.' });
    }

    // Ownership security check
    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own bakery items.'
      });
    }

    const {
      title,
      description,
      category,
      price,
      stock,
      isEggless,
      preparationTimeHours,
      isAvailable,
      sizes,
      flavors,
      allowsCustomization,
      images: existingImages
    } = req.body;

    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;

    if (price !== undefined) {
      const p = Number(price);
      if (isNaN(p) || p < 1) {
        return res.status(400).json({ success: false, message: 'Price must be at least 1 PKR.' });
      }
      item.price = p;
    }

    if (stock !== undefined) {
      const s = Number(stock);
      if (isNaN(s) || s < 0) {
        return res.status(400).json({ success: false, message: 'Stock cannot be negative.' });
      }
      item.stock = s;
    }

    if (isEggless !== undefined) item.isEggless = isEggless === 'true' || isEggless === true;
    if (preparationTimeHours !== undefined) item.preparationTimeHours = Number(preparationTimeHours);
    if (isAvailable !== undefined) item.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (allowsCustomization !== undefined) item.allowsCustomization = allowsCustomization === 'true' || allowsCustomization === true;

    if (sizes !== undefined) {
      try {
        item.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        // keep existing if invalid
      }
    }

    if (flavors !== undefined) {
      try {
        item.flavors = typeof flavors === 'string' ? JSON.parse(flavors) : flavors;
      } catch (e) {
        if (typeof flavors === 'string') {
          item.flavors = flavors.split(',').map(f => f.trim()).filter(Boolean);
        }
      }
    }

    // Handle uploaded new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      item.images = [...(existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : item.images), ...newImages];
    } else if (existingImages) {
      item.images = Array.isArray(existingImages) ? existingImages : [existingImages];
    }

    // Requirement 7: Every item write by a seller resets approvalStatus to "Pending"
    if (req.user.role === 'seller') {
      item.approvalStatus = 'Pending';
      item.rejectionReason = null;
      item.reviewedBy = null;
      item.reviewedAt = null;
    }

    await item.save();

    const populatedItem = await Item.findById(item._id).populate('category', 'name slug');

    return res.status(200).json({
      success: true,
      message: 'Bakery item updated successfully.',
      item: populatedItem
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete bakery item (Ownership enforced)
 * @route   DELETE /api/items/:id
 * @access  Protected (Approved Seller)
 */
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Bakery item not found.' });
    }

    // Ownership security check
    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own bakery items.'
      });
    }

    await Item.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Bakery item '${item.title}' deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Quick toggle for item availability (pause/resume orders)
 * @route   PATCH /api/items/:id/availability
 * @access  Protected (Approved Seller)
 */
export const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id).populate('category', 'name slug');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    return res.status(200).json({
      success: true,
      isAvailable: item.isAvailable,
      item,
      message: `Item is now ${item.isAvailable ? 'available for orders' : 'paused'}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
