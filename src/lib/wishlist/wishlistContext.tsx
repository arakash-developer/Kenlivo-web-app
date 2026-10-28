"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ProductType } from "@/types/AllDataType";

type WishlistContextType = {
  items: ProductType[];
  addToWishlist: (product: ProductType) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: ProductType) => void;
  isWishlisted: (productId: string) => boolean;
  totalItems: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ProductType[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kenlivo_wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((i) => i?._id));
        }
      }
    } catch {
      localStorage.removeItem("kenlivo_wishlist");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("kenlivo_wishlist", JSON.stringify(items));
  }, [items]);

  const addToWishlist = useCallback((product: ProductType) => {
    setItems((prev) =>
      prev.some((i) => i._id === product._id) ? prev : [...prev, product]
    );
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i._id !== productId));
  }, []);

  const toggleWishlist = useCallback((product: ProductType) => {
    setItems((prev) =>
      prev.some((i) => i._id === product._id)
        ? prev.filter((i) => i._id !== product._id)
        : [...prev, product]
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i._id === productId),
    [items]
  );

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted, totalItems: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
