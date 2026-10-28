"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Agentation } from "agentation";
import { CartProvider } from "@/lib/cart/cartContext";
import { WishlistProvider } from "@/lib/wishlist/wishlistContext";

export function QueryProvider({ children }: { children: ReactNode }) {
  // One client per browser session, created lazily so it is never shared
  // across requests on the server.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <CartProvider>
        <WishlistProvider>
        {children}
        {process.env.NODE_ENV === "development" ? (
          <>
            <ReactQueryDevtools initialIsOpen={false} />
            <Agentation />
          </>
        ) : null}
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}
