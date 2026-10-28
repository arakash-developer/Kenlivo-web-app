"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LogIn, Search, ShoppingBag, Truck, User, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/lib/cart/cartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/category/makeup", label: "Makeup" },
  { href: "/category/skincare", label: "Skincare" },
  { href: "/category/haircare", label: "Haircare" },
  { href: "/category/fragrance", label: "Fragrance" },
  { href: "/category/tools-accessories", label: "Tools & Accessories" },
  { href: "/brands", label: "Brands" },
  { href: "/offers", label: "Offers" },
];

export function Navbar() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
              <span className="grid size-9 place-items-center rounded-full bg-brand-700 text-white md:size-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-heading text-xl font-bold text-dark-900 md:text-2xl">Kenlivo</span>
                <span className="text-[9px] font-semibold tracking-[0.16em] text-brand-700 uppercase">Beauty Meets Lifestyle</span>
              </span>
            </Link>

            {/* Search */}
            <form role="search" action="/products" className="relative mx-auto hidden h-10 w-full max-w-lg flex-1 items-center sm:flex md:h-11">
              <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-500" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder="Search products, brands and more..."
                className="h-full w-full rounded-full border border-brand-400 bg-white pr-12 pl-10 text-sm text-dark-900 outline-none placeholder:text-muted-400 focus:border-brand-700/50 focus:ring-2 focus:ring-brand-700/10"
              />
              <button type="submit" className="absolute right-1.5 grid h-8 w-9 place-items-center rounded-full bg-brand-700 text-white hover:bg-brand-800">
                <Search className="size-3.5" />
              </button>
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
              <Link href="/wishlist" aria-label="Wishlist" className="grid size-9 place-items-center rounded-full text-dark-900 hover:bg-brand-700/10 hover:text-brand-700">
                <Heart className="size-5" />
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
