"use client";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useCart } from "@/lib/cart/cartContext";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCheckoutSelection,
    totalItems,
    totalPrice,
  } = useCart();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-page pt-36 pb-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10">
          {/* Steps */}
          <div className="mb-8 flex items-center justify-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-brand-700">
              <span className="grid size-6 place-items-center rounded-full bg-brand-700 text-[11px] font-bold text-white">1</span>
              Shopping Cart
            </span>
            <ChevronRight className="size-4 text-muted-400" />
            <span className="flex items-center gap-1.5 text-muted-400">
              <span className="grid size-6 place-items-center rounded-full border border-muted-300 text-[11px] font-bold text-muted-400">2</span>
              Payment
            </span>
            <ChevronRight className="size-4 text-muted-400" />
            <span className="flex items-center gap-1.5 text-muted-400">
              <span className="grid size-6 place-items-center rounded-full border border-muted-300 text-[11px] font-bold text-muted-400">3</span>
              Confirmation
            </span>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag className="mb-4 size-16 text-brand-300" />
              <h2 className="text-xl font-semibold text-dark-900">Your cart is empty</h2>
              <p className="mt-2 text-sm text-muted-500">Add some products to get started.</p>
              <Link
                href="/products"
                className="mt-6 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="overflow-hidden rounded-2xl border border-brand-300 bg-white">
                  <div className="border-b border-brand-200 px-5 py-4">
                    <h2 className="font-semibold text-dark-900">
                      Cart <span className="text-muted-500 font-normal">({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                    </h2>
                  </div>

                  <ul className="divide-y divide-brand-100">
                    {items.map(({ product, quantity }) => {
                      const img = product.images?.[0] ?? product.imageUrl;
                      const price = product.finalPrice ?? product.price ?? 0;
                      const original = product.discountPercentage && product.discountPercentage > 0 ? product.price : null;
                      return (
                        <li key={product._id} className="flex gap-4 px-5 py-4">
                          {/* Image */}
                          <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-brand-200 bg-bg-blush sm:size-24">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ShoppingBag className="size-8 text-brand-300" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex flex-1 flex-col gap-1 min-w-0">
                            <Link
                              href={`/products/${product._id}`}
                              className="line-clamp-2 text-sm font-semibold text-dark-900 hover:text-brand-700"
                            >
                              {product.name}
                            </Link>
                            <p className="text-[11px] text-muted-400 capitalize">{typeof product.category === "string" ? product.category : product.category?.name}</p>

                            <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                              {/* Price */}
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-bold text-brand-700">৳{(price * quantity).toLocaleString()}</span>
                                {original && (
                                  <span className="text-xs text-muted-400 line-through">৳{(original * quantity).toLocaleString()}</span>
                                )}
                              </div>

                              {/* Qty + remove */}
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 items-center rounded-lg border border-brand-300">
                                  <button
                                    onClick={() => updateQuantity(product._id, quantity - 1)}
                                    className="px-2.5 text-muted-500 hover:text-brand-700"
                                    aria-label="Decrease"
                                  >
                                    <Minus className="size-3" />
                                  </button>
                                  <span className="w-7 text-center text-sm font-semibold">{quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(product._id, quantity + 1)}
                                    className="px-2.5 text-muted-500 hover:text-brand-700"
                                    aria-label="Increase"
                                  >
                                    <Plus className="size-3" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeFromCart(product._id)}
                                  aria-label="Remove item"
                                  className="text-muted-400 transition hover:text-red-500"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="border-t border-brand-200 px-5 py-4">
                    <Link href="/products" className="text-sm font-semibold text-brand-700 hover:underline">
                      ← Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 overflow-hidden rounded-2xl border border-brand-300 bg-white">
                  <div className="border-b border-brand-200 px-5 py-4">
                    <h2 className="font-semibold text-dark-900">Order Summary</h2>
                  </div>
                  <div className="space-y-3 px-5 py-4 text-sm">
                    <div className="flex justify-between text-muted-500">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>৳{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-500">
                      <span>Delivery Fee</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="border-t border-brand-200 pt-3 flex justify-between font-bold text-dark-900">
                      <span>Total</span>
                      <span className="text-brand-700">৳{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <Link
                      href="/checkout"
                      onClick={clearCheckoutSelection}
                      className="block w-full rounded-xl bg-brand-700 py-3 text-center text-sm font-bold text-white transition hover:bg-brand-800 active:scale-[0.98]"
                    >
                      Proceed to Checkout
                    </Link>
                    <p className="mt-3 text-center text-[11px] text-muted-400">
                      Free delivery on orders over ৳1,000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
