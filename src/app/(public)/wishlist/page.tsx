"use client";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useWishlist } from "@/lib/wishlist/wishlistContext";
import { useCart } from "@/lib/cart/cartContext";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { items, removeFromWishlist, totalItems } = useWishlist();
  const { addToCart, items: cartItems } = useCart();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-page pt-36 pb-16">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark-900 sm:text-3xl">My Wishlist</h1>
            <p className="mt-1 text-sm text-muted-500">
              {totalItems === 0
                ? "You haven't saved any products yet."
                : `${totalItems} saved ${totalItems === 1 ? "product" : "products"}`}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Heart className="mb-4 size-16 text-brand-300" />
              <h2 className="text-xl font-semibold text-dark-900">Your wishlist is empty</h2>
              <p className="mt-2 text-sm text-muted-500">
                Tap the heart icon on any product to save it here.
              </p>
              <Link
                href="/products"
                className="mt-6 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => {
                const img = product.images?.[0] ?? product.imageUrl;
                const price = product.finalPrice ?? product.price ?? 0;
                const inCart = cartItems.some((i) => i.product._id === product._id);

                return (
                  <div
                    key={product._id}
                    className="group relative overflow-hidden rounded-2xl border border-brand-300 bg-white shadow-sm transition hover:shadow-md"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      aria-label="Remove from wishlist"
                      className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white/90 text-muted-400 shadow-sm transition hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>

                    {/* Image */}
                    <Link href={`/products/${product._id}`} className="block aspect-square overflow-hidden bg-bg-blush">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="size-10 text-brand-300" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                        {typeof product.category === "string"
                          ? product.category
                          : (product.category as any)?.name}
                      </p>
                      <Link href={`/products/${product._id}`}>
                        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold text-dark-900 hover:text-brand-700">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="mt-2 text-base font-bold text-brand-700">
                        ৳{Number(price).toLocaleString()}
                      </p>

                      <button
                        onClick={() => addToCart(product)}
                        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] ${
                          inCart
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-brand-700 hover:bg-brand-800"
                        }`}
                      >
                        <ShoppingBag className="size-4" />
                        {inCart ? "Added to Cart ✓" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
