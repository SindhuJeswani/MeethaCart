import { Cart } from '../models/Cart.js';
import { Item } from '../models/Item.js';

const getCartSummary = (cart) => {
  const requestedByItem = new Map();
  for (const entry of cart?.items || []) {
    const itemId = entry.item?._id ? entry.item._id.toString() : (entry.item ? entry.item.toString() : null);
    if (itemId) {
      requestedByItem.set(itemId, (requestedByItem.get(itemId) || 0) + (entry.quantity || 1));
    }
  }

  const items = (cart?.items || []).map((entry) => {
    const entryObj = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };
    const liveItem = entry.item;
    let unavailableReason = '';

    if (!liveItem || typeof liveItem !== 'object' || !liveItem._id) {
      unavailableReason = 'Item no longer exists';
    } else {
      const seller = liveItem.seller;
      const sellerStatus = seller && typeof seller === 'object' ? seller.sellerStatus : null;

      if (liveItem.approvalStatus !== 'Approved') {
        unavailableReason = 'Item is not approved';
      } else if (sellerStatus === 'blocked') {
        unavailableReason = 'Seller is blocked';
      } else if (sellerStatus && sellerStatus !== 'approved') {
        unavailableReason = 'Seller is not approved';
      } else if (!liveItem.isAvailable) {
        unavailableReason = 'Item is marked unavailable';
      } else {
        const itemIdStr = liveItem._id.toString();
        const totalRequested = requestedByItem.get(itemIdStr) || entry.quantity;
        if (!Number.isFinite(liveItem.stock) || liveItem.stock <= 0) {
          unavailableReason = 'Item is out of stock';
        } else if (liveItem.stock < totalRequested) {
          unavailableReason = `Only ${liveItem.stock} available in stock`;
        }
      }
    }

    return {
      ...entryObj,
      isUnavailable: Boolean(unavailableReason),
      unavailableReason
    };
  });

  return {
    items,
    totalPrice: items.reduce((sum, entry) => sum + (entry.price || 0) * (entry.quantity || 1), 0),
    cartCount: items.reduce((sum, entry) => sum + (entry.quantity || 1), 0),
    hasUnavailableItems: items.some((entry) => entry.isUnavailable)
  };
};

const validateOptions = (item, selectedSize, selectedFlavor) => {
  const size = typeof selectedSize === 'string' ? selectedSize.trim() : '';
  const flavor = typeof selectedFlavor === 'string' ? selectedFlavor.trim() : '';
  const validSize = item.sizes?.some((option) => option.name?.toLowerCase() === size.toLowerCase());
  const validFlavor = item.flavors?.some(
    (option) => typeof option === 'string' && option.toLowerCase() === flavor.toLowerCase()
  );

  if ((item.sizes?.length && !validSize) || (!item.sizes?.length && size)) {
    return 'Please select a valid size';
  }
  if ((item.flavors?.length && !validFlavor) || (!item.flavors?.length && flavor)) {
    return 'Please select a valid flavor';
  }
  return '';
};

/**
 * @desc    Get current buyer's shopping cart
 * @route   GET /api/cart
 * @access  Protected (Buyer)
 */
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyer: req.user._id }).populate({
      path: 'items.item',
      populate: {
        path: 'seller',
        select: 'name bakeryName phone address sellerStatus'
      }
    });

    if (!cart) {
      cart = await Cart.create({ buyer: req.user._id, items: [] });
    }

    const summary = getCartSummary(cart);

    return res.status(200).json({
      success: true,
      cart,
      ...summary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error. Unable to load cart.'
    });
  }
};

/**
 * @desc    Add item with options and quantity to buyer's cart
 * @route   POST /api/cart/items
 * @access  Protected (Buyer)
 */
export const addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1, selectedSize, selectedFlavor, customizationNote } = req.body;

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid quantity'
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    const item = await Item.findById(itemId).populate('seller');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'This item is currently unavailable'
      });
    }

    // Availability and approval validation
    if (
      !item.isAvailable ||
      item.approvalStatus !== 'Approved' ||
      item.stock <= 0 ||
      item.seller?.sellerStatus !== 'approved'
    ) {
      return res.status(400).json({
        success: false,
        message: 'This item is currently unavailable'
      });
    }

    // Stock validation
    if (qty > item.stock) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity is not available'
      });
    }

    const optionError = validateOptions(item, selectedSize, selectedFlavor);
    if (optionError) {
      return res.status(400).json({ success: false, message: optionError });
    }

    // Determine unit price based on selected size (if item defines sizes with price)
    let unitPrice = item.price;
    if (selectedSize && item.sizes && item.sizes.length > 0) {
      const matchedSize = item.sizes.find(
        (s) => s.name?.toLowerCase() === selectedSize.trim().toLowerCase()
      );
      if (matchedSize && matchedSize.price && matchedSize.price > 0) {
        unitPrice = matchedSize.price;
      }
    }

    const note = item.allowsCustomization && typeof customizationNote === 'string' ? customizationNote.trim() : '';

    let cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) {
      cart = new Cart({ buyer: req.user._id, items: [] });
    }

    const requestedQuantity = cart.items
      .filter((entry) => entry.item.toString() === item._id.toString())
      .reduce((sum, entry) => sum + entry.quantity, 0);
    if (requestedQuantity + qty > item.stock) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity is not available'
      });
    }

    // Check if an existing line item in cart has the exact same options
    const existingIndex = cart.items.findIndex(
      (entry) =>
        entry.item.toString() === item._id.toString() &&
        (entry.selectedSize || null) === (selectedSize || null) &&
        (entry.selectedFlavor || null) === (selectedFlavor || null) &&
        (entry.customizationNote || '') === note
    );

    if (existingIndex > -1) {
      const updatedQty = cart.items[existingIndex].quantity + qty;
      cart.items[existingIndex].quantity = updatedQty;
      cart.items[existingIndex].price = unitPrice;
      cart.items[existingIndex].itemTitle = item.title;
    } else {
      cart.items.push({
        item: item._id,
        itemTitle: item.title,
        quantity: qty,
        selectedSize: selectedSize || null,
        selectedFlavor: selectedFlavor || null,
        customizationNote: note,
        price: unitPrice
      });
    }

    await cart.save();

    await cart.populate({
      path: 'items.item',
      populate: { path: 'seller', select: 'name bakeryName phone address sellerStatus' }
    });

    const summary = getCartSummary(cart);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully.',
      cart,
      ...summary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error. Item was not added.'
    });
  }
};

/**
 * @desc    Update quantity or selected options of an item in buyer's cart
 * @route   PUT /api/cart/items/:id
 * @access  Protected (Buyer)
 */
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, selectedSize, selectedFlavor, customizationNote } = req.body;

    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const cartItem = cart.items.id(id);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    const product = await Item.findById(cartItem.item).populate('seller');
    if (!product || !product.isAvailable || product.approvalStatus !== 'Approved' || product.seller?.sellerStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity is not available'
      });
    }

    const nextSize = selectedSize === undefined ? cartItem.selectedSize : selectedSize;
    const nextFlavor = selectedFlavor === undefined ? cartItem.selectedFlavor : selectedFlavor;
    const optionError = validateOptions(product, nextSize, nextFlavor);
    if (optionError) {
      return res.status(400).json({ success: false, message: optionError });
    }

    if (quantity !== undefined) {
      const parsedQty = Number(quantity);
      if (!Number.isInteger(parsedQty) || parsedQty < 1) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid quantity'
        });
      }
      const requestedElsewhere = cart.items
        .filter((entry) => entry.item.toString() === product._id.toString() && entry._id.toString() !== cartItem._id.toString())
        .reduce((sum, entry) => sum + entry.quantity, 0);
      if (requestedElsewhere + parsedQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Requested quantity is not available'
        });
      }
      cartItem.quantity = parsedQty;
    }

    if (selectedSize !== undefined) {
      cartItem.selectedSize = selectedSize;
      if (selectedSize && product.sizes && product.sizes.length > 0) {
        const matched = product.sizes.find(
          (s) => s.name?.toLowerCase() === selectedSize.trim().toLowerCase()
        );
        if (matched && matched.price && matched.price > 0) {
          cartItem.price = matched.price;
        } else {
          cartItem.price = product.price;
        }
      } else {
        cartItem.price = product.price;
      }
    }

    if (selectedFlavor !== undefined) {
      cartItem.selectedFlavor = selectedFlavor;
    }

    if (customizationNote !== undefined) {
      cartItem.customizationNote =
        product.allowsCustomization && typeof customizationNote === 'string'
          ? customizationNote.trim()
          : '';
    }

    await cart.save();

    await cart.populate({
      path: 'items.item',
      populate: { path: 'seller', select: 'name bakeryName phone address sellerStatus' }
    });

    const summary = getCartSummary(cart);

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully.',
      cart,
      ...summary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error. Cart was not updated.'
    });
  }
};

/**
 * @desc    Remove an item from buyer's cart
 * @route   DELETE /api/cart/items/:id
 * @access  Protected (Buyer)
 */
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const beforeLen = cart.items.length;
    cart.items = cart.items.filter((entry) => {
      const entryId = entry._id ? entry._id.toString() : '';
      const itemId = entry.item?._id ? entry.item._id.toString() : (entry.item ? entry.item.toString() : '');
      return entryId !== id && itemId !== id;
    });

    if (cart.items.length === beforeLen) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    await cart.save();

    await cart.populate({
      path: 'items.item',
      populate: { path: 'seller', select: 'name bakeryName phone address sellerStatus' }
    });

    const summary = getCartSummary(cart);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart,
      ...summary
    });
  } catch (error) {
    console.error('[removeCartItem Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Item was not removed.'
    });
  }
};

/**
 * @desc    Clear all items from buyer's cart
 * @route   DELETE /api/cart
 * @access  Protected (Buyer)
 */
export const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyer: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    } else {
      cart = await Cart.create({ buyer: req.user._id, items: [] });
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      cart,
      items: [],
      totalPrice: 0,
      cartCount: 0,
      hasUnavailableItems: false
    });
  } catch (error) {
    console.error('[clearCart Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Cart was not updated.'
    });
  }
};
