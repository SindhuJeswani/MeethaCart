import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';

/**
 * @desc    Get all active categories for public browsing
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all categories for admin management with item counts
 * @route   GET /api/categories/admin/all
 * @access  Protected (Admin)
 */
export const getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    // Attach item count to each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const itemCount = await Item.countDocuments({ category: cat._id });
        return {
          ...cat.toObject(),
          itemCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      categories: categoriesWithCounts
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create new bakery category
 * @route   POST /api/categories
 * @access  Protected (Admin)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const trimmedName = name.trim();
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.'
      });
    }

    const category = await Category.create({
      name: trimmedName,
      description: description ? description.trim() : '',
      image: image || '',
      isActive: isActive !== undefined ? isActive : true
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update existing category
 * @route   PUT /api/categories/:id
 * @access  Protected (Admin)
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    if (name && name.trim() !== category.name) {
      const trimmedName = name.trim();
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
        _id: { $ne: id }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name already exists.'
        });
      }
      category.name = trimmedName;
    }

    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete category (with integrity check for attached items)
 * @route   DELETE /api/categories/:id
 * @access  Protected (Admin)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    // Integrity check: Ensure no bakery items are associated with this category
    const linkedItemCount = await Item.countDocuments({ category: id });
    if (linkedItemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete '${category.name}' because ${linkedItemCount} bakery item(s) are currently attached to it. Please reassign or delete those items first.`
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Category '${category.name}' deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
