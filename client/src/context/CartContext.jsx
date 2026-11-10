import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);

  const triggerBadgeBump = () => {
    setBadgeBump(true);
    setTimeout(() => setBadgeBump(false), 300);
  };

  // Fetch cart from backend for logged-in buyer
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'buyer') {
      setCart(null);
      setItems([]);
      setCartCount(0);
      setTotalPrice(0);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data?.success) {
        setCart(res.data.cart);
        setItems(res.data.items || res.data.cart?.items || []);
        setCartCount(res.data.cartCount || 0);
        setTotalPrice(res.data.totalPrice || 0);
      }
    } catch (err) {
      console.error('[CartContext] Failed to load cart:', err.message);
      setCart(null);
      setItems([]);
      setCartCount(0);
      setTotalPrice(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item with options and quantity
  const addToCart = async (item, options = {}) => {
    const {
      quantity = 1,
      selectedSize = null,
      selectedFlavor = null,
      customizationNote = ''
    } = options;

    try {
      const res = await api.post('/cart/items', {
        itemId: item._id,
        quantity,
        selectedSize,
        selectedFlavor,
        customizationNote
      });

      if (res.data?.success) {
        setCart(res.data.cart);
        setItems(res.data.items || res.data.cart?.items || []);
        setCartCount(res.data.cartCount || 0);
        setTotalPrice(res.data.totalPrice || 0);
        triggerBadgeBump();
        return { success: true, message: res.data.message || 'Item added to cart' };
      }
      return { success: false, message: res.data?.message || 'Server error. Item was not added.' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Server error. Item was not added.';
      throw new Error(msg);
    }
  };

  // Update item quantity or options
  const updateCartItem = async (cartItemId, updates = {}) => {
    try {
      const res = await api.put(`/cart/items/${cartItemId}`, updates);
      if (res.data?.success) {
        setCart(res.data.cart);
        setItems(res.data.items || res.data.cart?.items || []);
        setCartCount(res.data.cartCount || 0);
        setTotalPrice(res.data.totalPrice || 0);
        triggerBadgeBump();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Server error. Cart was not updated.' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Server error. Cart was not updated.';
      throw new Error(msg);
    }
  };

  // Quick quantity increment/decrement helper
  const updateQuantity = async (cartItemId, newQuantity) => {
    return updateCartItem(cartItemId, { quantity: newQuantity });
  };

  // Remove single item from cart
  const removeItem = async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/items/${cartItemId}`);
      if (res.data?.success) {
        setCart(res.data.cart);
        setItems(res.data.items || res.data.cart?.items || []);
        setCartCount(res.data.cartCount || 0);
        setTotalPrice(res.data.totalPrice || 0);
        triggerBadgeBump();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Server error. Item was not removed.' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Server error. Item was not removed.';
      throw new Error(msg);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.data?.success) {
        setCart(res.data.cart);
        setItems(res.data.items || []);
        setCartCount(res.data.cartCount || 0);
        setTotalPrice(res.data.totalPrice || 0);
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Server error. Cart was not updated.');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        totalPrice,
        loading,
        badgeBump,
        addToCart,
        updateCartItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
