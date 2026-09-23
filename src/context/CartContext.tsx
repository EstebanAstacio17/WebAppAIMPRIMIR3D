'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { VolumeTier, StockType } from '@/types/product';

export interface CartItem {
  id: string | number;
  title: string;
  basePrice: number;       // Base price for 1 unit
  price: number;           // Computed unit price according to current quantity tier
  image?: string;
  quantity: number;
  category?: string;
  specs?: string;
  stockType?: StockType;
  stockQuantity?: number;
  volumePricing?: VolumeTier[];
  onDemandPolicies?: string[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: {
    id: string | number;
    title: string;
    price: number;
    image?: string;
    category?: string;
    specs?: string;
    stockType?: StockType;
    stockQuantity?: number;
    volumePricing?: VolumeTier[];
    onDemandPolicies?: string[];
    quantity?: number;
  }) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, delta: number) => void;
  setExactQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  toastMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getComputedUnitPrice(basePrice: number, quantity: number, volumePricing?: VolumeTier[]): number {
  if (!volumePricing || volumePricing.length === 0) {
    return basePrice;
  }
  const matchingTier = volumePricing.find((tier) => {
    const min = tier.minQty || 1;
    const max = tier.maxQty || Infinity;
    return quantity >= min && quantity <= max;
  });
  return matchingTier ? matchingTier.price : basePrice;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aimprimir3d_cart');
      if (saved) {
        const parsed: any[] = JSON.parse(saved);
        // Ensure structure has basePrice and recomputed price
        const upgraded = parsed.map((item) => {
          const base = item.basePrice || item.price;
          return {
            ...item,
            basePrice: base,
            price: getComputedUnitPrice(base, item.quantity, item.volumePricing),
          };
        });
        setItems(upgraded);
      }
    } catch (e) {
      console.error('Error cargando carrito:', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aimprimir3d_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error guardando carrito:', e);
    }
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const addToCart = (product: {
    id: string | number;
    title: string;
    price: number;
    image?: string;
    category?: string;
    specs?: string;
    stockType?: StockType;
    stockQuantity?: number;
    volumePricing?: VolumeTier[];
    onDemandPolicies?: string[];
    quantity?: number;
  }) => {
    const base = product.price;
    const qtyToAdd = product.quantity || 1;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => String(item.id) === String(product.id));
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        const newQty = item.quantity + qtyToAdd;
        const newUnitPrice = getComputedUnitPrice(item.basePrice, newQty, item.volumePricing);
        const updated = [...prev];
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          price: newUnitPrice,
        };
        return updated;
      }

      const unitPrice = getComputedUnitPrice(base, qtyToAdd, product.volumePricing);
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          basePrice: base,
          price: unitPrice,
          image: product.image,
          quantity: qtyToAdd,
          category: product.category,
          specs: product.specs,
          stockType: product.stockType,
          stockQuantity: product.stockQuantity,
          volumePricing: product.volumePricing,
          onDemandPolicies: product.onDemandPolicies,
        },
      ];
    });

    showToast(`✨ "${product.title}" añadido al encargo`);
  };

  const removeFromCart = (id: string | number) => {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
    showToast('🗑️ Artículo eliminado del encargo');
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (String(item.id) === String(id)) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const newUnitPrice = getComputedUnitPrice(item.basePrice, newQty, item.volumePricing);
            return {
              ...item,
              quantity: newQty,
              price: newUnitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const setExactQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (String(item.id) === String(id)) {
          const newUnitPrice = getComputedUnitPrice(item.basePrice, quantity, item.volumePricing);
          return {
            ...item,
            quantity,
            price: newUnitPrice,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    showToast('Carrito vaciado');
  };

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        setExactQuantity,
        clearCart,
        totalCount,
        totalPrice,
        toastMessage,
      }}
    >
      {children}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#0d1117',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '980px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 14px 40px rgba(0,0,0,0.6)',
            fontSize: '0.92rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease-out forwards',
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
