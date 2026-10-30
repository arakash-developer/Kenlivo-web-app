import type { ProductListQuery } from "./types";

/** Centralized, type-safe React Query keys. */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params: ProductListQuery = {}) => ["products", "list", params] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: ["categories", "list"] as const,
  },
  collections: {
    list: ["collections", "list"] as const,
  },
  cart: {
    me: ["cart", "me"] as const,
  },
  orders: {
    mine: ["orders", "mine"] as const,
    all: ["orders", "all"] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: Record<string, unknown> = {}) => ["users", "list", params] as const,
  },
};
