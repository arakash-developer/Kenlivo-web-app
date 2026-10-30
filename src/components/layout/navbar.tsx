"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Heart, LogIn, Search, ShoppingBag, Truck, User, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/lib/cart/cartContext";
import { useWishlist } from "@/lib/wishlist/wishlistContext";
import { useCollections } from "@/hooks/useCollections";
import { productsApi } from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/axios";
import type { Product } from "@/lib/api/types";

export function Navbar() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchFormRef = useRef<HTMLFormElement>(null);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { data: collections } = useCollections();
  const navLinks = [
    { href: "/", label: "Home" },
    ...(collections ?? []).map((collection) => ({
      href: `/collections/${encodeURIComponent(collection.slug || collection.name.toLowerCase().replace(/\s+/g, "-"))}`,
      label: collection.name,
    })),
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) return;

    let active = true;
    const timeout = window.setTimeout(() => {
      setSearchLoading(true);
      setSearchError("");
      productsApi
        .list({ search: query, limit: 6 })
        .then(({ items }) => {
          if (active) setSearchResults(items);
        })
        .catch((error: unknown) => {
          if (active) {
            setSearchResults([]);
            setSearchError(getApiErrorMessage(error, "Could not search products."));
          }
        })
        .finally(() => {
          if (active) setSearchLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [search]);

  useEffect(() => {
    function closeSearch(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !searchFormRef.current?.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeSearch);
    return () => document.removeEventListener("pointerdown", closeSearch);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Announcement bar */}
      {!scrolled && (
        <div className="bg-brand-700 px-4 py-1.5 text-center text-[11px] font-medium text-white">
          <span className="mr-6 inline-flex items-center gap-1.5">
            <Truck className="size-3" /> Free shipping on orders over ৳ 1,000
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3" /> 100% Authentic Products
          </span>
        </div>
      )}

      {/* Main navbar */}
      <div className={`border-b bg-bg-page transition-shadow duration-300 ${scrolled ? "shadow-md border-brand-300" : "border-transparent"}`}>
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <div className="flex h-16 items-center gap-4 md:h-[70px] md:gap-6">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <span className="grid size-9 place-items-center md:size-10">
                <Image src="/logo-icon.svg" alt="Kenlivo" width={40} height={40} priority />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-heading text-xl font-bold text-dark-900 md:text-2xl">Kenlivo</span>
                <span className="text-[9px] font-semibold tracking-[0.16em] text-brand-700 uppercase">Beauty Meets Lifestyle</span>
              </span>
            </Link>

            {/* Search */}
            <form
              ref={searchFormRef}
              role="search"
              action="/products"
              className="relative mx-auto hidden h-10 w-full max-w-lg flex-1 items-center sm:flex md:h-11"
            >
              <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-500" aria-hidden="true" />
              <input
                type="search"
                name="search"
                role="combobox"
                value={search}
                autoComplete="off"
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={searchOpen && search.trim().length >= 2}
                aria-controls="product-search-results"
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearch(value);
                  setSearchResults([]);
                  setSearchLoading(value.trim().length >= 2);
                  setSearchError("");
                  setSearchOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSearchOpen(false);
                }}
                placeholder="Search products, brands and more..."
                className="h-full w-full rounded-full border border-brand-400 bg-white pr-12 pl-10 text-sm text-dark-900 outline-none placeholder:text-muted-400 focus:border-brand-700/50 focus:ring-2 focus:ring-brand-700/10"
              />
              <button type="submit" className="absolute right-1.5 grid h-8 w-9 place-items-center rounded-full bg-brand-700 text-white hover:bg-brand-800">
                <Search className="size-3.5" />
              </button>
              {searchOpen && search.trim().length >= 2 && (
                <div
                  id="product-search-results"
                  aria-live="polite"
                  className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-brand-300 bg-white shadow-lg"
                >
                  {searchLoading ? (
                    <p className="px-4 py-3 text-sm text-muted-500">Searching products...</p>
                  ) : searchError ? (
                    <p role="alert" className="px-4 py-3 text-sm text-red-600">
                      {searchError}
                    </p>
                  ) : searchResults.length > 0 ? (
                    <ul aria-label="Product search results" className="max-h-96 overflow-y-auto py-1">
                      {searchResults.map((product) => (
                        <li key={product._id}>
                          <Link
                            href={`/products/${product._id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-brand-50"
                          >
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt=""
                                width={44}
                                height={44}
                                className="size-11 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                                <Search className="size-4" aria-hidden="true" />
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-dark-900">
                                {product.name}
                              </span>
                              <span className="mt-0.5 flex items-center gap-2 text-sm">
                                <span className="font-semibold text-brand-700">
                                  ৳{(product.finalPrice ?? product.price).toLocaleString()}
                                </span>
                                {product.discountPercentage > 0 && (
                                  <del className="text-xs text-muted-400">
                                    ৳{product.price.toLocaleString()}
                                  </del>
                                )}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 text-sm text-muted-500">
                      No products found.
                    </p>
                  )}
                  <Link
                    href={`/products?search=${encodeURIComponent(search.trim())}`}
                    onClick={() => setSearchOpen(false)}
                    className="block border-t border-brand-200 px-4 py-3 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    View all search results
                  </Link>
                </div>
              )}
            </form>

            {/* Icons */}
            <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
              {user ? (
                <Link href="/profile" aria-label="Account" className="grid size-9 place-items-center rounded-full text-dark-900 hover:bg-brand-700/10 hover:text-brand-700">
                  <User className="size-5" />
                </Link>
              ) : (
                <Link href="/login" aria-label="Sign in" className="grid size-9 place-items-center rounded-full text-dark-900 hover:bg-brand-700/10 hover:text-brand-700">
                  <LogIn className="size-5" />
                </Link>
              )}
              <Link href="/wishlist" aria-label="Wishlist" className="relative grid size-9 place-items-center rounded-full text-dark-900 hover:bg-brand-700/10 hover:text-brand-700">
                <Heart className="size-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-brand-cta text-[9px] font-bold leading-none text-white">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" aria-label="Cart" className="relative grid size-9 place-items-center rounded-full text-dark-900 hover:bg-brand-700/10 hover:text-brand-700">
                <ShoppingBag className="size-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-brand-700 text-[9px] font-bold leading-none text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex h-10 items-center gap-5 overflow-x-auto border-t border-brand-300 md:justify-center md:gap-8 [scrollbar-width:none]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 text-[13px] whitespace-nowrap transition-colors md:text-sm ${
                    isActive
                      ? "font-semibold text-brand-700 underline decoration-2 underline-offset-4"
                      : "font-medium text-dark-700 hover:text-brand-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
