import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const DEFAULT_SAMPLE_ITEMS = [
  {
    _id: 'cart-1',
    name: 'Artisan Belgian Chocolate Cake',
    nameUrdu: 'بیلجیئن چاکلیٹ کیک',
    price: 2400,
    quantity: 1,
    weight: '2 lbs',
    seller: { name: "Grandma's Oven", bakeryName: "Grandma's Oven Delight" },
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'cart-2',
    name: 'Pistachio Almond Nan Khatai (Box of 12)',
    nameUrdu: 'پستہ بادام نان خطائی',
    price: 950,
    quantity: 2,
    weight: '12 pcs',
    seller: { name: 'Lahore Sweets & Bakes', bakeryName: 'Lahori Heritage Bakes' },
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80'
  }
];

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('meethacart_cart_items');
      return saved ? JSON.parse(saved) : DEFAULT_SAMPLE_ITEMS;
    } catch {
      return DEFAULT_SAMPLE_ITEMS;
    }
  });

  const [badgeBump, setBadgeBump] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('meethacart_cart_items', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const triggerBadgeBump = () => {
    setBadgeBump(true);
    setTimeout(() => setBadgeBump(false), 300);
  };

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          nameUrdu: product.nameUrdu,
          price: product.price,
          quantity: qty,
          weight: product.weight || '1 pc',
          seller: product.seller || { name: 'Home Baker', bakeryName: 'Artisan Bakery' },
          image: product.image || (product.images && product.images[0]) || ''
        }
      ];
    });
    triggerBadgeBump();
  };

  const updateQuantity = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item._id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
    triggerBadgeBump();
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        totalPrice,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        badgeBump
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
